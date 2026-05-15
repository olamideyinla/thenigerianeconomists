import { db } from '@/lib/db'
import { format } from 'date-fns'
import { ModerationActions } from './ModerationActions'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Moderation' }

export default async function AdminModerationPage() {
  const notes = await db.readerNote.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      article: { select: { headline: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
  })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Moderation</h1>
          <p className="admin-page-desc">{notes.length} pending note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="admin-card text-center py-12 text-sm text-gray-400">
          No notes pending moderation.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="admin-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">{n.user?.name ?? n.user?.email ?? 'Unknown user'}</span>
                    {' · '}
                    on <span className="font-medium">{n.article.headline}</span>
                    {' · '}
                    {format(new Date(n.createdAt), 'd MMM yyyy HH:mm')}
                  </p>
                  <p className="text-sm text-gray-800">{n.body}</p>
                </div>
                <ModerationActions noteId={n.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
