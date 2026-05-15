import { db } from '@/lib/db'
import { format } from 'date-fns'
import { ExportButton } from './ExportButton'

export const metadata = { title: 'Subscribers' }

export default async function AdminSubscribersPage() {
  const subscribers = await db.newsletterSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const active = subscribers.filter((s) => s.confirmedAt && !s.unsubscribedAt)
  const unsubscribed = subscribers.filter((s) => s.unsubscribedAt)
  const pending = subscribers.filter((s) => !s.confirmedAt && !s.unsubscribedAt)

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Subscribers</h1>
          <p className="admin-page-desc">
            {active.length} active · {pending.length} pending · {unsubscribed.length} unsubscribed
          </p>
        </div>
        <ExportButton />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Confirmed</th>
              <th>Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-sm">{s.email}</td>
                <td className="text-xs text-gray-500">{s.source}</td>
                <td>
                  {s.unsubscribedAt ? (
                    <span className="status-badge status-RETRACTED">Unsub</span>
                  ) : s.confirmedAt ? (
                    <span className="status-badge status-PUBLISHED">Active</span>
                  ) : (
                    <span className="status-badge status-DRAFT">Pending</span>
                  )}
                </td>
                <td className="text-xs text-gray-500">
                  {s.confirmedAt ? format(new Date(s.confirmedAt), 'd MMM yyyy') : '—'}
                </td>
                <td className="text-xs text-gray-500">{format(new Date(s.createdAt), 'd MMM yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No subscribers yet.</div>
        )}
      </div>
    </div>
  )
}
