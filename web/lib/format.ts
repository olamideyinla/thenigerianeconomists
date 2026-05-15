// Format helpers — naira, USD, percentages, large numbers, dates.
// Used by chart axes (NativeChart) and table cells (DataTableFigure).

const ngnFull = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
const usdFull = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** Compact naira: ₦480bn, ₦1.8tn, ₦240m */
export function formatNaira(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000_000_000) return `${sign}₦${(abs / 1_000_000_000_000).toFixed(1)}tn`
  if (abs >= 1_000_000_000)     return `${sign}₦${(abs / 1_000_000_000).toFixed(0)}bn`
  if (abs >= 1_000_000)         return `${sign}₦${(abs / 1_000_000).toFixed(0)}m`
  return ngnFull.format(amount)
}

/** Full NGN via Intl — for table cells */
export function formatNgnFull(amount: number): string {
  return ngnFull.format(amount)
}

/** Compact USD: $1.8bn, $240m */
export function formatUSD(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}bn`
  if (abs >= 1_000_000)     return `${sign}$${(abs / 1_000_000).toFixed(0)}m`
  return usdFull.format(amount)
}

/** Percentage: 22.1% */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** Large number: 1.4bn, 240m, 12k */
export function formatNumber(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}bn`
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(1)}m`
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(0)}k`
  return value.toLocaleString('en-NG')
}

/** Article publish date: 8 May 2026 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Format a raw cell value string according to its column AxisFormat.
 * Used by DataTableFigure for per-column rendering.
 */
export function formatCell(raw: string, format: string): string {
  const num = parseFloat(raw)
  if (isNaN(num) && format !== 'TEXT' && format !== 'DATE' && format !== 'CATEGORY') {
    return raw
  }
  switch (format) {
    case 'PERCENT':       return formatPercent(num)
    case 'CURRENCY_NGN':  return formatNgnFull(num)
    case 'CURRENCY_USD':  return formatUSD(num)
    case 'NUMBER':        return formatNumber(num)
    case 'DATE':
    case 'CATEGORY':
    case 'TEXT':
    default:
      return raw
  }
}
