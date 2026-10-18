import { describeApiError, fetchPreview } from './api'
import { currentEditionFilingDay, previousFilingDay } from './edition'
import { LAKE_SCOPE, previewRequest } from './lakeScope'
import { loadSnapshot, pruneSnapshots, saveSnapshot } from './snapshotStore'
import type { InsiderCrossIssuerRow, IssuerBuySellRow, Snapshot } from './types'
import { isEmptyPreview } from './types'

export interface BrowseResult {
  snapshot: Snapshot | null
  errorMessage: string | null
}

async function fetchPair(
  windowDays: number,
  probeDay: string,
): Promise<
  | {
      ok: true
      issuers: IssuerBuySellRow[]
      people: InsiderCrossIssuerRow[]
      windowFrom?: string
      windowTo?: string
    }
  | { ok: false; error: string }
> {
  try {
    const issuersPayload = await fetchPreview(
      previewRequest(windowDays, probeDay, LAKE_SCOPE.issuerSection),
    )
    const peoplePayload = await fetchPreview(
      previewRequest(windowDays, probeDay, LAKE_SCOPE.peopleSection),
    )
    return {
      ok: true,
      issuers: issuersPayload.issuers,
      people: peoplePayload.people,
      windowFrom: issuersPayload.windowFrom ?? peoplePayload.windowFrom,
      windowTo: issuersPayload.windowTo ?? peoplePayload.windowTo,
    }
  } catch (err) {
    return { ok: false, error: describeApiError(err) }
  }
}

function shouldStop(
  issuers: IssuerBuySellRow[],
  people: InsiderCrossIssuerRow[],
  step: number,
): boolean {
  if (issuers.length > 0 || people.length > 0) return true
  return step + 1 >= LAKE_SCOPE.maxLakeLagLookback
}

export async function fetchCatalogSnapshot(windowDays: number): Promise<BrowseResult> {
  const catalogEdition = currentEditionFilingDay()
  let probeDay = catalogEdition

  for (let step = 0; step < LAKE_SCOPE.maxLakeLagLookback; step += 1) {
    const pair = await fetchPair(windowDays, probeDay)
    if (!pair.ok) {
      return { snapshot: null, errorMessage: pair.error }
    }
    if (shouldStop(pair.issuers, pair.people, step)) {
      if (pair.issuers.length === 0 && pair.people.length === 0) {
        return {
          snapshot: null,
          errorMessage:
            'No preview for recent filing days. The lake may still be updating after nightly ingest.',
        }
      }
      const snapshot: Snapshot = {
        edition: catalogEdition,
        windowDays,
        fetchedAt: new Date().toISOString(),
        issuers: pair.issuers,
        people: pair.people,
        windowFrom: pair.windowFrom,
        windowTo: pair.windowTo,
      }
      saveSnapshot(snapshot)
      pruneSnapshots(catalogEdition)
      return { snapshot, errorMessage: null }
    }
    probeDay = previousFilingDay(probeDay)
  }

  return {
    snapshot: null,
    errorMessage:
      'No preview for recent filing days. The lake may still be updating after nightly ingest.',
  }
}

export async function refreshSnapshot(
  windowDays: number,
  memory: Snapshot | null,
): Promise<BrowseResult> {
  const catalogEdition = currentEditionFilingDay()
  if (
    memory &&
    memory.windowDays === windowDays &&
    memory.edition === catalogEdition &&
    !isEmptyPreview(memory)
  ) {
    return { snapshot: memory, errorMessage: null }
  }

  const cached = loadSnapshot(catalogEdition, windowDays)
  if (cached && !isEmptyPreview(cached)) {
    return { snapshot: cached, errorMessage: null }
  }

  return fetchCatalogSnapshot(windowDays)
}
