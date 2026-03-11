'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Event, EventType, CtaType } from '@/types/database'
import { updateEventStatus, updateEventFields } from './actions'

const STATUSES = ['pending', 'approved', 'declined', 'all'] as const
const CATEGORIES = ['Worship', 'Ministry', 'Teen', 'Womens', 'Mens', 'Recreation', 'Outreach', 'General']
const EVENT_TYPES: EventType[] = ['general', 'info_cta', 'signup']
const CTA_TYPES: CtaType[] = ['none', 'signup_link', 'contact_person', 'register_form']

interface Props {
  events: Event[]
  currentStatus: string
  error?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function EventRow({ event }: { event: Event }) {
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    category: event.category ?? 'General',
    event_type: event.event_type ?? 'general',
    cta_type: event.cta_type ?? 'none',
    cta_value: event.cta_value ?? '',
    contact_name: event.contact_name ?? '',
    contact_phone: event.contact_phone ?? '',
    contact_email: event.contact_email ?? '',
    is_featured: event.is_featured,
    description: event.description ?? '',
  })

  function handleStatus(status: 'approved' | 'declined') {
    startTransition(() => updateEventStatus(event.id, status))
  }

  function handleSave() {
    startTransition(async () => {
      await updateEventFields(event.id, {
        ...form,
        cta_value: form.cta_value || null,
        contact_name: form.contact_name || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        description: form.description || null,
        event_type: form.event_type as EventType,
        cta_type: form.cta_type as CtaType,
      })
      setEditing(false)
    })
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-xl border border-[rgba(200,151,58,0.2)] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[#1A1611] truncate">{event.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[event.status]}`}>
              {event.status}
            </span>
            {event.google_calendar_event_id && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">GCal</span>
            )}
            {event.is_featured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8973A]/10 text-[#C8973A]">Featured</span>
            )}
          </div>
          <p className="text-sm text-[#5A5248] mt-0.5">
            {formatDate(event.starts_at)} · {event.location || 'No location'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {event.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatus('approved')}
                disabled={isPending}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatus('declined')}
                disabled={isPending}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {event.status === 'approved' && (
            <button
              onClick={() => handleStatus('declined')}
              disabled={isPending}
              className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Decline
            </button>
          )}
          {event.status === 'declined' && (
            <button
              onClick={() => handleStatus('approved')}
              disabled={isPending}
              className="text-xs border border-green-300 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-xs border border-gray-200 text-[#5A5248] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">Event Type</span>
            <select
              value={form.event_type}
              onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value as EventType }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            >
              {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">CTA Type</span>
            <select
              value={form.cta_type}
              onChange={(e) => setForm((f) => ({ ...f, cta_type: e.target.value as CtaType }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            >
              {CTA_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">CTA Value / URL</span>
            <input
              value={form.cta_value}
              onChange={(e) => setForm((f) => ({ ...f, cta_value: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
              placeholder="https://… or phone"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">Contact Name</span>
            <input
              value={form.contact_name}
              onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">Contact Phone</span>
            <input
              value={form.contact_phone}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            />
          </label>

          <label className="col-span-2 space-y-1">
            <span className="text-xs font-medium text-[#5A5248]">Description (optional override)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8973A]"
            />
          </label>

          <label className="col-span-2 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              className="accent-[#C8973A]"
            />
            <span className="text-sm text-[#1A1611]">Feature this event on the Home screen</span>
          </label>

          <div className="col-span-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="text-sm bg-[#C8973A] text-white px-4 py-2 rounded-lg hover:bg-[#b8872a] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function EventsClient({ events, currentStatus, error }: Props) {
  const router = useRouter()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1611]">Events</h1>
          <p className="text-sm text-[#5A5248]">{events.length} events</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-6 bg-white border border-[rgba(200,151,58,0.2)] rounded-xl p-1 w-fit">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/events?status=${s}`)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              currentStatus === s
                ? 'bg-[#C8973A] text-white'
                : 'text-[#5A5248] hover:text-[#1A1611]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>
      )}

      {events.length === 0 ? (
        <div className="text-center py-16 text-[#5A5248]">
          <p className="text-lg mb-1">No {currentStatus === 'all' ? '' : currentStatus} events</p>
          <p className="text-sm">Events synced from Google Calendar will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
