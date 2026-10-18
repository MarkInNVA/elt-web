import type { IssuerBuySellRow } from './types'
import { displayNet } from './types'

export interface SectorGroup {
  id: string
  name: string
  rows: IssuerBuySellRow[]
}

export function sectorGroups(issuers: IssuerBuySellRow[]): SectorGroup[] {
  const map = new Map<string, IssuerBuySellRow[]>()
  for (const row of issuers) {
    const name = row.sector?.trim() || 'Other'
    const list = map.get(name) ?? []
    list.push(row)
    map.set(name, list)
  }
  const groups: SectorGroup[] = []
  for (const [name, rows] of map) {
    const sorted = [...rows].sort((a, b) => {
      const net = displayNet(b) - displayNet(a)
      if (net !== 0) return net
      return a.ticker.localeCompare(b.ticker)
    })
    groups.push({ id: name, name, rows: sorted })
  }
  return groups.sort((a, b) => {
    const aNet = a.rows.reduce((s, r) => s + displayNet(r), 0)
    const bNet = b.rows.reduce((s, r) => s + displayNet(r), 0)
    if (bNet !== aNet) return bNet - aNet
    return a.name.localeCompare(b.name)
  })
}

export function groupTotals(group: SectorGroup) {
  let buyTxn = 0
  let sellTxn = 0
  let buyValue = 0
  let sellValue = 0
  for (const row of group.rows) {
    buyTxn += row.buy_txn_count ?? 0
    sellTxn += row.sell_txn_count ?? 0
    buyValue += row.buy_value ?? 0
    sellValue += row.sell_value ?? 0
  }
  const net = buyValue - sellValue
  return { buyTxn, sellTxn, buyValue, sellValue, net }
}
