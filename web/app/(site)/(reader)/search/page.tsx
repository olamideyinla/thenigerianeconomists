import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchPageClient } from '@/components/reader/SearchPageClient'

export const metadata: Metadata = {
  title: 'Search — The Nigerian Economists',
  description: 'Search through all published articles, topics, and authors.',
}

interface Props {
  searchParams: Promise<{ q?: string; topic?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q ?? ''
  const topic = params.topic ?? ''

  return (
    <div className="page sp-page">
      <Suspense>
        <SearchPageClient initialQuery={q} initialTopic={topic} />
      </Suspense>
    </div>
  )
}
