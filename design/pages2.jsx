// pages2.jsx — Synthesis, Rebuttal index, Topic, Newsletter, Footer

const { useState: useState_P2, useRef: useRef_P2 } = React;

// ═══════════════════════════════════════════════════════════════════
// SYNTHESIS POST
// ═══════════════════════════════════════════════════════════════════
function SynthesisPage({ onNav }) {
  const s = SYNTHESIS;
  const [activeThread, setActiveThread] = useState_P2(null);

  return (
    <div className="page page-synthesis">
      <header className="synth-head">
        <button className="back" onClick={() => onNav({ view: "home" })}>
          <span aria-hidden="true">←</span> The Nigerian Economists
        </button>

        <div className="synth-issue">
          <Kicker accent>{s.kicker}</Kicker>
          <span className="synth-issue-num">№ 18</span>
        </div>

        <h1 className="synth-headline">{s.headline}</h1>
        <p className="synth-deck">{s.deck}</p>

        <div className="synth-byline">
          <em>Edited by</em> {s.editor}
          <span aria-hidden="true">·</span>
          <span>{s.publishedDisplay}</span>
          <span aria-hidden="true">·</span>
          <span>{s.readMinutes} min</span>
        </div>
      </header>

      {/* Argument map — the adventurous bit. A vertical thread showing the 5 threads with
          a connecting line and source pieces hanging off each. */}
      <section className="synth-map">
        <Kicker>Argument in five movements</Kicker>
        <ol className="synth-threads">
          {s.threads.map((t, i) => (
            <li key={i} className={`synth-thread ${activeThread === i ? "active" : ""}`}>
              <div className="synth-thread-spine">
                <div className="synth-thread-num">{t.num}</div>
                <div className="synth-thread-line" aria-hidden="true" />
              </div>
              <div className="synth-thread-body">
                <button className="synth-thread-head" onClick={() => setActiveThread(activeThread === i ? null : i)}>
                  <h2 className="synth-thread-title">{t.title}</h2>
                  <span className="synth-thread-toggle" aria-hidden="true">{activeThread === i ? "−" : "+"}</span>
                </button>
                <p className="synth-thread-summary">{t.summary}</p>
                {t.pieces.length > 0 && (
                  <ul className="synth-thread-pieces">
                    {t.pieces.map(slug => {
                      const piece = ARTICLES.find(a => a.slug === slug);
                      if (!piece) return null;
                      return (
                        <li key={slug} onClick={() => onNav({ view: "article", slug })}>
                          <span className="stp-glyph" aria-hidden="true">¶</span>
                          <div className="stp-body">
                            <div className="stp-title">{piece.headline}</div>
                            <div className="stp-meta">{AUTHORS[piece.author].name} · {piece.publishedDisplay}</div>
                          </div>
                          <span className="stp-arrow" aria-hidden="true">→</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {t.pieces.length === 0 && (
                  <div className="synth-thread-tba">Forthcoming · commissioned</div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Rule kind="thick" />

      <section className="synth-editorial">
        <Kicker>The editor's note</Kicker>
        <p>
          Each fortnight we publish a synthesis: a short essay that names a single problem and
          threads together the pieces that, read in sequence, make the problem visible. We do
          this because the strongest economic arguments in Nigeria today are being made across
          several disconnected publications, by writers who do not always read each other.
        </p>
        <p>
          This issue's synthesis is the longest we have run. It is also, in our view, the most
          consequential. The 2026 budget framework rests on revenue assumptions that two of
          the pieces below directly contradict; on an inflation forecast a third does not
          support; and on a financial-sector stability story a fourth complicates.
        </p>
        <p>
          The Ministry has not yet responded to our requests for comment. We will publish their
          response — at full length — when it arrives.
        </p>
      </section>

      <Rule kind="thick" />
      <Footer onNav={onNav} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REBUTTAL INDEX
// ═══════════════════════════════════════════════════════════════════
function RebuttalIndex({ onNav }) {
  const [view, setView] = useState_P2("list"); // list | atlas

  return (
    <div className="page page-rebuttals">
      <header className="ri-head">
        <button className="back" onClick={() => onNav({ view: "home" })}>
          <span aria-hidden="true">←</span> The Nigerian Economists
        </button>
        <Kicker accent>Rebuttal index</Kicker>
        <h1 className="ri-title">Active debates on the site</h1>
        <p className="ri-deck">
          Rebuttals on The Nigerian Economists are full articles, edited and reference-checked
          like any other. Each debate below is a thread of original piece plus responses.
        </p>
      </header>

      <div className="ri-toggle" role="tablist" aria-label="View">
        <button role="tab" aria-selected={view==="list"} onClick={() => setView("list")}>List</button>
        <button role="tab" aria-selected={view==="atlas"} onClick={() => setView("atlas")}>Atlas</button>
      </div>

      {view === "list" && (
        <ol className="ri-list">
          {REBUTTAL_THREADS.map((t, i) => (
            <li key={i} className="ri-thread">
              <div className="ri-thread-head">
                <div className="ri-thread-num">{String(i+1).padStart(2,"0")}</div>
                <div className="ri-thread-meta">
                  <span>{t.responses.length} {t.responses.length === 1 ? "response" : "responses"}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.originalDate}</span>
                </div>
              </div>
              <button className="ri-orig" onClick={() => onNav({ view: "article", slug: t.original })}>
                <Kicker>The original</Kicker>
                <div className="ri-orig-title">{t.originalTitle}</div>
                <div className="ri-orig-author">{t.originalAuthor}</div>
              </button>
              <ul className="ri-responses">
                {t.responses.map((r, j) => (
                  <li key={j} className={`ri-r ri-r-${r.stance}`}>
                    <div className="ri-r-spine" aria-hidden="true" />
                    <div className="ri-r-body">
                      <div className="ri-r-stance">{r.stance === "rebuts" ? "↩ Rebuts" : "→ Extends"}</div>
                      <div className="ri-r-title">{r.title}</div>
                      <div className="ri-r-meta">{r.author} · {r.affiliation} · {r.date}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      {view === "atlas" && <RebuttalAtlas onNav={onNav} />}

      <Footer onNav={onNav} />
    </div>
  );
}

// Adventurous: a small "atlas" — nodes and edges across the publication
function RebuttalAtlas({ onNav }) {
  // Position nodes by hand for tightness on mobile
  const nodes = [
    { id: "phantom-liquidity-fx-window", x: 50, y: 70,  label: "Phantom Liquidity", topic: "fx" },
    { id: "r1a", x: 22, y: 170, label: "Reading the Tape", child: true },
    { id: "r1b", x: 78, y: 170, label: "CBN Note", child: true },
    { id: "r1c", x: 50, y: 250, label: "Author Reply", child: true, extends: true },

    { id: "subsidy-three-years-on", x: 50, y: 360, label: "Subsidy Is Back", topic: "subsidy" },
    { id: "r2a", x: 50, y: 450, label: "NNPCL: Cost-Recovery", child: true },

    { id: "tier-2-banks-recapitalisation", x: 50, y: 560, label: "Tier-2 Recap", topic: "banking" },
    { id: "r3a", x: 22, y: 660, label: "Anon CFO", child: true },
    { id: "r3b", x: 78, y: 660, label: "Author Reply", child: true, extends: true },
  ];
  const edges = [
    ["phantom-liquidity-fx-window","r1a"], ["phantom-liquidity-fx-window","r1b"],
    ["r1b","r1c"],
    ["subsidy-three-years-on","r2a"],
    ["tier-2-banks-recapitalisation","r3a"], ["r3a","r3b"],
  ];
  const W = 100, H = 740;
  const find = id => nodes.find(n => n.id === id);

  return (
    <div className="atlas-wrap">
      <p className="atlas-note">
        Each original piece sits at the head of its thread; rebuttals branch off, with extensions
        nested below. <em>Tap a node to open the piece.</em>
      </p>
      <div className="atlas">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin meet" className="atlas-svg" aria-hidden="true">
          {edges.map(([a,b], i) => {
            const A = find(a), B = find(b);
            return <path key={i} d={`M${A.x} ${A.y+4} C ${A.x} ${(A.y+B.y)/2}, ${B.x} ${(A.y+B.y)/2}, ${B.x} ${B.y-4}`}
              stroke="var(--ink-faint)" strokeWidth="0.35" fill="none" />;
          })}
        </svg>
        {nodes.map(n => (
          <button key={n.id}
            className={`atlas-node ${n.child ? "child" : "head"} ${n.extends ? "extends" : ""}`}
            style={{ left: `${n.x}%`, top: `${n.y}px` }}
            onClick={() => {
              if (!n.child) onNav({ view: "article", slug: n.id });
            }}>
            <span className="atlas-dot" aria-hidden="true" />
            <span className="atlas-label">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOPIC PAGE
// ═══════════════════════════════════════════════════════════════════
function TopicPage({ slug, onNav }) {
  const topic = TOPICS[slug] || TOPICS.behavioural;
  const items = ARTICLES.filter(a => a.topic === topic.slug);
  const all = items.length ? items : ARTICLES;

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <button className="back" onClick={() => onNav({ view: "home" })}>
          <span aria-hidden="true">←</span> The Nigerian Economists
        </button>
        <Kicker accent>Section</Kicker>
        <h1 className="topic-title">{topic.name}</h1>
        <p className="topic-deck">
          {topic.count} pieces published since launch. Edited by Adesuwa Iyamah.
        </p>
        <div className="topic-filters">
          <button className="topic-filter active">Recent</button>
          <button className="topic-filter">Most rebutted</button>
          <button className="topic-filter">Editor's picks</button>
        </div>
      </header>

      <ol className="topic-list">
        {all.map((a, i) => (
          <li key={a.slug} onClick={() => onNav({ view: "article", slug: a.slug })}>
            <div className="tl-num">{String(i+1).padStart(2,"0")}</div>
            <div className="tl-body">
              <div className="tl-kicker">{a.kicker}</div>
              <h3 className="tl-head">{a.headline}</h3>
              <p className="tl-deck">{a.deck || ""}</p>
              <div className="tl-meta">
                <span>{AUTHORS[a.author].name}</span>
                <span aria-hidden="true">·</span>
                <span>{a.publishedDisplay}</span>
                <span aria-hidden="true">·</span>
                <span>{a.readMinutes} min</span>
                {a.rebuttedBy.length > 0 && (
                  <span className="rb-pill">⇄ Rebutted {a.rebuttedBy.length}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <Footer onNav={onNav} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════════════
function NewsletterPage({ onNav }) {
  const [email, setEmail] = useState_P2("");
  const [submitted, setSubmitted] = useState_P2(false);

  return (
    <div className="page page-newsletter">
      <header className="news-head">
        <button className="back" onClick={() => onNav({ view: "home" })}>
          <span aria-hidden="true">←</span> The Nigerian Economists
        </button>
        <Kicker accent>The weekly letter</Kicker>
        <h1 className="news-title">A serious economics letter, delivered Sunday morning.</h1>
        <p className="news-deck">
          One synthesis. The week's three most important pieces. One chart that matters. No
          summaries of what you already read. No SEO listicles. No advertising — ever.
        </p>
      </header>

      {!submitted ? (
        <form className="news-form" onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}>
          <label htmlFor="email" className="news-label">Email address</label>
          <input id="email" type="email" required placeholder="you@inbox.com"
            value={email} onChange={(e) => setEmail(e.target.value)} className="news-input" />

          <fieldset className="news-prefs">
            <legend className="kicker">Also send me</legend>
            <label><input type="checkbox" defaultChecked /> <span>The Synthesis (fortnightly)</span></label>
            <label><input type="checkbox" defaultChecked /> <span>New rebuttal threads</span></label>
            <label><input type="checkbox" /> <span>Public corrections</span></label>
            <label><input type="checkbox" /> <span>Quarterly funders & transparency update</span></label>
          </fieldset>

          <button type="submit" className="news-submit">Subscribe</button>

          <p className="news-fine">
            We will never sell your email. Unsubscribe in one click from any letter. The list
            is hosted on an independent transactional-email provider; we keep no third-party
            analytics on it.
          </p>
        </form>
      ) : (
        <div className="news-thanks">
          <Kicker accent>Confirmed</Kicker>
          <h2>One more step: check your inbox.</h2>
          <p>We've sent a confirmation link to <strong>{email}</strong>. Click it and you'll be on the list.</p>
          <p className="news-fine">If it doesn't arrive within five minutes, check spam — and if it really isn't there, write to <a>letters@thenigerianeconomists.com</a>.</p>
        </div>
      )}

      <Rule kind="thick" />

      <section className="news-archive">
        <Kicker>Recent letters</Kicker>
        <ul>
          <li><span className="na-date">10 May 2026</span><span className="na-title">When the budget framework stops being believable</span></li>
          <li><span className="na-date">03 May 2026</span><span className="na-title">The two charts you should look at this week</span></li>
          <li><span className="na-date">26 Apr 2026</span><span className="na-title">On the Q1 GDP print, and what the deflator is hiding</span></li>
          <li><span className="na-date">19 Apr 2026</span><span className="na-title">A reading list on subnational fiscal stress</span></li>
        </ul>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
function Footer({ onNav }) {
  return (
    <footer className="site-foot">
      <div className="sf-wordmark">
        <span className="sf-the">The</span>
        <span className="sf-ne">Nigerian Economists</span>
      </div>
      <p className="sf-tag">
        Rigorous economic commentary on Nigeria. Inline references in every piece.
        Rebuttals only as full articles. Edited in Lagos.
      </p>

      <div className="sf-cols">
        <div>
          <Kicker>Sections</Kicker>
          <ul>
            {Object.values(TOPICS).slice(0,4).map(t => (
              <li key={t.slug}><button onClick={() => onNav({ view: "topic", slug: t.slug })}>{t.name}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <Kicker>Editorial</Kicker>
          <ul>
            <li><button onClick={() => onNav({ view: "synthesis" })}>The Synthesis</button></li>
            <li><button onClick={() => onNav({ view: "rebuttals" })}>Rebuttal index</button></li>
            <li><button onClick={() => onNav({ view: "newsletter" })}>Newsletter</button></li>
            <li><button>Submissions</button></li>
          </ul>
        </div>
        <div>
          <Kicker>Standards</Kicker>
          <ul>
            <li><button>Editorial policy</button></li>
            <li><button>Funders & transparency</button></li>
            <li><button>Corrections log</button></li>
            <li><button>Privacy</button></li>
          </ul>
        </div>
      </div>

      <div className="sf-foot">
        <span>© 2026 The Nigerian Economists</span>
        <span aria-hidden="true">·</span>
        <span>Lagos · Abuja</span>
      </div>
    </footer>
  );
}

Object.assign(window, { SynthesisPage, RebuttalIndex, TopicPage, NewsletterPage, Footer });
