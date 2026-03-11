'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile, Role } from '@/types/database'
import { verifyMember, updateRole } from './actions'

const ROLES: Role[] = ['guest', 'member', 'staff', 'elder']

const ROLE_COLORS: Record<Role, string> = {
  guest: 'bg-gray-100 text-gray-600',
  member: 'bg-blue-100 text-blue-700',
  staff: 'bg-purple-100 text-purple-700',
  elder: 'bg-[#C8973A]/10 text-[#C8973A]',
}

interface Props {
  members: Profile[]
  currentFilter?: string
  error?: string
}

function MemberRow({ member }: { member: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [role, setRole] = useState<Role>(member.role)

  function handleRoleChange(newRole: Role) {
    setRole(newRole)
    startTransition(() => updateRole(member.id, newRole))
  }

  return (
    <div className="bg-white rounded-xl border border-[rgba(200,151,58,0.2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center shrink-0 overflow-hidden">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#C8973A] font-semibold text-sm">
                {member.full_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-[#1A1611] truncate">
                {member.full_name ?? 'No name'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role]}`}>
                {member.role}
              </span>
              {!member.is_verified && member.role !== 'guest' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                  Unverified
                </span>
              )}
              {member.is_verified && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-[#5A5248] truncate">{member.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Role selector */}
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            disabled={isPending}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C8973A] disabled:opacity-50"
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>

          {/* Verify toggle */}
          {!member.is_verified ? (
            <button
              onClick={() => startTransition(() => verifyMember(member.id, true))}
              disabled={isPending}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Verify
            </button>
          ) : (
            <button
              onClick={() => startTransition(() => verifyMember(member.id, false))}
              disabled={isPending}
              className="text-xs border border-gray-200 text-[#5A5248] px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Unverify
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MembersClient({ members, currentFilter, error }: Props) {
  const router = useRouter()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1611]">Members</h1>
          <p className="text-sm text-[#5A5248]">{members.length} shown</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-[rgba(200,151,58,0.2)] rounded-xl p-1 w-fit">
        <button
          onClick={() => router.push('/members')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !currentFilter ? 'bg-[#C8973A] text-white' : 'text-[#5A5248] hover:text-[#1A1611]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => router.push('/members?verified=false')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            currentFilter === 'false' ? 'bg-[#C8973A] text-white' : 'text-[#5A5248] hover:text-[#1A1611]'
          }`}
        >
          Awaiting Verification
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>
      )}

      {members.length === 0 ? (
        <div className="text-center py-16 text-[#5A5248]">
          <p className="text-lg mb-1">No members to show</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
