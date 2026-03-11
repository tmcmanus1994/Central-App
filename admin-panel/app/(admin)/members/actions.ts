'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role } from '@/types/database'

export async function verifyMember(id: string, is_verified: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ is_verified }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/members')
}

export async function updateRole(id: string, role: Role) {
  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/members')
}
