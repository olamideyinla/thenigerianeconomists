import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/format'
import { NewArticleButton } from './NewArticleButton'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Articles' }

interface PageProps {
  searchParams: Promise<{ status?: string; topic?: string }>
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status, topic } = await searchParams

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (topic) where.topicId = topic

  const [articles, topics] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: { author: true, topic: true },
    }),
    db.topic.findMany({ orderBy: { displayOrder: 'asc' }, select: { id: true, name: true } }),
  ])

  const statuses = ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'RETRACTED']

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Articles</h1>
          <p className="admin-page-desc">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
        </div>
        <NewArticleButton topics={topics} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Link
          href="/admin/articles"
          className={`text-xs px-3 py-1.5 rounded-full border ${!status ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/articles?status=${s}`}
            className={`text-xs px-3 py-1.5 rounded-full border ${status === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
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
                <td className="text-gray-500 text-sm">{formatDate(a.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No articles found.</div>
        )}
      </div>
    </div>
  )
}
