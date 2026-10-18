import type { Snapshot } from './types'
import type { TransactionRow } from './types'

const SNAPSHOT_PREFIX = 'elt:snapshot:'
const TRADES_PREFIX = 'elt:trades:'

function snapshotKey(edition: string, windowDays: number): string {
  return `${SNAPSHOT_PREFIX}${edition}:${windowDays}`
}

function tradesKey(
  edition: string,
  windowDays: number,
  grain: string,
): string {
  return `${TRADES_PREFIX}${edition}:${windowDays}:${grain}`
}

export function loadSnapshot(edition: string, windowDays: number): Snapshot | null {
  try {
    const raw = localStorage.getItem(snapshotKey(edition, windowDays))
    if (!raw) return null
    return JSON.parse(raw) as Snapshot
  } catch {
    return null
  }
}

export function saveSnapshot(snapshot: Snapshot): void {
  localStorage.setItem(
    snapshotKey(snapshot.edition, snapshot.windowDays),
    JSON.stringify(snapshot),
  )
}

export function pruneSnapshots(keepingEdition: string): void {
  const prefix = `${SNAPSHOT_PREFIX}${keepingEdition}:`
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i)
    if (key?.startsWith(SNAPSHOT_PREFIX) && !key.startsWith(prefix)) {
      localStorage.removeItem(key)
    }
  }
}

export function loadTrades(
  edition: string,
  windowDays: number,
  grainToken: string,
): TransactionRow[] | null {
  try {
    const raw = localStorage.getItem(tradesKey(edition, windowDays, grainToken))
    if (!raw) return null
    return JSON.parse(raw) as TransactionRow[]
  } catch {
    return null
  }
}

export function saveTrades(
  edition: string,
  windowDays: number,
  grainToken: string,
  rows: TransactionRow[],
): void {
  localStorage.setItem(
    tradesKey(edition, windowDays, grainToken),
    JSON.stringify(rows),
  )
}

export function tradeGrainToken(grain: { ticker: string } | { ownerCik: string }): string {
  if ('ticker' in grain) {
    return `ticker-${grain.ticker.toUpperCase().replace(/[^A-Z0-9._-]/g, '-')}`
  }
  return `owner-${grain.ownerCik.replace(/[^A-Za-z0-9._-]/g, '-')}`
}
