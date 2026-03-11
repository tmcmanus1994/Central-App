'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EventStatus, EventType, CtaType } from '@/types/database'

export async function updateEventStatus(id: string, status: EventStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/events')
}

export async function updateEventFields(
  id: string,
  fields: {
    category: string
    event_type: EventType
    cta_type: CtaType
    cta_value: string | null
    contact_name: string | null
    contact_phone: string | null
    contact_email: string | null
    is_featured: boolean
    description: string | null
  },
) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').update(fields).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/events')
}
