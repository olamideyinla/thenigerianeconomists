import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { SynthesisEditor } from './SynthesisEditor'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const s = await db.synthesis.findUnique({ where: { id }, select: { title: true } })
  return { title: s?.title ?? 'Synthesis' }
}

export default async function AdminSynthesisEditorPage({ params }: PageProps) {
  const { id } = await params

  const synthesis = await db.synthesis.findUnique({
    where: { id },
    include: {
      editor: true,
      articles: {
        include: {
          article: { select: { id: true, headline: true, slug: true, author: { select: { name: true } } } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })
  if (!synthesis) notFound()

  const authors = await db.author.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  const subscriberCount = await db.newsletterSubscription.count({
    where: { confirmedAt: { not: null }, unsubscribedAt: null },
  })

  return (
    <SynthesisEditor
      synthesis={synthesis as Parameters<typeof SynthesisEditor>[0]['synthesis']}
      authors={authors}
      subscriberCount={subscriberCount}
    />
  )
}
