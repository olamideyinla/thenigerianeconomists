interface BylineProps {
  name: string
  salutation?: string | null
  role: string
  date?: string
  readMins?: number
  compact?: boolean
}

export function Byline({ name, salutation, role, date, readMins, compact }: BylineProps) {
  const displayName = salutation ? `${salutation} ${name}` : name
  return (
    <div className={`byline${compact ? ' byline-compact' : ''}`}>
      <div className="byline-row">
        <span className="byline-by">By</span>
        <span className="byline-name">{displayName}</span>
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
