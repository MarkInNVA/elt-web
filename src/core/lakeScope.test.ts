import { describe, expect, it } from 'vitest'
import { LAKE_SCOPE, previewRequest } from './lakeScope'

describe('lakeScope', () => {
  it('matches iOS preview recipe for edition cache', () => {
    const body = previewRequest(14, '2026-10-17', LAKE_SCOPE.issuerSection)
    expect(body).toEqual({
      scope: {
        universe: 'sp500',
        window: { days: 14, to: '2026-10-17' },
        codes: ['P', 'S'],
        materiality: { min_value: 500_000 },
        filters: { exclude_10b5_1: true, require_officer: false },
        sectors: [],
      },
      sections: ['issuer_buy_sell'],
      limit: 100,
    })
  })
})
