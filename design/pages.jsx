// pages.jsx — page components for The Nigerian Economists prototype

const { useState: useState_P, useEffect: useEffect_P, useRef: useRef_P } = React;

// ═══════════════════════════════════════════════════════════════════
// HOMEPAGE
// ═══════════════════════════════════════════════════════════════════
function HomePage({ onNav }) {
  const [lead, ...rest] = ARTICLES;
  const second = rest[0];                          // subsidy piece
  const tertiary = rest.slice(1, 3);               // 2 more
  const list = rest.slice(3);
  const activeDebates = REBUTTAL_THREADS.slice(0, 2);

  return (
    <div className="page page-home">
      <div className="issue-strip">
        <span className="kicker">Issue 18 · Week of 12 May 2026</span>
        <button className="issue-link" onClick={() => onNav({ view: "synthesis" })}>
          The Synthesis →
        </button>
      </div>

      {/* lead */}
      <article className="lead-card" onClick={() => onNav({ view: "article", slug: lead.slug })}>
        <Kicker accent>{lead.kicker}</Kicker>
        <h1 className="lead-headline">{lead.headline}</h1>
        <p className="lead-deck">{lead.deck}</p>
        <div className="lead-meta">
          <span className="lead-author">{AUTHORS[lead.author].name}</span>
          <span aria-hidden="true">·</span>
          <span>{lead.publishedDisplay}</span>
          <span aria-hidden="true">·</span>
          <span>{lead.readMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span className="lead-likes" title="Endorsements">♥ {(SEED_LIKES[lead.slug] || 0).toLocaleString("en-NG")}</span>
        </div>
        {lead.rebuttedBy.length > 0 && (
          <RebuttalBadge variant="inline" rebuttedBy={lead.rebuttedBy}
            onOpen={(e) => { e?.stopPropagation?.(); onNav({ view: "rebuttals" }); }} />
        )}
      </article>

      <Rule kind="thick" />

      {/* Synthesis CTA */}
      <button className="synth-strip" onClick={() => onNav({ view: "synthesis" })}>
        <div className="synth-strip-num">№ 18</div>
        <div className="synth-strip-body">
          <Kicker>The Synthesis · This week</Kicker>
          <h3>Fiscal-Monetary Misalignment: Where The Numbers Don't Add Up</h3>
          <span className="synth-strip-meta">5 pieces · 18 min · edited by Adesuwa Iyamah</span>
        </div>
        <span className="synth-strip-arrow" aria-hidden="true">→</span>
      </button>

      <Rule kind="thick" />

      {/* Active debates */}
      <section className="home-debates">
        <header className="home-section-head">
          <Kicker accent>Active debates</Kicker>
          <button className="home-section-more" onClick={() => onNav({ view: "rebuttals" })}>
            Rebuttal index →
          </button>
        </header>
        <ul className="debates-list">
          {activeDebates.map(d => (
            <li key={d.original} className="debate-row" onClick={() => onNav({ view: "article", slug: d.original })}>
              <div className="debate-glyph" aria-hidden="true">⇄</div>
              <div className="debate-body">
                <div className="debate-title">{d.originalTitle}</div>
                <div className="debate-meta">
                  {d.originalAuthor} ·{" "}
                  <span className="debate-rebutters">
                    Rebutted by {d.responses.filter(r => r.stance==="rebuts").length}
                  </span>
                </div>
                <ul className="debate-responses">
                  {d.responses.slice(0, 2).map((r, i) => (
                    <li key={i}>
                      <span className={`debate-stance ${r.stance}`}>
                        {r.stance === "rebuts" ? "Rebuts" : "Extends"}
                      </span>
                      <span className="debate-r-title">{r.title}</span>
                      <span className="debate-r-author">{r.author}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Rule kind="thick" />

      {/* Second feature */}
      <article className="feature-card" onClick={() => onNav({ view: "article", slug: second.slug })}>
        <Kicker>{second.kicker}</Kicker>
        <h2 className="feature-headline">{second.headline}</h2>
        <p className="feature-deck">{second.deck}</p>
        <div className="feature-meta">
          {AUTHORS[second.author].name} · {second.publishedDisplay} · {second.readMinutes} min
          {second.rebuttedBy.length > 0 && (
            <span className="rb-pill"> ⇄ Rebutted</span>
          )}
        </div>
      </article>

      <Rule kind="thin" />

      {/* Tertiary pair */}
      <div className="pair">
        {tertiary.map(a => (
          <article key={a.slug} className="pair-card" onClick={() => onNav({ view: "article", slug: a.slug })}>
            <Kicker>{a.kicker}</Kicker>
            <h3 className="pair-headline">{a.headline}</h3>
            <div className="pair-meta">{AUTHORS[a.author].name} · {a.readMinutes} min</div>
          </article>
        ))}
      </div>

      <Rule kind="thick" />

      {/* Earlier this week list */}
      <section className="home-list">
        <Kicker>Earlier this week</Kicker>
        <ul>
          {list.map(a => (
            <li key={a.slug} onClick={() => onNav({ view: "article", slug: a.slug })}>
              <div className="hl-kicker">{a.kicker}</div>
              <div className="hl-head">{a.headline}</div>
              <div className="hl-meta">
                {AUTHORS[a.author].name} · {a.publishedDisplay} · {a.readMinutes} min
                {SEED_LIKES[a.slug] && <span className="hl-likes"> · ♥ {SEED_LIKES[a.slug]}</span>}
                {a.rebuttedBy.length > 0 && <span className="rb-pill"> ⇄ {a.rebuttedBy.length}</span>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Rule kind="thick" />

      {/* Newsletter CTA */}
      <section className="news-cta" onClick={() => onNav({ view: "newsletter" })}>
        <Kicker accent>The weekly</Kicker>
        <h3>A serious economics letter, delivered Sunday morning.</h3>
        <p>The Synthesis, the week's three most important pieces, and one chart that matters.</p>
        <span className="news-cta-arrow">Subscribe →</span>
      </section>

      <Footer onNav={onNav} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ARTICLE PAGE
// ═══════════════════════════════════════════════════════════════════
function ArticlePage({ slug, onNav, citationStyle, onJump }) {
  // For the prototype, only the FX phantom article has full content.
  const article = slug === ARTICLE_FX_PHANTOM.slug ? ARTICLE_FX_PHANTOM : ARTICLE_FX_PHANTOM;
  const [openCite, setOpenCite] = useState_P(null);
  const [coiOpen, setCoiOpen] = useState_P(false);
  const [activeRailN, setActiveRailN] = useState_P(null);
  const refsEl = useRef_P(null);
  const progressEl = useRef_P(null);
  const articleEl = useRef_P(null);

  const onToggleCite = (n) => setOpenCite(prev => prev === n ? null : n);
  const onJumpToRefs = (n) => {
    setOpenCite(null);
    const el = document.getElementById(`ref-${n}`);
    if (el) {
      el.scrollIntoView ? null : null;
      const container = articleEl.current?.closest(".phone-scroll");
      if (container) {
        const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 80;
        container.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  // Reading progress + live citation tracking
  useEffect_P(() => {
    const scroll = articleEl.current?.closest(".phone-scroll");
    if (!scroll) return;
    const onScroll = () => {
      const max = scroll.scrollHeight - scroll.clientHeight;
      const p = max > 0 ? Math.min(1, scroll.scrollTop / max) : 0;
      if (progressEl.current) progressEl.current.style.transform = `scaleX(${p})`;

      // Find the last cite-marker that's been scrolled past
      const markers = articleEl.current?.querySelectorAll("[data-cite-n]");
      if (!markers) return;
      let active = null;
      const containerTop = scroll.getBoundingClientRect().top;
      const threshold = containerTop + 140; // ~ just below the masthead
      markers.forEach((m) => {
        const top = m.getBoundingClientRect().top;
        if (top <= threshold) active = parseInt(m.dataset.citeN, 10);
      });
      setActiveRailN(active);
    };
    scroll.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroll.removeEventListener("scroll", onScroll);
  }, []);

  const a = article;
  const author = AUTHORS[a.author];
  const cited = openCite;

  return (
    <div className="page page-article" ref={articleEl}>
      <div className="reading-progress"><span ref={progressEl} /></div>

      <div className="article-shell">
        <main className="article-main">

      <header className="article-head">
        <button className="back" onClick={() => onNav({ view: "home" })} aria-label="Back to homepage">
          <span aria-hidden="true">←</span> The Nigerian Economists
        </button>

        <div className="article-kicker-row">
          <Kicker accent>{a.kicker}</Kicker>
          <button className="article-topic-link" onClick={() => onNav({ view: "topic", slug: a.topic })}>
            in {TOPICS[a.topic].name} →
          </button>
        </div>

        <h1 className="article-headline">{a.headline}</h1>
        <p className="article-deck">{a.deck}</p>

        <Byline authorKey={a.author} date={a.publishedDisplay} readMins={a.readMinutes} />

        {a.rebuttedBy && a.rebuttedBy.length > 0 && (
          <RebuttalBadge rebuttedBy={a.rebuttedBy}
            onOpen={() => {
              const el = document.getElementById("responses");
              const container = articleEl.current?.closest(".phone-scroll");
              if (el && container) {
                const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 80;
                container.scrollTo({ top, behavior: "smooth" });
              }
            }}
          />
        )}

        <COIBadge authorKey={a.author} open={coiOpen} onToggle={() => setCoiOpen(v => !v)} />
      </header>

      <LikeBar slug={a.slug} />

      <div className="article-body">
        {a.paragraphs.map((block, i) => {
          if (block.kind === "h2") return <H2 key={i} id={`s-${i}`}>{block.text}</H2>;
          if (block.kind === "pullquote") return <PullQuote key={i}>{block.text}</PullQuote>;
          return (
            <Paragraph key={i} block={block} refs={a.refs}
              openCite={openCite} onToggleCite={onToggleCite}
              style={citationStyle} onJump={onJumpToRefs} />
          );
        })}
      </div>

      {/* sheet variant lives outside the flow */}
      {citationStyle === "sheet" && openCite && (
        <CiteSheet n={openCite} cite={a.refs[openCite-1]}
          onClose={() => setOpenCite(null)} onJump={onJumpToRefs} />
      )}

      <Rule kind="thick" />

      {/* Responses thread — adventurous, integrated */}
      {a.rebuttedBy && a.rebuttedBy.length > 0 && <ResponsesThread article={a} onNav={onNav} />}

      <Rule kind="thick" />

      {/* Short reader notes (limited surface; full responses still go via rebuttal) */}
      <ReaderNotes slug={a.slug} />

      <Rule kind="thick" />

      {/* References */}
      <div ref={refsEl}>
        <ReferenceList refs={a.refs} activeN={openCite} />
      </div>

      <Rule kind="thick" />

      {/* About the author */}
      <section className="author-card">
        <Kicker>About the author</Kicker>
        <div className="ac-row">
          <div className="ac-avatar"><image-slot id={`author-${a.author}`} shape="circle" placeholder={`${author.name} portrait`}></image-slot></div>
          <div className="ac-body">
            <div className="ac-name">{author.name}</div>
            <div className="ac-role">{author.role} · {author.affiliation}</div>
          </div>
        </div>
        <p className="ac-bio">{author.bio}</p>
        <button className="ac-more" onClick={() => onNav({ view: "topic", slug: a.topic })}>
          All pieces by {author.name.split(" ")[0]} →
        </button>
      </section>

      <Rule kind="thick" />

      <RelatedReading currentSlug={a.slug} onNav={onNav} />

        </main>
        <CitationRail
          refs={a.refs}
          openCite={openCite}
          activeRailN={activeRailN}
          onSelect={(n) => setOpenCite(prev => prev === n ? null : n)}
        />
      </div>

      <Footer onNav={onNav} />
    </div>
  );
}

function ResponsesThread({ article, onNav }) {
  return (
    <section id="responses" className="responses">
      <header className="resp-head">
        <Kicker accent>Responses to this piece</Kicker>
        <span className="resp-count">{article.rebuttedBy.length} published</span>
      </header>
      <p className="resp-note">
        We publish rebuttals as full articles, not comments. Each goes through the same editorial
        process — including reference checking — as the original.
      </p>
      <ol className="resp-list">
        {article.rebuttedBy.map((r, i) => (
          <li key={i} className="resp-item" onClick={() => onNav({ view: "rebuttals" })}>
            <div className="resp-num">{String(i+1).padStart(2,"0")}</div>
            <div className="resp-body">
              <div className="resp-title">{r.title}</div>
              <div className="resp-meta"><em>{r.author}</em> · {r.date}</div>
            </div>
            <span className="resp-arrow" aria-hidden="true">→</span>
          </li>
        ))}
      </ol>
      <div className="resp-cta">
        <Kicker>Disagree?</Kicker>
        <p>We accept rebuttal submissions from credentialed contributors.</p>
        <button className="resp-cta-btn">Submit a rebuttal →</button>
      </div>
    </section>
  );
}

function RelatedReading({ currentSlug, onNav }) {
  const related = ARTICLES.filter(a => a.slug !== currentSlug).slice(0, 3);
  return (
    <section className="related">
      <Kicker>Continue</Kicker>
      <ul>
        {related.map(a => (
          <li key={a.slug} onClick={() => onNav({ view: "article", slug: a.slug })}>
            <div className="rel-kicker">{a.kicker}</div>
            <div className="rel-head">{a.headline}</div>
            <div className="rel-meta">{AUTHORS[a.author].name} · {a.readMinutes} min</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

Object.assign(window, { HomePage, ArticlePage });
