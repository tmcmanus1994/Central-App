/**
 * sync-google-calendar — Supabase Edge Function
 *
 * Pulls events from all church Google Calendars and upserts them into the
 * `events` table as `pending`. Staff approve or decline in the admin panel
 * before events become visible in the app.
 *
 * Schedule: every hour via Supabase cron
 *   SELECT cron.schedule('sync-google-calendar', '0 * * * *',
 *     $$SELECT net.http_post(
 *       url := 'https://<project>.supabase.co/functions/v1/sync-google-calendar',
 *       headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
 *     )$$
 *   );
 *
 * Required secrets (set via `supabase secrets set`):
 *   GOOGLE_CALENDAR_IDS      — comma-separated list of Google Calendar IDs
 *                              e.g. "cal1@group.calendar.google.com,cal2@group.calendar.google.com"
 *   GOOGLE_CALENDAR_API_KEY  — Google Cloud API key with Calendar API enabled
 *                              (each calendar must be set to "Public" visibility)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3'

// ── Google Calendar API types ────────────────────────────────────────────────

interface GCalDateTime {
  dateTime?: string
  date?: string
  timeZone?: string
}

interface GCalEvent {
  id: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  summary?: string
  description?: string
  location?: string
  start: GCalDateTime
  end: GCalDateTime
  recurrence?: string[]
}

interface GCalListResponse {
  items: GCalEvent[]
  nextPageToken?: string
}

// ── Field mapping ────────────────────────────────────────────────────────────

function toIso(dt: GCalDateTime): string {
  // All-day events use `date` instead of `dateTime`
  if (dt.dateTime) return dt.dateTime
  if (dt.date) return `${dt.date}T00:00:00Z`
  throw new Error('GCal event has no start/end dateTime or date')
}

function extractRrule(recurrence: string[] | undefined): string | null {
  // GCal recurrence array looks like ["RRULE:FREQ=WEEKLY;BYDAY=SU", "EXDATE:..."]
  const rruleLine = recurrence?.find((r) => r.startsWith('RRULE:'))
  return rruleLine ? rruleLine.replace('RRULE:', '') : null
}

interface EventInsert {
  title: string
  description: string | null
  location: string
  starts_at: string
  ends_at: string
  is_recurring: boolean
  recurrence_rule: string | null
  google_calendar_event_id: string
  google_calendar_id: string
  category: string
  event_type: 'general' | 'info_cta' | 'signup'
  cta_type: 'none' | 'signup_link' | 'contact_person' | 'register_form'
  is_featured: boolean
}

function mapEvent(gcal: GCalEvent, calendarId: string): EventInsert {
  const rrule = extractRrule(gcal.recurrence)
  return {
    title: gcal.summary ?? 'Untitled Event',
    description: gcal.description ?? null,
    location: gcal.location ?? '',
    starts_at: toIso(gcal.start),
    ends_at: toIso(gcal.end),
    is_recurring: rrule !== null,
    recurrence_rule: rrule,
    google_calendar_event_id: gcal.id,
    google_calendar_id: calendarId,
    // Defaults — staff can edit these in the admin panel after approving
    category: 'General',
    event_type: 'general',
    cta_type: 'none',
    is_featured: false,
  }
}

// ── Fetch all pages from Google Calendar ────────────────────────────────────

async function fetchAllGCalEvents(
  calendarId: string,
  apiKey: string,
): Promise<GCalEvent[]> {
  const events: GCalEvent[] = []

  // Fetch 1 year back to catch all active recurring series,
  // and 90 days forward for one-time events.
  const timeMin = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  const encodedId = encodeURIComponent(calendarId)

  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      key: apiKey,
      timeMin,
      timeMax,
      // singleEvents: false → returns master recurring events (not expanded instances)
      // This is what we want — our app expands them via rrule at runtime
      orderBy: 'updated',
      maxResults: '250',
    })

    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(`${GCAL_BASE}/calendars/${encodedId}/events?${params}`)

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Google Calendar API ${res.status}: ${body}`)
    }

    const data: GCalListResponse = await res.json()
    events.push(...(data.items ?? []))
    pageToken = data.nextPageToken
  } while (pageToken)

  return events
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (_req) => {
  try {
    const calendarIdsRaw = Deno.env.get('GOOGLE_CALENDAR_IDS')
    const apiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY')

    if (!calendarIdsRaw || !apiKey) {
      return json(
        { error: 'Missing GOOGLE_CALENDAR_IDS or GOOGLE_CALENDAR_API_KEY secrets' },
        400,
      )
    }

    const calendarIds = calendarIdsRaw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // bypass RLS for upserts
    )

    let totalFetched = 0
    let inserted = 0
    let updated = 0
    const errors: string[] = []

    for (const calendarId of calendarIds) {
      let gcalEvents: GCalEvent[]
      try {
        gcalEvents = await fetchAllGCalEvents(calendarId, apiKey)
      } catch (e) {
        errors.push(`fetch ${calendarId}: ${e instanceof Error ? e.message : String(e)}`)
        continue
      }

      const active = gcalEvents.filter((e) => e.status !== 'cancelled')
      totalFetched += active.length

      for (const gcalEvent of active) {
        try {
          const mapped = mapEvent(gcalEvent, calendarId)

          // Check if we already have this event
          const { data: existing } = await supabase
            .from('events')
            .select('id, status')
            .eq('google_calendar_event_id', gcalEvent.id)
            .maybeSingle()

          if (existing) {
            // Update mutable fields — NEVER touch `status` (preserves approved/declined)
            const { error } = await supabase
              .from('events')
              .update({
                title: mapped.title,
                description: mapped.description,
                location: mapped.location,
                starts_at: mapped.starts_at,
                ends_at: mapped.ends_at,
                is_recurring: mapped.is_recurring,
                recurrence_rule: mapped.recurrence_rule,
              })
              .eq('id', existing.id)

            if (error) errors.push(`update ${gcalEvent.id}: ${error.message}`)
            else updated++
          } else {
            // Brand-new event — insert as pending for staff review
            const { error } = await supabase
              .from('events')
              .insert({ ...mapped, status: 'pending' })

            if (error) errors.push(`insert ${gcalEvent.id}: ${error.message}`)
            else inserted++
          }
        } catch (e) {
          errors.push(
            `${gcalEvent.id}: ${e instanceof Error ? e.message : String(e)}`,
          )
        }
      }
    }

    return json({
      success: true,
      calendars: calendarIds.length,
      fetched: totalFetched,
      inserted,
      updated,
      ...(errors.length > 0 && { errors }),
    })
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      500,
    )
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
