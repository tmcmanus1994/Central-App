'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PrayerRequest } from '@/types/database'
import { updatePrayerStatus, togglePinPrayer } from './actions'

const STATUSES = ['pending', 'approved', 'declined', 'all'] as const

interface Props {
  prayers: PrayerRequest[]
  currentStatus: string
  error?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: 'bg-red-50 text-red-700',
  Church: 'bg-purple-50 text-purple-700',
  Family: 'bg-blue-50 text-blue-700',
  Community: 'bg-green-50 text-green-700',
  Outreach: 'bg-orange-50 text-orange-700',
}

function PrayerRow({ prayer }: { prayer: PrayerRequest }) {
  const [isPending, startTransition] = useTransition()

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 space-y-3 ${
        prayer.is_pinned
          ? 'border-l-4 border-l-[#C8973A] border-[rgba(200,151,58,0.3)]'
          : 'border-[rgba(200,151,58,0.2)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm text-[#1A1611]">
              {prayer.is_anonymous ? 'Anonymous' : prayer.display_name}
            </span>
            {prayer.is_anonymous && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">anonymous</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[prayer.status]}`}>
              {prayer.status}
            </span>
            {prayer.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[prayer.category] ?? 'bg-gray-100 text-gray-600'}`}>
                {prayer.category}
              </span>
            )}
            {prayer.is_pinned && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8973A]/10 text-[#C8973A]">📌 Pinned</span>
            )}
          </div>
          <p className="text-sm text-[#1A1611] leading-relaxed">{prayer.body}</p>
          <p className="text-xs text-[#5A5248] mt-1">
            {new Date(prayer.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })} · {prayer.prayed_count} prayed
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {prayer.status === 'pending' && (
            <>
              <button
                onClick={() => startTransition(() => updatePrayerStatus(prayer.id, 'approved'))}
                disabled={isPending}
                className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => startTransition(() => updatePrayerStatus(prayer.id, 'declined'))}
                disabled={isPending}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {prayer.status === 'approved' && (
            <>
              <button
                onClick={() => startTransition(() => togglePinPrayer(prayer.id, !prayer.is_pinned))}
                disabled={isPending}
                className="text-xs border border-[#C8973A] text-[#C8973A] px-3 py-1.5 rounded-lg hover:bg-[#C8973A]/10 disabled:opacity-50 transition-colors"
              >
                {prayer.is_pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                onClick={() => startTransition(() => updatePrayerStatus(prayer.id, 'declined'))}
                disabled={isPending}
                className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                Decline
              </button>
            </>
          )}
          {prayer.status === 'declined' && (
            <button
              onClick={() => startTransition(() => updatePrayerStatus(prayer.id, 'approved'))}
              disabled={isPending}
              className="text-xs border border-green-300 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PrayerClient({ prayers, currentStatus, error }: Props) {
  const router = useRouter()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1611]">Prayer Requests</h1>
        <p className="text-sm text-[#5A5248]">{prayers.length} requests</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[rgba(200,151,58,0.2)] rounded-xl p-1 w-fit">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/prayer?status=${s}`)}
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

      {prayers.length === 0 ? (
        <div className="text-center py-16 text-[#5A5248]">
          <p className="text-lg mb-1">No {currentStatus === 'all' ? '' : currentStatus} prayer requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prayers.map((prayer) => (
            <PrayerRow key={prayer.id} prayer={prayer} />
          ))}
        </div>
      )}
    </div>
  )
}
