import { describe, expect, it } from 'vitest'
import type { IssuerBuySellRow } from './types'
import { sectorGroups } from './sectors'

function issuer(
  ticker: string,
  overrides: Partial<IssuerBuySellRow> = {},
): IssuerBuySellRow {
  return { ticker, sector: 'Tech', ...overrides }
}

describe('sectorGroups', () => {
  it('sorts by net then last_filed desc then ticker', () => {
    const groups = sectorGroups([
      issuer('AAA', { net_value: 1_000_000, last_filed: '2026-10-01' }),
      issuer('BBB', { net_value: 1_000_000, last_filed: '2026-10-15' }),
      issuer('CCC', { net_value: 2_000_000, last_filed: '2026-09-01' }),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].rows.map((r) => r.ticker)).toEqual(['CCC', 'BBB', 'AAA'])
  })

  it('sorts missing last_filed after dated rows at the same net', () => {
    const groups = sectorGroups([
      issuer('AAA', { net_value: 500_000, last_filed: '2026-10-10' }),
      issuer('BBB', { net_value: 500_000, last_filed: null }),
      issuer('CCC', { net_value: 500_000, last_filed: '2026-10-12' }),
    ])
    expect(groups[0].rows.map((r) => r.ticker)).toEqual(['CCC', 'AAA', 'BBB'])
  })

  it('uses ticker when net and last_filed match', () => {
    const groups = sectorGroups([
      issuer('ZZZ', { net_value: 100, last_filed: '2026-10-05' }),
      issuer('AAA', { net_value: 100, last_filed: '2026-10-05' }),
    ])
    expect(groups[0].rows.map((r) => r.ticker)).toEqual(['AAA', 'ZZZ'])
  })
})
