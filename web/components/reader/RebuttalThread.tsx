export interface ResponseEntry {
  title: string
  author: string
  date: string
  stance: 'rebuts' | 'extends'
}

interface RebuttalThreadProps {
  originalTitle: string
  originalAuthor: string
  responses: ResponseEntry[]
}

export function RebuttalThread({
  originalTitle,
  originalAuthor,
  responses,
}: RebuttalThreadProps) {
  return (
    <section className="responses" aria-label="Response thread">
      <header className="resp-head">
        <span className="kicker">Response thread</span>
        <span className="resp-count">{responses.length} responses</span>
      </header>
      <p className="resp-note">
        The following pieces were written in direct response to{' '}
        <em>{originalTitle}</em> by {originalAuthor}. Each was peer-reviewed and
        published according to our editorial standards.
      </p>
      <ol className="resp-list">
        {responses.map((r, i) => (
          <li key={i} className="resp-item">
            <span className="resp-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <div className="resp-title">{r.title}</div>
              <div className="resp-meta">
                <em>{r.author}</em> · {r.date} ·{' '}
                <span className={`debate-stance ${r.stance}`}>
                  {r.stance === 'rebuts' ? 'Rebuts' : 'Extends'}
                </span>
              </div>
            </div>
            <span className="resp-arrow" aria-hidden="true">&#8594;</span>
          </li>
        ))}
      </ol>
      <div className="resp-cta">
        <span className="kicker">Submit a response</span>
        <p>
          We accept formal rebuttals and extensions from researchers and qualified
          commentators. Responses are peer-reviewed before publication.
        </p>
        <button className="resp-cta-btn" type="button">
          Submit a response
        </button>
      </div>
    </section>
  )
}
