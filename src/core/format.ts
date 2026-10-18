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
