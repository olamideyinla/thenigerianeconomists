import type { ReactNode } from 'react'

interface ParagraphProps {
  children: ReactNode
  kind?: 'normal' | 'dropcap' | 'rebutted'
}

export function Paragraph({ children, kind = 'normal' }: ParagraphProps) {
  const isDrop = kind === 'dropcap'
  const isRebut = kind === 'rebutted'

  return (
    <p
      className={[
        'para',
        isDrop ? 'para-drop' : '',
        isRebut ? 'para-rebutted' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-rebutted={isRebut || undefined}
    >
      {isRebut && (
        <span
          className="margin-tick"
          aria-label="This paragraph has been rebutted"
        >
          <span className="margin-tick-bar" />
          <span className="margin-tick-label">Rebutted</span>
        </span>
      )}
      {children}
    </p>
  )
}
