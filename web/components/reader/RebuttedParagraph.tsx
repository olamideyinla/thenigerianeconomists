import type { ReactNode } from 'react'

interface RebuttedParagraphProps {
  children: ReactNode
}

/**
 * MDX directive target: :::rebutted text :::
 * Renders the paragraph with the rebutted visual treatment
 * (accent left-border, margin tick glyph).
 */
export function RebuttedParagraph({ children }: RebuttedParagraphProps) {
  return (
    <p className="para para-rebutted" data-rebutted="true">
      <span
        className="margin-tick"
        aria-label="This paragraph has been rebutted"
        role="img"
      >
        <span className="margin-tick-bar" />
        <span className="margin-tick-label">Rebutted</span>
      </span>
      {children}
    </p>
  )
}
