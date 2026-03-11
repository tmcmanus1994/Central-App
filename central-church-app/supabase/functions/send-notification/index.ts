import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications'

interface RequestBody {
  notification_id: string
}

interface PushNotificationRow {
  id: string
  title: string
  body: string
  audience_segments: string[]
  link_type: 'none' | 'event' | 'announcement' | 'prayer' | 'url'
  link_value: string | null
  status: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID')!
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY')!

    // Verify caller is authenticated staff/elder
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonError('Unauthorized', 401)
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await callerClient.auth.getUser()
    if (authError || !user) return jsonError('Unauthorized', 401)

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'staff' && profile?.role !== 'elder') {
      return jsonError('Forbidden: staff or elder role required', 403)
    }

    // Parse body
    const { notification_id }: RequestBody = await req.json()
    if (!notification_id) return jsonError('notification_id is required', 400)

    // Fetch the notification record
    const { data: notif, error: notifError } = await adminClient
      .from('push_notifications')
      .select('*')
      .eq('id', notification_id)
      .single<PushNotificationRow>()

    if (notifError || !notif) return jsonError('Notification not found', 404)
    if (notif.status === 'sent') return jsonError('Notification already sent', 409)

    // Build OneSignal payload
    const payload: Record<string, unknown> = {
      app_id: oneSignalAppId,
      headings: { en: notif.title },
      contents: { en: notif.body },
      included_segments: notif.audience_segments,
    }

    // Attach deep link if specified
    if (notif.link_type !== 'none' && notif.link_value) {
      if (notif.link_type === 'url') {
        payload.url = notif.link_value
      } else {
        // Deep link into the app via custom scheme
        const schemeMap: Record<string, string> = {
          event: `centralchurch://event/${notif.link_value}`,
          announcement: `centralchurch://announcement/${notif.link_value}`,
          prayer: `centralchurch://prayer/${notif.link_value}`,
        }
        payload.url = schemeMap[notif.link_type] ?? undefined
        payload.data = { link_type: notif.link_type, link_value: notif.link_value }
      }
    }

    // Send via OneSignal
    const osRes = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const osBody = await osRes.json()

    if (!osRes.ok) {
      console.error('OneSignal error:', osBody)
      return jsonError(osBody.errors?.[0] ?? 'OneSignal send failed', 502)
    }

    const oneSignalNotificationId: string = osBody.id

    // Update DB record as sent
    const sentAt = new Date().toISOString()
    await adminClient
      .from('push_notifications')
      .update({
        status: 'sent',
        sent_at: sentAt,
        onesignal_notification_id: oneSignalNotificationId,
      })
      .eq('id', notification_id)

    return new Response(
      JSON.stringify({ success: true, onesignal_notification_id: oneSignalNotificationId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return jsonError('Internal server error', 500)
  }
})

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
