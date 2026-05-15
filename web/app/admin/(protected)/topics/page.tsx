import { db } from '@/lib/db'
import { TopicForm } from './TopicForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Topics' }

export default async function AdminTopicsPage() {
  const topics = await db.topic.findMany({
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { articles: true } } },
  })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Topics</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Articles</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td className="text-gray-400 text-sm">{t.displayOrder}</td>
                  <td className="font-medium">{t.name}</td>
                  <td className="text-xs font-mono text-gray-500">{t.slug}</td>
                  <td className="text-sm text-gray-500">{t._count.articles}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {topics.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No topics yet.</div>
          )}
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Add topic
          </h2>
          <TopicForm />
        </div>
      </div>
    </div>
  )
}
