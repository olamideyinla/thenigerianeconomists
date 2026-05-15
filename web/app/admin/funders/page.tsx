import { db } from '@/lib/db'
import { format } from 'date-fns'
import { FunderForm } from './FunderForm'

export const metadata = { title: 'Funders' }

export default async function AdminFundersPage() {
  const funders = await db.funder.findMany({ orderBy: { displayOrder: 'asc' } })

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Funders</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Amount range</th>
                <th>Period</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {funders.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.name}</td>
                  <td className="text-sm text-gray-600">{f.type}</td>
                  <td className="text-sm text-gray-600">{f.amountRange ?? '—'}</td>
                  <td className="text-sm text-gray-500">
                    {format(new Date(f.periodStart), 'MMM yyyy')}
                    {' – '}
                    {f.periodEnd ? format(new Date(f.periodEnd), 'MMM yyyy') : 'present'}
                  </td>
                  <td className="text-sm">{f.isCurrent ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {funders.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No funders listed.</div>
          )}
        </div>

        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Add funder
          </h2>
          <FunderForm />
        </div>
      </div>
    </div>
  )
}
