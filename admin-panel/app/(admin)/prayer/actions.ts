'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PrayerStatus } from '@/types/database'

export async function updatePrayerStatus(id: string, status: PrayerStatus) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const update = status === 'approved'
    ? { status, approved_by: user?.id, approved_at: new Date().toISOString() }
    : { status }
  const { error } = await supabase.from('prayer_requests').update(update).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/prayer')
}

export async function togglePinPrayer(id: string, is_pinned: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('prayer_requests').update({ is_pinned }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/prayer')
}
