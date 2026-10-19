import { format, isValid, parseISO } from 'date-fns'

function parseFilingDay(iso?: string | null): Date | null {
  if (!iso?.trim()) return null
  const day = parseISO(iso.slice(0, 10))
  return isValid(day) ? day : null
}

/** Human label for issuer preview `first_filed` / `last_filed` (filing dates). */
export function filingRangeLabel(
  first?: string | null,
  last?: string | null,
): string | null {
  const start = parseFilingDay(first)
  const end = parseFilingDay(last)
  const single = start ?? end
  if (!single) return null

  const rangeEnd = end ?? start
  const rangeStart = start ?? end
  if (!rangeStart || !rangeEnd || rangeStart.getTime() === rangeEnd.getTime()) {
    return `Filed (range): ${format(single, 'MMM d, yyyy')}`
  }

  if (
    rangeStart.getFullYear() === rangeEnd.getFullYear() &&
    rangeStart.getMonth() === rangeEnd.getMonth()
  ) {
    return `Filed (range): ${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'd, yyyy')}`
  }
  if (rangeStart.getFullYear() === rangeEnd.getFullYear()) {
    return `Filed (range): ${format(rangeStart, 'MMM d')} – ${format(rangeEnd, 'MMM d, yyyy')}`
  }
  return `Filed (range): ${format(rangeStart, 'MMM d, yyyy')} – ${format(rangeEnd, 'MMM d, yyyy')}`
}

export function money(value: number): string {
  const amount = Math.abs(value)
  let text: string
  if (amount >= 1_000_000_000) {
    text = `$${compact(amount / 1_000_000_000)}B`
  } else if (amount >= 1_000_000) {
    text = `$${compact(amount / 1_000_000)}M`
  } else if (amount >= 10_000) {
    text = `$${compact(amount / 1_000)}K`
  } else {
    text = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  if (value < 0) return `−${text}`
  return text
}

function compact(value: number): string {
  if (value >= 100 || value === Math.round(value)) {
    return String(Math.round(value))
  }
  return value.toFixed(1)
}

export function codeLabel(code?: string | null): string {
  switch (code) {
    case 'P':
      return 'Purchase'
    case 'S':
      return 'Sale'
    default:
      return code ?? 'Trade'
  }
}

export function activity(buys: number, sells: number): string {
  const parts: string[] = []
  if (buys > 0) parts.push(`${buys} ${buys === 1 ? 'buy' : 'buys'}`)
  if (sells > 0) parts.push(`${sells} ${sells === 1 ? 'sale' : 'sales'}`)
  return parts.length ? parts.join(' · ') : 'No trades'
}
