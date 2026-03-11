'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SEGMENTS = [
  { id: 'all-members', label: 'All Members' },
  { id: 'parents-teens', label: 'Parents & Teens' },
  { id: 'community-20s', label: 'Community 20s' },
  { id: 'community-30s', label: 'Community 30s' },
  { id: 'community-40s', label: 'Community 40s' },
  { id: 'volunteers', label: 'Volunteers' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'staff-only', label: 'Staff Only' },
]

const LINK_TYPES = ['none', 'event', 'announcement', 'prayer', 'url'] as const

export default function NewNotificationPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    body: '',
    segments: [] as string[],
    link_type: 'none' as typeof LINK_TYPES[number],
    link_value: '',
  })

  function toggleSegment(id: string) {
    setForm((f) => ({
      ...f,
      segments: f.segments.includes(id)
        ? f.segments.filter((s) => s !== id)
        : [...f.segments, id],
    }))
  }

  async function handleSend() {
    setError(null)
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and message are required.')
      return
    }
    if (form.segments.length === 0) {
      setError('Select at least one audience segment.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()

      // 1. Save to DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: notif, error: dbError } = await (supabase as any)
        .from('push_notifications')
        .insert({
          title: form.title,
          body: form.body,
          audience_segments: form.segments,
          link_type: form.link_type,
          link_value: form.link_value || null,
          status: 'draft',
        })
        .select('id')
        .single()

      if (dbError || !notif) {
        setError(dbError?.message ?? 'Failed to save notification.')
        return
      }

      // 2. Call Edge Function to send via OneSignal
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ notification_id: notif.id }),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? `Send failed: ${res.status}`)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/notifications'), 1500)
    })
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-[#1A1611]">Notification sent!</p>
          <p className="text-sm text-[#5A5248]">Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1611]">New Push Notification</h1>
        <p className="text-sm text-[#5A5248]">Compose a message for your congregation</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1611] mb-1">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={64}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            placeholder="Sunday Service Reminder"
          />
          <p className="text-xs text-[#5A5248] mt-1 text-right">{form.title.length}/64</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1611] mb-1">Message</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={4}
            maxLength={200}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            placeholder="Join us this Sunday at 10 AM for worship…"
          />
          <p className="text-xs text-[#5A5248] mt-1 text-right">{form.body.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1611] mb-2">Audience Segments</label>
          <div className="flex flex-wrap gap-2">
            {SEGMENTS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleSegment(id)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  form.segments.includes(id)
                    ? 'bg-[#C8973A] border-[#C8973A] text-white'
                    : 'border-gray-200 text-[#5A5248] hover:border-[#C8973A] hover:text-[#C8973A]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#1A1611] mb-1">Link Type</label>
            <select
              value={form.link_type}
              onChange={(e) => setForm((f) => ({ ...f, link_type: e.target.value as typeof LINK_TYPES[number] }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            >
              {LINK_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {form.link_type !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-[#1A1611] mb-1">Link Value</label>
              <input
                value={form.link_value}
                onChange={(e) => setForm((f) => ({ ...f, link_value: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
                placeholder="ID or URL"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="flex-1 border border-gray-200 text-[#5A5248] py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isPending}
            className="flex-1 bg-[#C8973A] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#b8872a] disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Sending…' : 'Send Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
