interface COIDisclosureProps {
  affiliation: string
  items: string[]
}

/**
 * Conflict-of-interest disclosure.
 * Implemented as a Server Component using native <details>/<summary>
 * for zero-JS toggle behaviour. The caret character is swapped via CSS
 * (see globals.css: details.coi[open] .coi-caret::after).
 */
export function COIDisclosure({ affiliation, items }: COIDisclosureProps) {
  return (
    <details className="coi">
      <summary className="coi-summary">
        <span className="coi-dot" aria-hidden="true" />
        <span className="coi-label">Conflicts of interest declared</span>
        <span className="coi-count">{items.length}</span>
        <span className="coi-caret" aria-hidden="true" />
      </summary>
      <div className="coi-body">
        <div className="coi-aff">
          <em>Affiliation</em> &#8212; {affiliation}
        </div>
        <ul className="coi-list">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <div className="coi-policy">
          The Nigerian Economists requires every contributor to declare relevant
          affiliations and material interests.{' '}
          <a href="/editorial-standards">Read the full editorial policy</a>.
        </div>
      </div>
    </details>
  )
}
