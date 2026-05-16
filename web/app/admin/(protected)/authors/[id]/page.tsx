import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { AuthorEditForm } from './AuthorEditForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const author = await db.author.findUnique({ where: { id }, select: { name: true } })
  return { title: author?.name ?? 'Author' }
}

export default async function AdminAuthorPage({ params }: PageProps) {
  const { id } = await params
  const author = await db.author.findUnique({
    where: { id },
    include: {
      disclosures: { orderBy: { effectiveFrom: 'desc' } },
    },
  }).catch(() => null)
  if (!author) notFound()

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">{author.name}</h1>
      </div>
      <AuthorEditForm author={author} />
    </div>
  )
}
