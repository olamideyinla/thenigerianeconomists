import { db } from '@/lib/db'
import { format } from 'date-fns'
import { SubmissionActions } from './SubmissionActions'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Submissions' }

const STATUS_LABEL: Record<string, string> = {
  PENDING:  'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:  '#b45309',
  ACCEPTED: '#15803d',
  REJECTED: '#6b7280',
}

export default async function AdminSubmissionsPage() {
  const submissions = await db.submission.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const pending = submissions.filter((s) => s.status === 'PENDING').length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Submissions</h1>
          <p className="admin-page-desc">
            {submissions.length} total · {pending} pending
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 14 }}>
          No submissions yet.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Headline</th>
                <th>Author</th>
                <th>Words</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td style={{ maxWidth: 340 }}>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.headline}</div>
                    {s.deck && (
                      <div style={{ color: '#6b7280', fontSize: 13 }}>{s.deck}</div>
                    )}
                  </td>
                  <td>
                    <div>{s.name}</div>
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>{s.email}</div>
                    {s.affiliation && (
                      <div style={{ color: '#9ca3af', fontSize: 12 }}>{s.affiliation}</div>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{s.wordCount.toLocaleString()}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 9999,
                      fontSize: 12,
                      fontWeight: 600,
                      background: STATUS_COLOR[s.status] + '1a',
                      color: STATUS_COLOR[s.status],
                      border: `1px solid ${STATUS_COLOR[s.status]}33`,
                    }}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: 13 }}>
                    {format(new Date(s.createdAt), 'd MMM yyyy')}
                  </td>
                  <td>
                    <SubmissionActions submissionId={s.id} currentStatus={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
