// reading.jsx — citation marker, references list, paragraph renderer, pull quote

const { useState: useState_R, useEffect: useEffect_R, useRef: useRef_R, useCallback } = React;

// Citation marker — superscript that expands inline/sheet/footnote per tweak.
// NOTE: cannot use `ref` as a prop name (React reserves it). We use `cite`.
function Citation({ n, cite, style = "inline", open, onToggle }) {
  return (
    <span className={`cite-wrap ${open ? "open" : ""}`}>
      <button
        className="cite-marker"
        data-cite-n={n}
        aria-expanded={open}
        aria-label={`Reference ${n}: ${cite.author}, ${cite.year}`}
        onClick={onToggle}
      >
        <sup>{n}</sup>
      </button>
    </span>
  );
}

// Inline expansion under a paragraph
function CiteInline({ n, cite, onClose, onJump }) {
  return (
    <div className="cite-inline" role="note">
      <div className="cite-inline-head">
        <span className="cite-inline-num">{n}</span>
        <span className="cite-inline-author">{cite.author}, {cite.year}</span>
        <button className="cite-inline-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="cite-inline-title">{cite.title}</div>
      {cite.pub && <div className="cite-inline-pub">{cite.pub}</div>}
      <div className="cite-inline-actions">
        {cite.url && <a className="cite-inline-link" href={`https://${cite.url}`} onClick={(e)=>e.preventDefault()}>{cite.url} ↗</a>}
        <button className="cite-inline-jump" onClick={() => onJump(n)}>Jump to references ↓</button>
      </div>
    </div>
  );
}

// Bottom-sheet variant
function CiteSheet({ n, cite, onClose, onJump }) {
  return (
    <div className="cite-sheet-scrim" onClick={onClose}>
      <div className="cite-sheet" onClick={(e)=>e.stopPropagation()} role="dialog">
        <div className="cite-sheet-grip" />
        <div className="cite-sheet-head">
          <Kicker>Reference {String(n).padStart(2,"0")}</Kicker>
          <button className="cite-inline-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="cite-sheet-author">{cite.author}, {cite.year}</div>
        <div className="cite-sheet-title">{cite.title}</div>
        {cite.pub && <div className="cite-sheet-pub">{cite.pub}</div>}
        <div className="cite-sheet-actions">
          {cite.url && <a className="cite-sheet-link">{cite.url} ↗</a>}
          <button className="cite-sheet-jump" onClick={() => onJump(n)}>Jump to references</button>
        </div>
      </div>
    </div>
  );
}

// Footnote-caret variant — slim italic line inserted between paragraphs
function CiteFootnote({ n, cite, onClose }) {
  return (
    <div className="cite-fn">
      <span className="cite-fn-caret" aria-hidden="true">▲</span>
      <span className="cite-fn-num">{n}</span>
      <span className="cite-fn-text">
        <em>{cite.author}</em>, {cite.year}. {cite.title}{cite.pub ? `. ${cite.pub}` : ""}.
      </span>
      <button className="cite-inline-close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}

// Paragraph renderer — tokenises {{n}} into <Citation/> markers
function Paragraph({ block, refs, openCite, onToggleCite, style, onJump }) {
  const text = block.text;
  const tokens = text.split(/(\{\{\d+\}\})/g);
  const parts = tokens.map((tok, i) => {
    const m = tok.match(/^\{\{(\d+)\}\}$/);
    if (!m) return <span key={i}>{tok}</span>;
    const n = parseInt(m[1], 10);
    return (
      <Citation key={i} n={n} cite={refs[n-1]}
        open={openCite === n && style === "inline"}
        onToggle={() => onToggleCite(n)} />
    );
  });

  const citedHere = [...text.matchAll(/\{\{(\d+)\}\}/g)].map(m => parseInt(m[1], 10));
  const expandedInline = style === "inline" && openCite && citedHere.includes(openCite);
  const expandedFn     = style === "footnote" && openCite && citedHere.includes(openCite);

  const isDrop  = block.kind === "dropcap";
  const isRebut = block.kind === "rebutted";

  return (
    <>
      <p
        className={`para ${isDrop ? "para-drop" : ""} ${isRebut ? "para-rebutted" : ""}`}
        data-rebutted={isRebut || undefined}
      >
        {isRebut && (
          <button className="margin-tick" aria-label="This paragraph has been rebutted">
            <span className="margin-tick-bar" />
            <span className="margin-tick-label">Rebutted</span>
          </button>
        )}
        {parts}
      </p>
      {expandedInline && (
        <CiteInline n={openCite} cite={refs[openCite-1]} onClose={() => onToggleCite(openCite)} onJump={onJump} />
      )}
      {expandedFn && (
        <CiteFootnote n={openCite} cite={refs[openCite-1]} onClose={() => onToggleCite(openCite)} />
      )}
    </>
  );
}

function PullQuote({ children }) {
  return (
    <figure className="pullquote">
      <span className="pq-mark" aria-hidden="true">“</span>
      <blockquote>{children}</blockquote>
    </figure>
  );
}

function H2({ children, id }) {
  return <h2 id={id} className="article-h2">{children}</h2>;
}

// References list — full editorial reference block
function ReferenceList({ refs, activeN }) {
  return (
    <section className="refs" id="references" aria-labelledby="refs-title">
      <h2 id="refs-title" className="refs-title">
        <Kicker>References</Kicker>
        <span className="refs-count">{refs.length} citations</span>
      </h2>
      <ol className="refs-list">
        {refs.map((r, i) => (
          <li key={i} className={`ref-item ${activeN === i+1 ? "active" : ""}`} id={`ref-${i+1}`}>
            <span className="ref-num">{i+1}</span>
            <div className="ref-body">
              <div className="ref-line">
                <span className="ref-author">{r.author}</span>
                <span className="ref-year"> ({r.year}).</span>{" "}
                <span className="ref-title">{r.title}.</span>
              </div>
              {r.pub && <div className="ref-pub">{r.pub}</div>}
              {r.url && <a className="ref-url" href={`https://${r.url}`} onClick={(e)=>e.preventDefault()}>{r.url} ↗</a>}
            </div>
          </li>
        ))}
      </ol>
      <p className="refs-policy">
        Every numbered citation in our articles is verified against a primary source by an editor
        before publication. Errors are corrected publicly in the <a href="#corrections">corrections log</a>.
      </p>
    </section>
  );
}

// CitationRail — desktop-only side aside that mirrors references and
// auto-highlights the one most recently scrolled past. Click to open.
function CitationRail({ refs, openCite, activeRailN, onSelect }) {
  return (
    <aside className="citation-rail" aria-label="References — live">
      <header className="rail-head">
        <Kicker>References</Kicker>
        <span className="rail-count">{refs.length}</span>
      </header>
      <ol className="rail-list">
        {refs.map((r, i) => {
          const n = i + 1;
          const isOpen   = openCite === n;
          const isActive = activeRailN === n;
          return (
            <li key={n}
                className={`rail-item ${isActive ? "active" : ""} ${isOpen ? "open" : ""}`}>
              <button onClick={() => onSelect(n)} className="rail-btn">
                <span className="rail-num">{String(n).padStart(2, "0")}</span>
                <span className="rail-body">
                  <span className="rail-author">{r.author}</span>
                  <span className="rail-year"> ({r.year})</span>
                  <span className="rail-title-line">{r.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="rail-note">
        References light up as you read past their anchor. Click any to open.
      </p>
    </aside>
  );
}

Object.assign(window, {
  Citation, CiteInline, CiteSheet, CiteFootnote, Paragraph, PullQuote, H2,
  ReferenceList, CitationRail,
});
