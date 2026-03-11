import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: pendingEvents },
    { count: pendingPrayers },
    { count: unverifiedMembers },
    { count: totalMembers },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('prayer_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false).neq('role', 'guest'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Events Pending Review', value: pendingEvents ?? 0, href: '/events?status=pending', urgent: (pendingEvents ?? 0) > 0 },
    { label: 'Prayers Pending Review', value: pendingPrayers ?? 0, href: '/prayer?status=pending', urgent: (pendingPrayers ?? 0) > 0 },
    { label: 'Members Awaiting Verification', value: unverifiedMembers ?? 0, href: '/members?verified=false', urgent: (unverifiedMembers ?? 0) > 0 },
    { label: 'Total Members', value: totalMembers ?? 0, href: '/members', urgent: false },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#1A1611] mb-1">Dashboard</h1>
      <p className="text-[#5A5248] text-sm mb-8">Welcome back. Here&apos;s what needs attention.</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map(({ label, value, href, urgent }) => (
          <a
            key={label}
            href={href}
            className="bg-white rounded-xl border border-[rgba(200,151,58,0.2)] p-5 hover:shadow-sm transition-shadow"
          >
            <div className={`text-3xl font-bold mb-1 ${urgent ? 'text-[#C8973A]' : 'text-[#1A1611]'}`}>
              {value}
            </div>
            <div className="text-sm text-[#5A5248]">{label}</div>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[rgba(200,151,58,0.2)] p-5">
        <h2 className="font-semibold text-[#1A1611] mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/events?status=pending" className="text-sm bg-[#F5F0E8] text-[#1A1611] px-4 py-2 rounded-lg hover:bg-[#C8973A] hover:text-white transition-colors">
            Review Pending Events
          </a>
          <a href="/prayer?status=pending" className="text-sm bg-[#F5F0E8] text-[#1A1611] px-4 py-2 rounded-lg hover:bg-[#C8973A] hover:text-white transition-colors">
            Approve Prayer Requests
          </a>
          <a href="/notifications/new" className="text-sm bg-[#C8973A] text-white px-4 py-2 rounded-lg hover:bg-[#b8872a] transition-colors">
            Send Push Notification
          </a>
        </div>
      </div>
    </div>
  )
}
