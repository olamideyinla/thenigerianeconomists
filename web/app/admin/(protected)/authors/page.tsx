import Link from 'next/link'
import { db } from '@/lib/db'
import { NewAuthorButton } from './NewAuthorButton'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Authors' }

export default async function AdminAuthorsPage() {
  const [authors, contributors] = await Promise.all([
    db.author.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    }),
    // Users who submitted articles (CONTRIBUTOR role) — show alongside authors
    db.user.findMany({
      where: { role: 'CONTRIBUTOR' },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { submissions: true } } },
    }),
  ])

  // Author slugs that already exist — to detect unlinked contributors
  const authorNames = new Set(authors.map((a) => a.name.toLowerCase()))
  const unlinkedContributors = contributors.filter(
    (u) => !authorNames.has((u.name ?? u.email).toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Authors</h1>
          <p className="admin-page-desc">{authors.length} author{authors.length !== 1 ? 's' : ''}</p>
        </div>
        <NewAuthorButton />
      </div>

      {/* ── Published authors ──────────────────────────────────────── */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Role</th>
              <th>Affiliation</th>
              <th>Articles</th>
              <th>Staff</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {authors.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.name}</td>
                <td className="text-xs font-mono text-gray-500">{a.slug}</td>
                <td className="text-sm text-gray-600">{a.role}</td>
                <td className="text-sm text-gray-600">{a.affiliation || '—'}</td>
                <td className="text-sm text-gray-500">{a._count.articles}</td>
                <td className="text-sm">{a.isStaff ? '✓' : ''}</td>
                <td>
                  <Link href={`/admin/authors/${a.id}`} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {authors.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No authors yet. Add one above.</div>
        )}
      </div>

      {/* ── Article submitters (unlinked contributors) ─────────────── */}
      {unlinkedContributors.length > 0 && (
        <div className="admin-card" style={{ marginTop: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            Article submitters
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            These users submitted articles via /contribute but don&apos;t yet have an Author profile.
            An Author profile is created automatically when you accept a submission and click &ldquo;Accept &amp; create draft&rdquo;.
          </p>
          <div className="admin-table-wrap" style={{ border: 'none' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {unlinkedContributors.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name ?? '—'}</td>
                    <td className="text-sm text-gray-500">{u.email}</td>
                    <td className="text-sm text-gray-500">{u._count.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
