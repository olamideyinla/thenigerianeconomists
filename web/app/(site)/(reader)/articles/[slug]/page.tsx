import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { compileMdx } from '@/lib/mdx'
import { formatDate } from '@/lib/format'
import { Byline } from '@/components/reader/Byline'
import { COIDisclosure } from '@/components/reader/COIDisclosure'
import { ReferencesList } from '@/components/reader/ReferencesList'
import { LikeBar } from '@/components/reader/LikeBar'
import { ReaderNotes } from '@/components/reader/ReaderNotes'
import { ReadingProgress } from '@/components/reader/ReadingProgress'
import { RebuttalIndicator } from '@/components/reader/RebuttalIndicator'
import { RebuttalThread } from '@/components/reader/RebuttalThread'
import { RebuttalAlertButton } from '@/components/reader/RebuttalAlertButton'
import { ArticleClientShell } from './ArticleClientShell'
import type { RefItem } from '@/context/ReferenceContext'
import type { FigureShape } from '@/context/FigureContext'
import type { RebuttalEntry } from '@/components/reader/RebuttalIndicator'
import type { ResponseEntry } from '@/components/reader/RebuttalThread'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await db.article.findUnique({
    where: { slug },
    select: {
      headline: true,
      deck: true,
      excerpt: true,
      publishedAt: true,
      author: { select: { name: true } },
      topic: { select: { name: true } },
    },
  })
  if (!article) return {}

  // Prefer the hand-written excerpt; fall back to the deck
  const description = article.excerpt || article.deck

  return {
    title: article.headline,
    description,
    openGraph: {
      title: article.headline,
      description,
      url: `/articles/${slug}`,
      type: 'article',
      siteName: 'The Nigerian Economists',
      // og:image is automatically added by Next.js from opengraph-image.tsx
      ...(article.publishedAt && { publishedTime: article.publishedAt.toISOString() }),
      authors: [article.author.name],
      section: article.topic.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.headline,
      description,
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  const article = await db.article.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: {
        include: {
          disclosures: { where: { effectiveTo: null } },
        },
      },
      topic: true,
      references: { orderBy: { indexNumber: 'asc' } },
      figures: {
        include: {
          mediaAsset: true,
          chartEmbed: {
            include: { staticFallbackAsset: true },
          },
          chartNative: true,
          dataTable: true,
        },
        orderBy: { position: 'asc' },
      },
      rebuttedBy: {
        include: {
          rebuttalArticle: {
            include: { author: true },
          },
        },
      },
    },
  })

  if (!article) notFound()

  // ── Session ───────────────────────────────────────────────────────

  const session = await auth()
  const userId = session?.user?.id

  // ── Endorsement count + current-user status ───────────────────────

  const [endorsementCount, userEndorsement, userRebuttalAlert] = await Promise.all([
    db.endorsement.count({ where: { articleId: article.id } }),
    userId
      ? db.endorsement.findUnique({
          where: { articleId_userId: { articleId: article.id, userId } },
          select: { id: true },
        })
      : Promise.resolve(null),
    userId && session?.user?.email
      ? db.rebuttalAlert.findUnique({
          where: { articleId_email: { articleId: article.id, email: session.user.email } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ])

  // ── Approved reader notes (first 10) ─────────────────────────────

  const [approvedNotes, notesTotal] = await Promise.all([
    db.readerNote.findMany({
      where: { articleId: article.id, status: 'APPROVED' },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    db.readerNote.count({ where: { articleId: article.id, status: 'APPROVED' } }),
  ])

  const initialNotes = approvedNotes.map((n) => ({
    id: n.id,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    userId: n.userId,
    userName: n.user.name ?? n.user.email?.split('@')[0] ?? 'Reader',
  }))

  // ── Related articles (same topic, different slug, published) ─────

  const related = await db.article.findMany({
    where: {
      status: 'PUBLISHED',
      topicId: article.topicId,
      slug: { not: article.slug },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: { author: true, topic: true },
  })

  // ── Shape data for contexts ──────────────────────────────────────

  const refs: RefItem[] = article.references.map((r) => ({
    author: r.author,
    year: r.year,
    title: r.title,
    pub: r.publication ?? undefined,
    url: r.url ?? undefined,
  }))

  // Cast Prisma JSON fields to the lean shapes FigureContext expects
  const figures = article.figures as unknown as FigureShape[]

  // ── Compile MDX ──────────────────────────────────────────────────

  const { content } = await compileMdx(article.contentMdx)

  // ── COI items ────────────────────────────────────────────────────

  const coiItems = article.author.disclosures.map((d) => d.text)

  // ── Rebuttal indicator entries ───────────────────────────────────

  const rebuttalEntries: RebuttalEntry[] = article.rebuttedBy.map((rb) => ({
    title: rb.rebuttalArticle.headline,
    author: rb.rebuttalArticle.author.name,
    date: rb.rebuttalArticle.publishedAt
      ? formatDate(rb.rebuttalArticle.publishedAt)
      : '',
  }))

  // ── Response thread entries ───────────────────────────────────────

  const responses: ResponseEntry[] = article.rebuttedBy.map((rb) => ({
    title: rb.rebuttalArticle.headline,
    author: rb.rebuttalArticle.author.name,
    date: rb.rebuttalArticle.publishedAt
      ? formatDate(rb.rebuttalArticle.publishedAt)
      : '',
    stance: rb.stance === 'REBUTS' ? 'rebuts' : 'extends',
  }))

  // ── Author first name (for "All pieces by …" link) ───────────────

  const authorFirstName = article.author.name.split(' ')[0] ?? article.author.name

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="page page-article">
      <ReadingProgress />

      <ArticleClientShell refs={refs} figures={figures}>
        {/* article-main is the primary column; CitationRail is the second column */}
        <article className="article-main">
          {/* ── JSON-LD ───────────────────────────────────────── */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: article.headline,
                description: article.deck,
                author: {
                  '@type': 'Person',
                  name: article.author.name,
                  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/authors/${article.author.slug}`,
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'The Nigerian Economists',
                  url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
                },
                datePublished: article.publishedAt?.toISOString(),
                dateModified: article.updatedAt?.toISOString(),
                url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/articles/${article.slug}`,
              }),
            }}
          />

          {/* ── Article head ──────────────────────────────────── */}
          <header className="article-head">
            <div className="article-kicker-row">
              <span className="kicker kicker-accent">{article.kicker}</span>
              <Link
                href={`/topics/${article.topic.slug}`}
                className="article-topic-link"
              >
                in {article.topic.name} &#8594;
              </Link>
            </div>
            <h1 className="article-headline">{article.headline}</h1>
            <p className="article-deck">{article.deck}</p>

            <Byline
              name={article.author.name}
              role={article.author.role}
              date={article.publishedAt ? formatDate(article.publishedAt) : undefined}
              readMins={article.readMinutes}
            />

            {coiItems.length > 0 && (
              <COIDisclosure
                affiliation={article.author.affiliation}
                items={coiItems}
              />
            )}

            {rebuttalEntries.length > 0 && (
              <RebuttalIndicator rebuttals={rebuttalEntries} variant="block" />
            )}

            <div style={{ marginTop: '0.75rem' }}>
              <RebuttalAlertButton
                articleSlug={article.slug}
                initialSubscribed={!!userRebuttalAlert}
                isAuthenticated={!!userId}
              />
            </div>
          </header>

          {/* ── Like bar + share buttons ───────────────────────── */}
          <LikeBar
            articleSlug={article.slug}
            articleTitle={article.headline}
            initialCount={endorsementCount}
            initialLiked={!!userEndorsement}
            isAuthenticated={!!userId}
          />

          {/* ── MDX body ──────────────────────────────────────── */}
          <div className="article-body">{content}</div>

          {/* ── References ────────────────────────────────────── */}
          {refs.length > 0 && <ReferencesList refs={refs} />}

          <hr className="rule rule-thick" />

          {/* ── Response thread ───────────────────────────────── */}
          {responses.length > 0 && (
            <RebuttalThread
              originalTitle={article.headline}
              originalAuthor={article.author.name}
              responses={responses}
            />
          )}

          {responses.length > 0 && <hr className="rule rule-thick" />}

          {/* ── Reader notes ──────────────────────────────────── */}
          <ReaderNotes
            initialNotes={initialNotes}
            totalCount={notesTotal}
            articleSlug={article.slug}
            isAuthenticated={!!userId}
            currentUserId={userId}
          />

          <hr className="rule rule-thick" />

          {/* ── Author bio card ───────────────────────────────── */}
          <section className="author-card">
            <Link href={`/authors/${article.author.slug}`} className="ac-row">
              {article.author.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className="ac-avatar"
                  width={56}
                  height={56}
                />
              )}
              <div className="ac-body">
                <div className="ac-name">{article.author.name}</div>
                <div className="ac-role">
                  {article.author.role}
                  {article.author.affiliation
                    ? `, ${article.author.affiliation}`
                    : ''}
                </div>
              </div>
            </Link>
            {article.author.bio && (
              <p className="ac-bio">{article.author.bio}</p>
            )}
            <Link
              href={`/authors/${article.author.slug}`}
              className="ac-more"
            >
              All pieces by {authorFirstName} &#8594;
            </Link>
          </section>

          <hr className="rule rule-thick" />

          {/* ── Related reading ───────────────────────────────── */}
          {related.length > 0 && (
            <section className="related">
              <header className="home-section-head">
                <span className="kicker">Related reading</span>
              </header>
              <ul>
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/articles/${r.slug}`}>
                      <div className="rel-kicker">{r.topic.name}</div>
                      <div className="rel-head">{r.headline}</div>
                      <div className="rel-meta">
                        {r.author.name}
                        {r.publishedAt
                          ? ` · ${formatDate(r.publishedAt)}`
                          : ''}
                        {` · ${r.readMinutes} min`}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </ArticleClientShell>
    </div>
  )
}
