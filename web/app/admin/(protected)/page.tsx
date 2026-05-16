import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const [
    draftCount,
    inReviewCount,
    scheduledCount,
    publishedCount,
    pendingNotes,
    recentArticles,
    pendingSubmissions,
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
    db.submission.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-desc">Editorial overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <Link href="/admin/articles?status=DRAFT" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">Drafts</div>
          <div className="admin-stat-value">{draftCount}</div>
        </Link>
        <Link href="/admin/articles?status=IN_REVIEW" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">In review</div>
          <div className="admin-stat-value">{inReviewCount}</div>
        </Link>
        <Link href="/admin/articles?status=SCHEDULED" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">Scheduled</div>
          <div className="admin-stat-value">{scheduledCount}</div>
        </Link>
        <Link href="/admin/articles?status=PUBLISHED" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">Published</div>
          <div className="admin-stat-value">{publishedCount}</div>
        </Link>
        <Link href="/admin/moderation" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">Pending notes</div>
          <div className="admin-stat-value">{pendingNotes}</div>
        </Link>
        <Link href="/admin/articles?view=submissions" className="admin-stat" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-label">New submissions</div>
          <div className="admin-stat-value" style={pendingSubmissions.length > 0 ? { color: '#b45309' } : {}}>
            {pendingSubmissions.length}
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Pending submissions */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600 }}>
              Pending submissions
            </h2>
            <Link href="/admin/articles?view=submissions" style={{ fontSize: 12, color: '#6b7280' }}>
              View all →
            </Link>
          </div>
          {pendingSubmissions.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No pending submissions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingSubmissions.map((s) => (
                <div key={s.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.headline}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {s.name} · {s.wordCount.toLocaleString()} words · {format(new Date(s.createdAt), 'd MMM yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently published */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600 }}>
              Recently published
            </h2>
            <Link href="/admin/articles?status=PUBLISHED" style={{ fontSize: 12, color: '#6b7280' }}>
              View all →
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>No published articles yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentArticles.map((a) => (
                <div key={a.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 12 }}>
                  <Link href={`/admin/articles/${a.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'inherit', textDecoration: 'none' }}>
                    {a.headline}
                  </Link>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {a.author.name} · {a.topic.name} · {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
