/** Keep aligned with elt-ios `LakeScope.swift` and elt_pipeline `editions.py`. */

export const LAKE_SCOPE = {
  universe: 'sp500',
  codes: ['P', 'S'] as const,
  minValue: 500_000,
  limit: 100,
  issuerSection: 'issuer_buy_sell',
  peopleSection: 'insider_cross_issuer',
  windows: [7, 14, 30] as const,
  defaultWindow: 14,
  maxLakeLagLookback: 14,
} as const

export type WindowDays = (typeof LAKE_SCOPE.windows)[number]

export interface PreviewScope {
  universe: string
  window: { days: number; to: string }
  codes: string[]
  materiality: { min_value: number }
  filters: { exclude_10b5_1: boolean; require_officer: boolean }
  sectors: string[]
}

export interface PreviewRequest {
  scope: PreviewScope
  sections: string[]
  limit: number
}

export interface TransactionsRequest {
  scope: PreviewScope
  ticker?: string
  owner_cik?: string
  limit: number
}

export function previewScope(windowDays: number, filingDay: string): PreviewScope {
  return {
    universe: LAKE_SCOPE.universe,
    window: { days: windowDays, to: filingDay },
    codes: [...LAKE_SCOPE.codes],
    materiality: { min_value: LAKE_SCOPE.minValue },
    filters: { exclude_10b5_1: true, require_officer: false },
    sectors: [],
  }
}

export function previewRequest(
  windowDays: number,
  filingDay: string,
  section: string,
): PreviewRequest {
  return {
    scope: previewScope(windowDays, filingDay),
    sections: [section],
    limit: LAKE_SCOPE.limit,
  }
}

export function transactionsRequest(
  windowDays: number,
  filingDay: string,
  grain: { ticker: string } | { ownerCik: string },
): TransactionsRequest {
  const scope = previewScope(windowDays, filingDay)
  if ('ticker' in grain) {
    return { scope, ticker: grain.ticker, limit: LAKE_SCOPE.limit }
  }
  return { scope, owner_cik: grain.ownerCik, limit: LAKE_SCOPE.limit }
}
