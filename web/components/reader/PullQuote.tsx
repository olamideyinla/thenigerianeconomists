import type { ReactNode } from 'react'

interface PullQuoteProps {
  children: ReactNode
}

export function PullQuote({ children }: PullQuoteProps) {
  return (
    <figure className="pullquote">
      <span className="pq-mark" aria-hidden="true">&#8220;</span>
      <blockquote>{children}</blockquote>
    </figure>
  )
}
