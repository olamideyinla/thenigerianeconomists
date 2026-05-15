import type { Metadata } from 'next'
import { NewsletterForm } from './NewsletterForm'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'A serious economics letter, delivered Sunday morning. One synthesis. The week\u2019s three most important pieces. One chart that matters.',
}

export default function NewsletterPage() {
  return (
    <div className="page page-newsletter">
      <header className="news-head">
        <span className="kicker kicker-accent">The weekly letter</span>
        <h1 className="news-title">A serious economics letter, delivered Sunday morning.</h1>
        <p className="news-deck">
          One synthesis. The week&#8217;s three most important pieces. One chart that matters.
          No summaries of what you already read. No advertising &#8212; ever.
        </p>
      </header>
      <NewsletterForm />
      <hr className="rule rule-thick" />
      <section className="news-archive">
        <span className="kicker">Recent letters</span>
        <ul>
          <li><span className="na-date">10 May 2026</span><span className="na-title">When the budget framework stops being believable</span></li>
          <li><span className="na-date">03 May 2026</span><span className="na-title">The two charts you should look at this week</span></li>
          <li><span className="na-date">26 Apr 2026</span><span className="na-title">On the Q1 GDP print, and what the deflator is hiding</span></li>
          <li><span className="na-date">19 Apr 2026</span><span className="na-title">A reading list on subnational fiscal stress</span></li>
        </ul>
      </section>
    </div>
  )
}
