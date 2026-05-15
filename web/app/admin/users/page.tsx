import { db } from '@/lib/db'
import { format } from 'date-fns'
import { requireAdmin } from '@/lib/auth-helpers'
import { UserRoleSelect } from './UserRoleSelect'
import { SuspendButton } from './SuspendButton'

export const metadata = { title: 'Users' }

export default async function AdminUsersPage() {
  await requireAdmin()

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      _count: { select: { sessions: true } },
    },
  })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-desc">{users.length} user{users.length !== 1 ? 's' : ''} — admin-only view</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Sessions</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-mono text-sm">{u.email}</td>
                <td className="text-sm text-gray-700">{u.name ?? '—'}</td>
                <td>
                  <UserRoleSelect userId={u.id} currentRole={u.role} />
                </td>
                <td className="text-xs text-gray-500">{u.emailVerified ? '✓' : '—'}</td>
                <td className="text-xs text-gray-500">{u._count.sessions}</td>
                <td className="text-xs text-gray-500">{format(new Date(u.createdAt), 'd MMM yyyy')}</td>
                <td>
                  <SuspendButton userId={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No users yet.</div>
        )}
      </div>
    </div>
  )
}

