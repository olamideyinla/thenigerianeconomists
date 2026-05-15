// reader.jsx — likes and short reader notes for article pages.
// Editorial framing: substantive responses still go as full rebuttals.

const { useState: useState_RD, useEffect: useEffect_RD } = React;

// Seed counts and notes so the surface feels populated
const SEED_LIKES = {
  "phantom-liquidity-fx-window":       427,
  "subsidy-three-years-on":            312,
  "northern-inflation-divergence":     188,
  "primary-health-capitation-failure": 209,
  "afcfta-customs-quiet-failure":      96,
  "tier-2-banks-recapitalisation":     254,
  "minimum-wage-real-erosion":         141,
  "states-debt-overhang":              173,
};

const SEED_NOTES = {
  "phantom-liquidity-fx-window": [
    { name: "Emeka A.",       affil: "Trader, Lagos",     date: "08 May",    body: "The 09:45 spike read landed for me. We see it on the dealing desk every morning and nobody calls it what it is.",  endorsed: 38 },
    { name: "Halima O.",      affil: "Economist",         date: "08 May",    body: "Would be useful to see the raw distribution as a chart — the prose convinces but a histogram would settle it.",   endorsed: 22 },
    { name: "Ifeanyi Chuks",  affil: "PhD student, UI",   date: "09 May",    body: "Methodology question: four dealers covering 86% of volume — is that ADM-weighted or simple count? Worth a footnote.", endorsed: 17 },
    { name: "Anonymous",      affil: "Verified subscriber", date: "10 May",  body: "I work at one of the four. The reversal share is, if anything, understated. Won't say more here.",                  endorsed: 64 },
  ],
};

