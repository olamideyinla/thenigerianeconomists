import Link from 'next/link'
import { db } from '@/lib/db'
import { SiteHeader } from '@/components/reader/SiteHeader'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const topicsRaw = await db.topic.findMany({
    orderBy: { displayOrder: 'asc' },
    select: {
      slug: true,
      name: true,
      _count: { select: { articles: { where: { status: 'PUBLISHED' } } } },
    },
  })

  const topics = topicsRaw.map((t) => ({
    slug: t.slug,
    name: t.name,
    count: t._count.articles,
  }))

  return (
    <>
      <SiteHeader topics={topics} />
      <main>{children}</main>
      <footer className="site-foot" aria-label="Site footer">
        <div className="sf-wordmark">
          <span className="sf-the">The</span>
          <span className="sf-ne">Nigerian Economists</span>
        </div>
        <p className="sf-tag">
          Rigorous economic analysis and commentary on Nigeria and Africa.
        </p>
        <div className="sf-cols">
          <nav aria-label="About">
            <span className="kicker">About</span>
            <ul>
              <li><Link href="/about">About the publication</Link></li>
              <li><Link href="/transparency">Funders &amp; Transparency</Link></li>
              <li><Link href="/about">Editorial Standards</Link></li>
              <li><Link href="/corrections">Corrections</Link></li>
            </ul>
          </nav>
          <nav aria-label="Read">
            <span className="kicker">Read</span>
            <ul>
              <li><Link href="/">Latest articles</Link></li>
              <li><Link href="/synthesis">The Synthesis</Link></li>
              <li><Link href="/rebuttals">Rebuttal index</Link></li>
            </ul>
          </nav>
          <nav aria-label="Connect">
            <span className="kicker">Connect</span>
            <ul>
              <li><Link href="/newsletter">Newsletter</Link></li>
              <li><Link href="/feed.xml">RSS feed</Link></li>
            </ul>
          </nav>
        </div>
        <div className="sf-foot">
          <span>&#169; {new Date().getFullYear()} The Nigerian Economists.</span>
          <span aria-hidden="true">&#xB7;</span>
          <span>All rights reserved.</span>
        </div>
      </footer>
    </>
  )
}
