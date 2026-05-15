import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const article = await db.article.findUnique({ where: { id }, select: { headline: true } })
  return { title: article?.headline ?? 'New Article' }
}

export default async function ArticleEditorPage({ params }: PageProps) {
  const { id } = await params

  const article = await db.article.findUnique({
    where: { id },
    include: {
      author: true,
      topic: true,
      references: { orderBy: { indexNumber: 'asc' } },
      figures: {
        include: {
          mediaAsset: true,
          chartEmbed: { include: { staticFallbackAsset: true } },
          chartNative: true,
          dataTable: true,
        },
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!article) notFound()

  const authors = await db.author.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  const topics = await db.topic.findMany({ orderBy: { displayOrder: 'asc' }, select: { id: true, name: true } })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <ArticleEditor
      article={article as any}
      authors={authors}
      topics={topics}
    />
  )
}
