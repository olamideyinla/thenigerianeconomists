import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const [
    draftCount,
    inReviewCount,
    scheduledCount,
    publishedCount,
    pendingNotes,
    recentArticles,
  ] = await Promise.all([
    db.article.count({ where: { status: 'DRAFT' } }),
    db.article.count({ where: { status: 'IN_REVIEW' } }),
    db.article.count({ where: { status: 'SCHEDULED' } }),
    db.article.count({ where: { status: 'PUBLISHED' } }),
    db.readerNote.count({ where: { status: 'PENDING' } }),
    db.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { author: true, topic: true },
    }),
  ])

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-desc">Editorial overview</p>
        </div>
        <Link href="/admin/articles/new" style={{ display: 'none' }}>
          {/* New article action will go here */}
        </Link>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-label">Drafts</div>
          <div className="admin-stat-value">{draftCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">In review</div>
          <div className="admin-stat-value">{inReviewCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Scheduled</div>
          <div className="admin-stat-value">{scheduledCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Published</div>
          <div className="admin-stat-value">{publishedCount}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Pending notes</div>
          <div className="admin-stat-value">{pendingNotes}</div>
        </div>
      </div>

      {/* Recent published */}
      <div className="admin-card">
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Recently published
        </h2>
        {recentArticles.length === 0 ? (
          <p className="text-sm text-gray-400">No published articles yet.</p>
        ) : (
          <div className="admin-table-wrap" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Author</th>
                  <th>Topic</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/admin/articles/${a.id}`} className="hover:underline font-medium">
                        {a.headline}
                      </Link>
                    </td>
                    <td className="text-gray-600">{a.author.name}</td>
                    <td className="text-gray-600">{a.topic.name}</td>
                    <td className="text-gray-500 text-sm">{a.publishedAt ? formatDate(a.publishedAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
