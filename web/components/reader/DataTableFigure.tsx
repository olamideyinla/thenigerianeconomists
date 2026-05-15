import type { DataTableShape } from '@/context/FigureContext'
import { formatCell } from '@/lib/format'

interface DataTableFigureProps {
  table: DataTableShape
}

/**
 * Renders an HTML table from DataTable JSONB data.
 * Applies columnAlignments (left | right | center) and
 * columnFormats (PERCENT | CURRENCY_NGN | CURRENCY_USD | NUMBER | TEXT …).
 * Wrapped in a scroll-shadow div for mobile.
 */
export function DataTableFigure({ table }: DataTableFigureProps) {
  const { headers, rows, columnAlignments, columnFormats, sourceNote } = table

  const isNum = (i: number) => {
    const align = columnAlignments[i]
    return align === 'right' || align === 'center'
  }

  return (
    <div className="article-table-wrap">
      <table className="article-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={isNum(i) ? 'num' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={isNum(ci) ? 'num' : undefined}
                  style={{ textAlign: (columnAlignments[ci] as React.CSSProperties['textAlign']) ?? 'left' }}
                >
                  {formatCell(cell, columnFormats[ci] ?? 'TEXT')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {sourceNote && (
          <tfoot>
            <tr>
              <td colSpan={headers.length}>
                Source: {sourceNote}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
