import { createClient } from '@/lib/supabase/server'
import EventsClient from './EventsClient'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })

  if (status !== 'all') {
    query.eq('status', status)
  }

  const { data: events, error } = await query

  return <EventsClient events={events ?? []} currentStatus={status} error={error?.message} />
}
