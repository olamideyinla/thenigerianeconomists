import Link from 'next/link'
import { format } from 'date-fns'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ── Intro extraction ──────────────────────────────────────────────────────────

/**
 * Extract the first prose paragraph from MDX source, stripping inline markdown.
 * Used as a fallback when `excerpt` is not set.
 */
function extractIntro(mdx: string): string {
  const lines = mdx.split('\n')
  const para: string[] = []
  let capturing = false

  for (const line of lines) {
    const t = line.trim()
    if (!t) {
      if (capturing) break
      continue
    }
    if (
      t.startsWith('import ') || t.startsWith('export ') ||
      t.startsWith('#') || t.startsWith('>') || t.startsWith('!') ||
      t.startsWith('<') || t.startsWith(':::') || t.startsWith('::') ||
      t.startsWith('---') || t.startsWith('```') || t.startsWith('|') ||
      t.startsWith('- ') || t.startsWith('* ') || /^\d+\. /.test(t)
    ) {
      if (capturing) break
      continue
    }
    capturing = true
    para.push(t)
  }

  return para.join(' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .trim()
}

function getIntro(article: { excerpt: string | null; contentMdx: string }): string {
  return article.excerpt || extractIntro(article.contentMdx)
}

export default async function HomePage() {
  // ── Data queries ──────────────────────────────────────────────────

  const latestSynthesis = await db.synthesis.findFirst({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    include: {
      editor: true,
      articles: true,
    },
  })

  const articles = await db.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    include: {
      author: true,
      topic: true,
      rebuttedBy: {
        include: {
          rebuttalArticle: {
            include: { author: true },
          },
        },
      },
      _count: {
        select: { endorsements: true },
      },
    },
  })

  // Articles that have been rebutted, up to 2 for "Active debates"
  const debateArticles = articles.filter((a) => a.rebuttedBy.length > 0).slice(0, 2)

  const lead = articles[0]
  const feature = articles[1]
  const pairLeft = articles[2]
  const pairRight = articles[3]
  const listArticles = articles.slice(4)

  const leadIntro      = lead      ? getIntro(lead)      : null
  const featureIntro   = feature   ? getIntro(feature)   : null
  const pairLeftIntro  = pairLeft  ? getIntro(pairLeft)  : null
  const pairRightIntro = pairRight ? getIntro(pairRight) : null

  // ── Helpers ───────────────────────────────────────────────────────

  function fmtDate(d: Date | string | null | undefined): string {
    if (!d) return ''
    return format(new Date(d), 'dd MMM yyyy')
  }

  function fmtWeekOf(d: Date | string | null | undefined): string {
    if (!d) return ''
    return format(new Date(d), 'd MMM yyyy')
  }

  function stanceClass(stance: string): 'rebuts' | 'extends' {
    return stance === 'REBUTS' ? 'rebuts' : 'extends'
  }

  function stanceLabel(stance: string): string {
    return stance === 'REBUTS' ? 'Rebuts' : 'Extends'
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="page page-home">

      {/* Issue strip */}
      <div className="issue-strip">
        <span className="kicker">
          {latestSynthesis
            ? `Issue ${latestSynthesis.issueNumber} · Week of ${fmtWeekOf(latestSynthesis.weekOf)}`
            : 'The Nigerian Economists'}
        </span>
        <Link href="/synthesis" className="issue-link">The Synthesis &#8594;</Link>
      </div>

      {/* Lead article */}
      {lead && (
        <Link href={`/articles/${lead.slug}`} className="lead-card-link">
          <article className="lead-card">
            <span className="kicker kicker-accent">{lead.topic.name}</span>
            <h1 className="lead-headline">{lead.headline}</h1>
            <p className="lead-deck">{lead.deck}</p>
            <div className="lead-meta">
              <span className="lead-author">{lead.author.name}</span>
              <span aria-hidden="true">&#xB7;</span>
              <span>{fmtDate(lead.publishedAt)}</span>
              <span aria-hidden="true">&#xB7;</span>
              <span>{lead.readMinutes} min</span>
              <span aria-hidden="true">&#xB7;</span>
              <span className="lead-likes" title="Endorsements">
                &#9825; {lead._count.endorsements.toLocaleString('en-NG')}
              </span>
            </div>
            {leadIntro && <p className="lead-intro">{leadIntro}</p>}
            {lead.rebuttedBy.length > 0 && (
              <span className="rb-inline">
                <span className="rb-glyph" aria-hidden="true">&#8644;</span>
                Rebutted by {lead.rebuttedBy.length}
              </span>
            )}
          </article>
        </Link>
      )}

      <hr className="rule rule-thick" />

      {/* Synthesis strip */}
      {latestSynthesis ? (
        <Link href={`/synthesis/${latestSynthesis.slug}`} className="synth-strip">
          <div className="synth-strip-num">&#8470;&nbsp;{latestSynthesis.issueNumber}</div>
          <div className="synth-strip-body">
            <span className="kicker">The Synthesis · This week</span>
            <h3>{latestSynthesis.title}</h3>
            <span className="synth-strip-meta">
              {latestSynthesis.articles.length} piece{latestSynthesis.articles.length !== 1 ? 's' : ''}&nbsp;·&nbsp;edited by {latestSynthesis.editor.name}
            </span>
          </div>
          <span className="synth-strip-arrow" aria-hidden="true">&#8594;</span>
        </Link>
      ) : (
        <Link href="/synthesis" className="synth-strip">
          <div className="synth-strip-body">
            <span className="kicker">The Synthesis</span>
            <h3>Weekly editorial briefings on Nigerian economics</h3>
          </div>
          <span className="synth-strip-arrow" aria-hidden="true">&#8594;</span>
        </Link>
      )}

      <hr className="rule rule-thick" />

      {/* Active debates */}
      {debateArticles.length > 0 && (
        <>
          <section className="home-debates">
            <header className="home-section-head">
              <span className="kicker kicker-accent">Active debates</span>
              <Link href="/rebuttals" className="home-section-more">Rebuttal index &#8594;</Link>
            </header>
            <ul className="debates-list">
              {debateArticles.map((a) => (
                <li key={a.id} className="debate-row">
                  <div className="debate-glyph" aria-hidden="true">&#8644;</div>
                  <div className="debate-body">
                    <Link href={`/articles/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="debate-title">{a.headline}</div>
                    </Link>
                    <div className="debate-meta">
                      {a.author.name}&nbsp;·&nbsp;
                      <span className="debate-rebutters">
                        Rebutted by {a.rebuttedBy.length}
                      </span>
                    </div>
                    <ul className="debate-responses">
                      {a.rebuttedBy.map((rb) => (
                        <li key={rb.rebuttalArticleId}>
                          <span className={`debate-stance ${stanceClass(rb.stance)}`}>
                            {stanceLabel(rb.stance)}
                          </span>
                          <span className="debate-r-title">{rb.rebuttalArticle.headline}</span>
                          <span className="debate-r-author">{rb.rebuttalArticle.author.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <hr className="rule rule-thick" />
        </>
      )}

      {/* Feature */}
      {feature && (
        <>
          <Link href={`/articles/${feature.slug}`} className="feature-card-link">
            <article className="feature-card">
              <span className="kicker">{feature.topic.name}</span>
              <h2 className="feature-headline">{feature.headline}</h2>
              <p className="feature-deck">{feature.deck}</p>
              <div className="feature-meta">
                {feature.author.name}&nbsp;·&nbsp;{fmtDate(feature.publishedAt)}&nbsp;·&nbsp;{feature.readMinutes} min
                {feature.rebuttedBy.length > 0 && (
                  <span className="rb-pill">&nbsp;&#8644; Rebutted</span>
                )}
              </div>
              {featureIntro && <p className="feature-intro">{featureIntro}</p>}
            </article>
          </Link>
          <hr className="rule rule-thin" />
        </>
      )}

      {/* Tertiary pair */}
      {(pairLeft || pairRight) && (
        <>
          <div className="pair">
            {pairLeft && (
              <Link href={`/articles/${pairLeft.slug}`} className="pair-card-link">
                <article className="pair-card">
                  <span className="kicker">{pairLeft.topic.name}</span>
                  <h3 className="pair-headline">{pairLeft.headline}</h3>
                  {pairLeft.deck && <p className="pair-deck">{pairLeft.deck}</p>}
                  <div className="pair-meta">{pairLeft.author.name}&nbsp;·&nbsp;{pairLeft.readMinutes} min</div>
                  {pairLeftIntro && <p className="pair-intro">{pairLeftIntro}</p>}
                </article>
              </Link>
            )}
            {pairRight && (
              <Link href={`/articles/${pairRight.slug}`} className="pair-card-link">
                <article className="pair-card">
                  <span className="kicker">{pairRight.topic.name}</span>
                  <h3 className="pair-headline">{pairRight.headline}</h3>
                  {pairRight.deck && <p className="pair-deck">{pairRight.deck}</p>}
                  <div className="pair-meta">{pairRight.author.name}&nbsp;·&nbsp;{pairRight.readMinutes} min</div>
                  {pairRightIntro && <p className="pair-intro">{pairRightIntro}</p>}
                </article>
              </Link>
            )}
          </div>
          <hr className="rule rule-thick" />
        </>
      )}

      {/* Earlier this week */}
      {listArticles.length > 0 && (
        <>
          <section className="home-list">
            <header className="home-section-head">
              <span className="kicker">Earlier this week</span>
            </header>
            <ul>
              {listArticles.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`}>
                    <div className="hl-kicker">{a.topic.name}</div>
                    <div className="hl-head">
                      {a.headline}
                      {a.rebuttedBy.length > 0 && (
                        <span className="rb-pill">&nbsp;&#8644; Rebutted</span>
                      )}
                    </div>
                    {a.deck && <div className="hl-deck">{a.deck}</div>}
                    <div className="hl-meta">
                      {a.author.name}&nbsp;·&nbsp;{fmtDate(a.publishedAt)}&nbsp;·&nbsp;{a.readMinutes} min
                    </div>
                    {(() => { const intro = getIntro(a); return intro ? <div className="hl-intro">{intro}</div> : null })()}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <hr className="rule rule-thick" />
        </>
      )}

      {/* Newsletter CTA */}
      <div className="news-cta">
        <span className="kicker">Newsletter</span>
        <h3>The Synthesis, every week</h3>
        <p>
          One rigorous briefing on the economics shaping Nigeria &#8212; arguments, data,
          and the best of our recent writing.
        </p>
        <Link href="/newsletter" className="news-cta-arrow">Subscribe &#8594;</Link>
      </div>

    </div>
  )
}
