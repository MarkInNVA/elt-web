export interface IssuerBuySellRow {
  ticker: string
  company?: string | null
  sector?: string | null
  sub_industry?: string | null
  buy_txn_count?: number
  sell_txn_count?: number
  buy_value?: number | null
  sell_value?: number | null
  net_value?: number | null
  first_filed?: string | null
  last_filed?: string | null
}

export interface InsiderCrossIssuerRow {
  owner_cik: string
  owner_name?: string | null
  company_count?: number
  tickers?: string[]
  buy_txn_count?: number
  sell_txn_count?: number
  buy_value?: number | null
  sell_value?: number | null
  net_value?: number | null
  first_filed?: string | null
  last_filed?: string | null
}

export interface TransactionRow {
  filing_date?: string | null
  transaction_date?: string | null
  ticker: string
  company?: string | null
  owner_cik?: string | null
  owner_name?: string | null
  owner_position?: string | null
  code?: string | null
  value?: number | null
  shares?: number | null
  price?: number | null
  security?: string | null
  is_10b5_1?: boolean | null
  accession?: string | null
  filing_url?: string | null
}

export interface Snapshot {
  edition: string
  windowDays: number
  fetchedAt: string
  issuers: IssuerBuySellRow[]
  people: InsiderCrossIssuerRow[]
  windowFrom?: string
  windowTo?: string
}

export function displayNet(row: {
  net_value?: number | null
  buy_value?: number | null
  sell_value?: number | null
}): number {
  if (row.net_value != null) return row.net_value
  return (row.buy_value ?? 0) - (row.sell_value ?? 0)
}

export function snapshotCaption(snapshot: Snapshot): string {
  if (snapshot.windowFrom && snapshot.windowTo) {
    return `${snapshot.windowDays} days · ${snapshot.windowFrom} – ${snapshot.windowTo}`
  }
  return `${snapshot.windowDays} days · through ${snapshot.edition}`
}

export function lagLookbackNote(snapshot: Snapshot): string | null {
  if (!snapshot.windowTo || snapshot.windowTo === snapshot.edition) return null
  return `Filings through ${snapshot.windowTo}; catalog day ${snapshot.edition}`
}

export function isEmptyPreview(snapshot: Snapshot): boolean {
  return snapshot.issuers.length === 0 && snapshot.people.length === 0
}

export function parsePreviewBody(body: unknown): {
  issuers: IssuerBuySellRow[]
  people: InsiderCrossIssuerRow[]
  windowFrom?: string
  windowTo?: string
} {
  const root = body as Record<string, unknown>
  const scope = root.scope as { window?: { from?: string; to?: string } } | undefined
  const sections = root.sections as Record<string, unknown> | undefined
  return {
    issuers: (sections?.issuer_buy_sell as IssuerBuySellRow[]) ?? [],
    people: (sections?.insider_cross_issuer as InsiderCrossIssuerRow[]) ?? [],
    windowFrom: scope?.window?.from,
    windowTo: scope?.window?.to,
  }
}

export function parseTransactionsBody(body: unknown): TransactionRow[] {
  const root = body as { transactions?: TransactionRow[] }
  return root.transactions ?? []
}
