import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-helpers'
import { format } from 'date-fns'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Audit log' }

interface PageProps {
  searchParams: Promise<{ entity?: string; action?: string }>
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  await requireAdmin()
  const { entity, action } = await searchParams

  const where: Prisma.AuditLogWhereInput = {}
  if (entity) where.entityType = entity
  if (action) where.action = { contains: action }

  // AuditLog.userId is a plain String, not a relation — join manually below
  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  // Fetch user emails for display
  const userIds = [...new Set(logs.map((l) => l.userId))]
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  })
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  const entityTypes = ['Article', 'User', 'MediaAsset', 'Figure', 'Correction', 'ReaderNote', 'Synthesis']

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Audit log</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <a href="/admin/audit" className={`text-xs px-3 py-1.5 rounded-full border ${!entity ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600'}`}>
          All entities
        </a>
        {entityTypes.map((e) => (
          <a key={e} href={`/admin/audit?entity=${e}`}
            className={`text-xs px-3 py-1.5 rounded-full border ${entity === e ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600'}`}>
            {e}
          </a>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>ID</th>
              <th>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const u = userMap[log.userId]
              return (
                <tr key={log.id}>
                  <td className="text-xs text-gray-500 whitespace-nowrap">
                    {format(new Date(log.createdAt), 'd MMM yyyy HH:mm')}
                  </td>
                  <td className="text-xs font-mono">{u?.email ?? log.userId}</td>
                  <td>
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{log.entityType}</td>
                  <td className="text-xs font-mono text-gray-400 max-w-24 truncate">{log.entityId}</td>
                  <td className="text-xs text-gray-500 max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No audit events yet.</div>
        )}
      </div>
    </div>
  )
}
