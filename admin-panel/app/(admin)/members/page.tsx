import { createClient } from '@/lib/supabase/server'
import MembersClient from './MembersClient'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>
}) {
  const { verified } = await searchParams
  const supabase = await createClient()

  const query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (verified === 'false') {
    query.eq('is_verified', false).neq('role', 'guest')
  }

  const { data: members, error } = await query

  return <MembersClient members={members ?? []} currentFilter={verified} error={error?.message} />
}
