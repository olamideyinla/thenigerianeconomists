import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata = { title: 'Authors' }

export default async function AdminAuthorsPage() {
  const authors = await db.author.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Authors</h1>
          <p className="admin-page-desc">{authors.length} author{authors.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

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
                <td className="text-sm text-gray-600">{a.affiliation ?? '—'}</td>
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
          <div className="text-center py-12 text-sm text-gray-400">No authors yet.</div>
        )}
      </div>
    </div>
  )
}
