// components.jsx — shared editorial components for The Nigerian Economists

const { useState, useEffect, useRef } = React;

// ───────────────────────── Masthead / top bar ─────────────────────────
function Masthead({ onMenu, onHome, view, onSearch }) {
  return (
    <header className="masthead">
      <button className="m-btn" onClick={onMenu} aria-label="Menu">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </button>
      <button className="m-wordmark" onClick={onHome} aria-label="The Nigerian Economists — home">
        <span className="m-the">The</span>
        <span className="m-ne">Nigerian Economists</span>
      </button>
      <button className="m-btn" onClick={onSearch} aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>
    </header>
  );
}

// ───────────────────────── Slide-out menu ─────────────────────────
function SideMenu({ open, onClose, onNav }) {
  return (
    <div className={`drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!open}>
      <div className="drawer-scrim" onClick={onClose} />
      <nav className="drawer-panel" aria-label="Sections">
        <div className="drawer-head">
          <span className="kicker">Sections</span>
          <button className="m-btn" onClick={onClose} aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
        </div>
        <ul className="drawer-list">
          {Object.values(TOPICS).map(t => (
            <li key={t.slug}>
              <button onClick={() => onNav({ view: "topic", slug: t.slug })}>
                <span className="dl-name">{t.name}</span>
                <span className="dl-count">{t.count}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="drawer-divider" />
        <ul className="drawer-list secondary">
          <li><button onClick={() => onNav({ view: "synthesis" })}>The Synthesis — weekly</button></li>
          <li><button onClick={() => onNav({ view: "rebuttals" })}>Rebuttal index</button></li>
          <li><button onClick={() => onNav({ view: "newsletter" })}>Newsletter</button></li>
          <li><button onClick={() => {}}>About the publication</button></li>
          <li><button onClick={() => {}}>Funders & transparency</button></li>
          <li><button onClick={() => {}}>Corrections log</button></li>
        </ul>
        <div className="drawer-foot">
          <div className="kicker">Issue 18 · 12 May 2026</div>
          <div className="drawer-tag">thenigerianeconomists.com</div>
        </div>
      </nav>
    </div>
  );
}

// ───────────────────────── Kicker, divider, tags ─────────────────────────
function Kicker({ children, accent }) {
  return <span className={`kicker ${accent ? "kicker-accent" : ""}`}>{children}</span>;
}
function Rule({ kind = "thin" }) {
  return <hr className={`rule rule-${kind}`} />;
}

// ───────────────────────── Byline ─────────────────────────
function Byline({ authorKey, date, readMins, compact }) {
  const a = AUTHORS[authorKey];
  if (!a) return null;
  return (
    <div className={`byline ${compact ? "byline-compact" : ""}`}>
      <div className="byline-row">
        <span className="byline-by">By</span>
        <span className="byline-name">{a.name}</span>
      </div>
      <div className="byline-meta">
        <span>{a.role}</span>
        {date && <span aria-hidden="true">·</span>}
        {date && <span>{date}</span>}
        {readMins && <span aria-hidden="true">·</span>}
        {readMins && <span>{readMins} min read</span>}
      </div>
    </div>
  );
}

// ───────────────────────── COI disclosure ─────────────────────────
function COIBadge({ authorKey, open, onToggle }) {
  const a = AUTHORS[authorKey];
  if (!a) return null;
  return (
    <div className={`coi ${open ? "open" : ""}`}>
      <button className="coi-summary" onClick={onToggle} aria-expanded={open}>
        <span className="coi-dot" aria-hidden="true"/>
        <span className="coi-label">Conflicts of interest declared</span>
        <span className="coi-count">{a.coi.length}</span>
        <span className="coi-caret" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="coi-body">
          <div className="coi-aff"><em>Affiliation</em> — {a.affiliation}</div>
          <ul className="coi-list">{a.coi.map((c, i) => <li key={i}>{c}</li>)}</ul>
          <div className="coi-policy">
            The Nigerian Economists requires every contributor to declare relevant affiliations
            and material interests. <a href="#policy">Read the full editorial policy</a>.
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────── Rebuttal indicator ─────────────────────────
function RebuttalBadge({ rebuttedBy, onOpen, variant = "block" }) {
  if (!rebuttedBy || rebuttedBy.length === 0) return null;
  if (variant === "inline") {
    return (
      <button className="rb-inline" onClick={onOpen}>
        <span className="rb-glyph" aria-hidden="true">⇄</span>
        Rebutted by {rebuttedBy.length}
      </button>
    );
  }
  return (
    <button className="rb-block" onClick={onOpen}>
      <div className="rb-row">
        <span className="rb-glyph" aria-hidden="true">⇄</span>
        <span className="rb-label">This piece has been rebutted</span>
        <span className="rb-count">{rebuttedBy.length}</span>
      </div>
      <ul className="rb-list">
        {rebuttedBy.slice(0, 3).map((r, i) => (
          <li key={i}>
            <span className="rb-r-title">{r.title}</span>
            <span className="rb-r-meta">{r.author} · {r.date}</span>
          </li>
        ))}
      </ul>
      <span className="rb-cta">Open the response thread →</span>
    </button>
  );
}

Object.assign(window, {
  Masthead, SideMenu, Kicker, Rule, Byline, COIBadge, RebuttalBadge,
});
