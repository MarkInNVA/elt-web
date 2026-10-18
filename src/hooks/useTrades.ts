import { useQuery } from '@tanstack/react-query'
import { describeApiError, fetchTransactions } from '../core/api'
import { transactionsRequest } from '../core/lakeScope'
import { loadTrades, saveTrades, tradeGrainToken } from '../core/snapshotStore'
import type { TransactionRow } from '../core/types'

export function useTrades(
  edition: string,
  windowDays: number,
  grain: { ticker: string } | { ownerCik: string },
) {
  const token = tradeGrainToken(grain)
  return useQuery({
    queryKey: ['trades', edition, windowDays, token],
    queryFn: async (): Promise<TransactionRow[]> => {
      const cached = loadTrades(edition, windowDays, token)
      if (cached) return cached
      const rows = await fetchTransactions(transactionsRequest(windowDays, edition, grain))
      saveTrades(edition, windowDays, token, rows)
      return rows
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
    meta: { describeError: describeApiError },
  })
}
