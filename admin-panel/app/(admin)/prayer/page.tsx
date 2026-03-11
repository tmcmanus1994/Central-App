import { createClient } from '@/lib/supabase/server'
import PrayerClient from './PrayerClient'

export default async function PrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'pending' } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('prayer_requests')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (status !== 'all') {
    query.eq('status', status)
  }

  const { data: prayers, error } = await query

  return <PrayerClient prayers={prayers ?? []} currentStatus={status} error={error?.message} />
}
