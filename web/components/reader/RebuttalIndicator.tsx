export interface RebuttalEntry {
  title: string
  author: string
  date: string
}

interface RebuttalIndicatorProps {
  rebuttals: RebuttalEntry[]
  variant?: 'block' | 'inline'
}

export function RebuttalIndicator({
  rebuttals,
  variant = 'block',
}: RebuttalIndicatorProps) {
  if (!rebuttals || rebuttals.length === 0) return null

  if (variant === 'inline') {
    return (
      <span className="rb-inline">
        <span className="rb-glyph" aria-hidden="true">&#8644;</span>
        Rebutted by {rebuttals.length}
      </span>
    )
  }

  return (
    <div className="rb-block" role="note" aria-label="This piece has been rebutted">
      <div className="rb-row">
        <span className="rb-glyph" aria-hidden="true">&#8644;</span>
        <span className="rb-label">This piece has been rebutted</span>
        <span className="rb-count">{rebuttals.length}</span>
      </div>
      <ul className="rb-list">
        {rebuttals.slice(0, 3).map((r, i) => (
          <li key={i}>
            <span className="rb-r-title">{r.title}</span>
            <span className="rb-r-meta">
              {r.author} · {r.date}
            </span>
          </li>
        ))}
      </ul>
      <span className="rb-cta">Open the response thread &#8594;</span>
    </div>
  )
}
