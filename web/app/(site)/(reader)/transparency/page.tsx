import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Funders & Transparency',
  description: 'A public register of all organisations and individuals that fund The Nigerian Economists.',
}

export default async function TransparencyPage() {
  const funders = await db.funder.findMany({
    orderBy: [{ isCurrent: 'desc' }, { displayOrder: 'asc' }],
  })

  const current = funders.filter(f => f.isCurrent)
  const former = funders.filter(f => !f.isCurrent)

  return (
    <div className="page page-topic">
      <header className="topic-head">
        <span className="kicker kicker-accent">Transparency</span>
        <h1 className="topic-title">Funders &amp; Transparency</h1>
        <p className="topic-deck">
          We maintain a complete public register of all organisations and individuals that
          fund this publication. Our editorial decisions are not subject to funder review.
        </p>
      </header>

      <div style={{ padding: '0 var(--gutter) 24px' }}>
        <span className="kicker">Current funders</span>
        {current.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: '12px' }}>
            No current funders on record.
          </p>
        )}
        {current.length > 0 && (
          <table className="article-table" style={{ marginTop: '16px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'left' }}>Type</th>
                <th style={{ textAlign: 'left' }}>Period</th>
                <th style={{ textAlign: 'right' }}>Amount range</th>
              </tr>
            </thead>
            <tbody>
              {current.map(f => (
                <tr key={f.id}>
                  <td>{f.url ? <a href={f.url} style={{ color: 'var(--accent)' }}>{f.name}</a> : f.name}</td>
                  <td>{f.type.replace('_', ' ').toLowerCase()}</td>
                  <td>{format(new Date(f.periodStart), 'MMM yyyy')} \u2013 {f.periodEnd ? format(new Date(f.periodEnd), 'MMM yyyy') : 'present'}</td>
                  <td style={{ textAlign: 'right' }}>{f.amountRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {former.length > 0 && (
        <div style={{ padding: '0 var(--gutter) 24px' }}>
          <span className="kicker">Former funders</span>
          <table className="article-table" style={{ marginTop: '16px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Name</th>
                <th style={{ textAlign: 'left' }}>Type</th>
                <th style={{ textAlign: 'left' }}>Period</th>
                <th style={{ textAlign: 'right' }}>Amount range</th>
              </tr>
            </thead>
            <tbody>
              {former.map(f => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.type.replace('_', ' ').toLowerCase()}</td>
                  <td>{format(new Date(f.periodStart), 'MMM yyyy')} \u2013 {f.periodEnd ? format(new Date(f.periodEnd), 'MMM yyyy') : 'present'}</td>
                  <td style={{ textAlign: 'right' }}>{f.amountRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr className="rule rule-thick" />

      <section style={{ padding: '0 var(--gutter) 24px' }}>
        <span className="kicker">Editorial independence</span>
        <div className="synth-editorial">
          <p>
            All editorial decisions \u2014 including which pieces to commission, which rebuttals
            to accept, and which corrections to issue \u2014 are made exclusively by our editorial
            board. Funders have no input into, or advance knowledge of, any editorial decision.
          </p>
          <p>
            We will not accept funding from: political parties, government agencies,
            organisations under active investigation for financial irregularities, or any
            entity with a direct material interest in the topics we cover.
          </p>
        </div>
      </section>
    </div>
  )
}
