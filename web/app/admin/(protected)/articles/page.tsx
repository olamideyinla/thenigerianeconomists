import Link from 'next/link'
import { db } from '@/lib/db'
import { type ArticleStatus } from '@prisma/client'
import { formatDate } from '@/lib/format'
import { format } from 'date-fns'
import { NewArticleButton } from './NewArticleButton'
import { SubmissionActions } from '../submissions/SubmissionActions'
import { getArticlePageViews } from '@/lib/plausible'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Articles' }

interface PageProps {
  searchParams: Promise<{ status?: string; topic?: string; view?: string }>
}

const SUB_STATUS_LABEL: Record<string, string> = {
  PENDING:  'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
}
const SUB_STATUS_COLOR: Record<string, string> = {
  PENDING:  '#b45309',
  ACCEPTED: '#15803d',
  REJECTED: '#6b7280',
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status, topic, view } = await searchParams
  const showSubmissions = view === 'submissions'

  const VALID_STATUSES: ArticleStatus[] = ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'RETRACTED']
  const articleStatus = status && VALID_STATUSES.includes(status as ArticleStatus)
    ? (status as ArticleStatus)
    : undefined

  const [articles, topics, submissions, pageViews] = await Promise.all([
    db.article.findMany({
      where: {
        ...(articleStatus ? { status: articleStatus } : {}),
        ...(topic  ? { topicId: topic } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { author: true, topic: true },
    }),
    db.topic.findMany({ orderBy: { displayOrder: 'asc' }, select: { id: true, name: true } }),
    db.submission.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    getArticlePageViews(),
  ])
  const hasViews = Object.keys(pageViews).length > 0

  const statuses = ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'RETRACTED']
  const pendingCount = submissions.filter(s => s.status === 'PENDING').length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Articles</h1>
          <p className="admin-page-desc">
            {showSubmissions
              ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} · ${pendingCount} pending`
              : `${articles.length} article${articles.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {!showSubmissions && <NewArticleButton topics={topics} />}
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
        <Link
          href="/admin/articles"
          style={{
            padding: '8px 18px',
            fontSize: 14,
            fontWeight: 500,
            borderBottom: !showSubmissions ? '2px solid #111' : '2px solid transparent',
            color: !showSubmissions ? '#111' : '#6b7280',
            textDecoration: 'none',
            marginBottom: -1,
          }}
        >
          Articles
        </Link>
        <Link
          href="/admin/articles?view=submissions"
          style={{
            padding: '8px 18px',
            fontSize: 14,
            fontWeight: 500,
            borderBottom: showSubmissions ? '2px solid #111' : '2px solid transparent',
            color: showSubmissions ? '#111' : '#6b7280',
            textDecoration: 'none',
            marginBottom: -1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Submissions
          {pendingCount > 0 && (
            <span style={{
              background: '#b45309',
              color: '#fff',
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 700,
              padding: '1px 6px',
              lineHeight: 1.5,
            }}>
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      {/* ── Articles tab ───────────────────────────────────────────── */}
      {!showSubmissions && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            <Link
              href="/admin/articles"
              className={`text-xs px-3 py-1.5 rounded-full border ${!articleStatus ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
            >
              All
            </Link>
            {statuses.map((s) => (
              <Link
                key={s}
                href={`/admin/articles?status=${s}`}
                className={`text-xs px-3 py-1.5 rounded-full border ${articleStatus === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
              >
                {s.replace('_', ' ')}
              </Link>
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Headline</th>
                  <th>Author</th>
                  <th>Topic</th>
                  <th>Status</th>
                  {hasViews && <th>Views</th>}
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/admin/articles/${a.id}`} className="font-medium hover:underline">
                        {a.headline ?? <em className="text-gray-400">Untitled</em>}
                      </Link>
                    </td>
                    <td className="text-gray-600 text-sm">{a.author.name}</td>
                    <td className="text-gray-600 text-sm">{a.topic.name}</td>
                    <td>
                      <span className={`status-badge status-${a.status}`}>{a.status}</span>
                    </td>
                    {hasViews && (
                      <td className="text-gray-500 text-sm" style={{ whiteSpace: 'nowrap' }}>
                        {a.status === 'PUBLISHED' && a.slug
                          ? (pageViews[a.slug] ?? 0).toLocaleString()
                          : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    )}
                    <td className="text-gray-500 text-sm">{formatDate(a.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {articles.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400">No articles found.</div>
            )}
          </div>
        </>
      )}

      {/* ── Submissions tab ────────────────────────────────────────── */}
      {showSubmissions && (
        submissions.length === 0 ? (
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
                  <th>File</th>
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
                        background: SUB_STATUS_COLOR[s.status] + '1a',
                        color: SUB_STATUS_COLOR[s.status],
                        border: `1px solid ${SUB_STATUS_COLOR[s.status]}33`,
                      }}>
                        {SUB_STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: 13 }}>
                      {format(new Date(s.createdAt), 'd MMM yyyy')}
                    </td>
                    <td>
                      {s.docxUrl ? (
                        <a
                          href={s.docxUrl}
                          download
                          style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                        >
                          .docx ↓
                        </a>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <SubmissionActions submissionId={s.id} currentStatus={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
