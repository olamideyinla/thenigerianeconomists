interface BylineProps {
  name: string
  role: string
  date?: string
  readMins?: number
  compact?: boolean
}

export function Byline({ name, role, date, readMins, compact }: BylineProps) {
  return (
    <div className={`byline${compact ? ' byline-compact' : ''}`}>
      <div className="byline-row">
        <span className="byline-by">By</span>
        <span className="byline-name">{name}</span>
      </div>
      <div className="byline-meta">
        <span>{role}</span>
        {date && <span aria-hidden="true">&#xB7;</span>}
        {date && <span>{date}</span>}
        {readMins != null && <span aria-hidden="true">&#xB7;</span>}
        {readMins != null && <span>{readMins} min read</span>}
      </div>
    </div>
  )
}
