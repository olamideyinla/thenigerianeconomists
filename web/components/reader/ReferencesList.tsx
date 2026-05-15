import type { RefItem as CitationRef } from '@/context/ReferenceContext'

interface ReferencesListProps {
  refs: CitationRef[]
  activeN?: number
}

export function ReferencesList({ refs, activeN }: ReferencesListProps) {
  return (
    <section className="refs" id="references" aria-labelledby="refs-title">
      <h2 id="refs-title" className="refs-title">
        <span className="kicker">References</span>
        <span className="refs-count">{refs.length} citations</span>
      </h2>
      <ol className="refs-list">
        {refs.map((r, i) => {
          const n = i + 1
          return (
            <li
              key={i}
              id={`ref-${n}`}
              className={`ref-item${activeN === n ? ' active' : ''}`}
            >
              <span className="ref-num">{n}</span>
              <div className="ref-body">
                <div className="ref-line">
                  <span className="ref-author">{r.author}</span>
                  <span className="ref-year"> ({r.year}).</span>{' '}
                  <span className="ref-title">{r.title}.</span>
                </div>
                {r.pub && <div className="ref-pub">{r.pub}</div>}
                {r.url && (
                  <a
                    className="ref-url"
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.url} &#8599;
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="refs-policy">
        Every numbered citation in our articles is verified against a primary source
        by an editor before publication. Errors are corrected publicly in the{' '}
        <a href="/corrections">corrections log</a>.
      </p>
    </section>
  )
}