function getStorage(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function setStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ───────────────────────── LikeBar ─────────────────────────
function LikeBar({ slug }) {
  const [liked, setLiked] = useState_RD(() => !!getStorage("tne-likes", {})[slug]);
  const [count, setCount] = useState_RD(() =>
    (getStorage("tne-like-counts", {})[slug] ?? SEED_LIKES[slug] ?? 0)
  );

  const toggle = () => {
    const next = !liked;
    setLiked(next);
    const nextCount = count + (next ? 1 : -1);
    setCount(nextCount);
    const likes = getStorage("tne-likes", {});
    likes[slug] = next;
    setStorage("tne-likes", likes);
    const counts = getStorage("tne-like-counts", {});
    counts[slug] = nextCount;
    setStorage("tne-like-counts", counts);
  };

  return (
    <div className="like-bar">
      <button
        className={`like-btn ${liked ? "liked" : ""}`}
        onClick={toggle}
        aria-pressed={liked}
        aria-label={liked ? "Remove endorsement" : "Endorse this piece"}
      >
        <span className="like-glyph" aria-hidden="true">
          {/* simple seed-of-grain mark */}
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M7 2c1.5 0 3 1.5 3 3.5 0 1.2-.4 2.1-1.2 3l-1.8 2-1.8-2C4.4 7.6 4 6.7 4 5.5 4 3.5 5.5 2 7 2z"
                  fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            <path d="M7 6.5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          </svg>
        </span>
        <span className="like-label">{liked ? "Endorsed" : "Endorse"}</span>
        <span className="like-count" aria-label={`${count} endorsements`}>{count.toLocaleString("en-NG")}</span>
      </button>

      <div className="like-meta">
        <button className="like-share" aria-label="Share via WhatsApp">
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
            <path d="M2 11l1.5-2.5A4.5 4.5 0 1 1 5.5 11L2 11z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
          <span>Share</span>
        </button>
        <button className="like-share" aria-label="Save for later">
          <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
            <path d="M1 1h9v11l-4.5-3L1 12V1z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
          </svg>
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── ReaderNotes ─────────────────────────
const NOTE_LIMIT = 280;

function ReaderNotes({ slug }) {
  const [notes, setNotes] = useState_RD(() => {
    const stored = getStorage("tne-notes", {});
    return stored[slug] || SEED_NOTES[slug] || [];
  });
  const [draft, setDraft] = useState_RD("");
  const [name, setName] = useState_RD(() => getStorage("tne-reader-name", "") || "");
  const [showAll, setShowAll] = useState_RD(false);
  const [composerOpen, setComposerOpen] = useState_RD(false);

  const submit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const entry = {
      name: name.trim() || "Reader",
      affil: "New note",
      date: new Date().toLocaleString("en-GB", { day: "2-digit", month: "short" }),
      body: trimmed.slice(0, NOTE_LIMIT),
      endorsed: 0,
      mine: true,
    };
    const next = [entry, ...notes];
    setNotes(next);
    setDraft("");
    setComposerOpen(false);
    if (name) setStorage("tne-reader-name", name);
    const all = getStorage("tne-notes", {});
    all[slug] = next;
    setStorage("tne-notes", all);
  };

  const visible = showAll ? notes : notes.slice(0, 3);
  const remaining = NOTE_LIMIT - draft.length;

  return (
    <section className="notes" id="reader-notes">
      <header className="notes-head">
        <Kicker>Reader notes</Kicker>
        <span className="notes-count">{notes.length}</span>
      </header>

      <p className="notes-policy">
        Short marginalia from readers. Substantive disagreement should be submitted as a
        <button className="notes-policy-link" onClick={() => {}}> full rebuttal</button>;
        notes here are limited to {NOTE_LIMIT} characters and lightly moderated.
      </p>

      {!composerOpen ? (
        <button className="notes-open" onClick={() => setComposerOpen(true)}>
          <span className="notes-open-plus" aria-hidden="true">＋</span>
          <span>Leave a short note</span>
        </button>
      ) : (
        <form className="notes-form" onSubmit={submit}>
          <input
            type="text"
            className="notes-name"
            placeholder="Your name (or initials)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={48}
          />
          <textarea
            className="notes-textarea"
            placeholder="A short, considered note — not a comment thread."
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, NOTE_LIMIT))}
            rows={4}
            autoFocus
          />
          <div className="notes-form-foot">
            <span className={`notes-counter ${remaining < 30 ? "low" : ""}`}>{remaining}</span>
            <button type="button" className="notes-cancel" onClick={() => { setComposerOpen(false); setDraft(""); }}>Cancel</button>
            <button type="submit" className="notes-submit" disabled={!draft.trim()}>Post note</button>
          </div>
        </form>
      )}

      <ol className="notes-list">
        {visible.map((n, i) => (
          <li key={i} className={`note ${n.mine ? "mine" : ""}`}>
            <div className="note-head">
              <span className="note-initial" aria-hidden="true">{(n.name || "?").charAt(0)}</span>
              <div className="note-meta">
                <div className="note-name">{n.name}{n.mine && <span className="note-mine"> · you</span>}</div>
                <div className="note-sub">{n.affil} · {n.date}</div>
              </div>
              <button className="note-endorse" aria-label={`Endorse this note (${n.endorsed})`}>
                <svg width="11" height="11" viewBox="0 0 14 14"><path d="M7 2c1.5 0 3 1.5 3 3.5 0 1.2-.4 2.1-1.2 3l-1.8 2-1.8-2C4.4 7.6 4 6.7 4 5.5 4 3.5 5.5 2 7 2z" stroke="currentColor" strokeWidth="1.4" fill="none"/></svg>
                <span>{n.endorsed}</span>
              </button>
            </div>
            <p className="note-body">{n.body}</p>
          </li>
        ))}
      </ol>

      {notes.length > 3 && !showAll && (
        <button className="notes-more" onClick={() => setShowAll(true)}>
          Show {notes.length - 3} more {notes.length - 3 === 1 ? "note" : "notes"} →
        </button>
      )}

      <p className="notes-fine">
        Notes are visible to all readers. By posting you agree to our reader guidelines.
        We remove unsubstantiated claims, personal attacks, and unsourced statistics on sight.
      </p>
    </section>
  );
}

Object.assign(window, { LikeBar, ReaderNotes, SEED_LIKES, SEED_NOTES });
