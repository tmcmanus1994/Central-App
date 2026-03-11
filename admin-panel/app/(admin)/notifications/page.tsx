import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { PushNotification } from '@/types/database'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: notifications } = await supabase
    .from('push_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1611]">Push Notifications</h1>
          <p className="text-sm text-[#5A5248]">Send targeted messages to your congregation</p>
        </div>
        <Link
          href="/notifications/new"
          className="bg-[#C8973A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b8872a] transition-colors"
        >
          + New Notification
        </Link>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-16 text-[#5A5248]">
          <p className="text-lg mb-1">No notifications yet</p>
          <Link href="/notifications/new" className="text-[#C8973A] text-sm underline">
            Send your first notification
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(notifications as PushNotification[]).map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-[rgba(200,151,58,0.2)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[#1A1611]">{n.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[n.status]}`}>
                      {n.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#5A5248]">{n.body}</p>
                  <p className="text-xs text-[#5A5248] mt-1">
                    {n.audience_segments.join(', ')} ·{' '}
                    {n.sent_at ? `Sent ${formatDate(n.sent_at)}` : formatDate(n.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
