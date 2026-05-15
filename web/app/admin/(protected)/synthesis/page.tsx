import Link from 'next/link'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Synthesis' }

export default async function AdminSynthesisPage() {
  const syntheses = await db.synthesis.findMany({
    orderBy: { issueNumber: 'desc' },
    take: 30,
    include: { editor: true, _count: { select: { articles: true } } },
  })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Synthesis</h1>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Editor</th>
              <th>Week of</th>
              <th>Articles</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {syntheses.map((s) => (
              <tr key={s.id}>
                <td className="text-gray-500 font-mono text-sm">{s.issueNumber}</td>
                <td className="font-medium">{s.title}</td>
                <td className="text-sm text-gray-600">{s.editor.name}</td>
                <td className="text-sm text-gray-500">{format(new Date(s.weekOf), 'd MMM yyyy')}</td>
                <td className="text-sm text-gray-500">{s._count.articles}</td>
                <td className="text-sm text-gray-500">
                  {s.publishedAt ? format(new Date(s.publishedAt), 'd MMM yyyy') : '—'}
                </td>
                <td>
                  <Link href={`/admin/synthesis/${s.id}`} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {syntheses.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">No synthesis issues yet.</div>
        )}
      </div>
    </div>
  )
}
