'use client'

/**
 * ArticleClientShell — Client Component wrapper for the article reading page.
 *
 * Responsibilities:
 *  1. Provides ReferenceContext so Citation components can resolve ref data.
 *  2. Provides FigureContext so Figure components can look up figure data.
 *  3. Renders the two-column article-shell grid (article-main + CitationRail).
 *
 * The MDX body and the static article-head/footer are passed as children
 * (Server Component tree) — this satisfies the RSC constraint that Server
 * Components can be passed as props/children to Client Components.
 */

import type { ReactNode } from 'react'
import { ReferenceProvider, type RefItem } from '@/context/ReferenceContext'
import { FigureProvider, type FigureShape } from '@/context/FigureContext'
import { CitationRail } from '@/components/reader/CitationRail'

interface ArticleClientShellProps {
  refs: RefItem[]
  figures: FigureShape[]
  children: ReactNode
}

export function ArticleClientShell({
  refs,
  figures,
  children,
}: ArticleClientShellProps) {
  return (
    <ReferenceProvider refs={refs}>
      <FigureProvider figures={figures}>
        <div className="article-shell">
          {children}
          <CitationRail refs={refs} />
        </div>
      </FigureProvider>
    </ReferenceProvider>
  )
}
