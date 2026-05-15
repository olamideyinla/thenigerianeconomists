import { db } from '@/lib/db'
import { format } from 'date-fns'
import { CorrectionForm } from './CorrectionForm'

export const metadata = { title: 'Corrections' }

export default async function AdminCorrectionsPage() {
  const [corrections, articles] = await Promise.all([
    db.correction.findMany({
      orderBy: { issuedAt: 'desc' },
      take: 50,
      include: { article: { select: { headline: true, slug: true } } },
    }),
    db.article.findMany({
      where: { status: { in: ['PUBLISHED', 'DRAFT', 'IN_REVIEW'] } },
      orderBy: { headline: 'asc' },
      select: { id: true, headline: true },
    }),
  ])

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Corrections</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Severity</th>
                  <th>Correction</th>
                  <th>Issued</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((c) => (
                  <tr key={c.id}>
                    <td className="text-sm font-medium max-w-xs truncate">{c.article.headline}</td>
                    <td>
                      <span className={`status-badge ${c.severityLevel === 'SIGNIFICANT' || c.severityLevel === 'FACTUAL' ? 'status-RETRACTED' : 'status-IN_REVIEW'}`}>
                        {c.severityLevel}
                      </span>
                    </td>
                    <td className="text-sm text-gray-700 max-w-sm">{c.correctionText}</td>
                    <td className="text-xs text-gray-500">{format(new Date(c.issuedAt), 'd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {corrections.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400">No corrections issued.</div>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Issue correction
          </h2>
          <CorrectionForm articles={articles} />
        </div>
      </div>
    </div>
  )
}
