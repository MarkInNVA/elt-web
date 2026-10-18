import { useCallback, useEffect, useRef, useState } from 'react'
import { refreshSnapshot } from '../core/browse'
import { LAKE_SCOPE, type WindowDays } from '../core/lakeScope'
import type { Snapshot } from '../core/types'

const WINDOW_KEY = 'elt.windowDays'

function readStoredWindow(): WindowDays {
  const raw = Number(localStorage.getItem(WINDOW_KEY))
  if (LAKE_SCOPE.windows.includes(raw as WindowDays)) {
    return raw as WindowDays
  }
  return LAKE_SCOPE.defaultWindow
}

export type BrowseState = {
  windowDays: WindowDays
  setWindowDays: (days: WindowDays) => Promise<void>
  snapshot: Snapshot | null
  loading: boolean
  errorMessage: string | null
  refresh: () => Promise<void>
}

export function useBrowse(): BrowseState {
  const [windowDays, setWindowDaysState] = useState<WindowDays>(readStoredWindow)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const snapshotRef = useRef<Snapshot | null>(null)
  snapshotRef.current = snapshot

  const refresh = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    const result = await refreshSnapshot(windowDays, snapshotRef.current)
    setSnapshot(result.snapshot)
    setErrorMessage(result.errorMessage)
    setLoading(false)
  }, [windowDays])

  const refreshIfNeeded = useCallback(async () => {
    const result = await refreshSnapshot(windowDays, snapshotRef.current)
    if (result.snapshot !== snapshotRef.current || result.errorMessage !== errorMessage) {
      setSnapshot(result.snapshot)
      setErrorMessage(result.errorMessage)
    }
  }, [windowDays, errorMessage])

  const setWindowDays = useCallback(
    async (days: WindowDays) => {
      if (days === windowDays) return
      localStorage.setItem(WINDOW_KEY, String(days))
      setWindowDaysState(days)
      setLoading(true)
      setErrorMessage(null)
      const result = await refreshSnapshot(days, null)
      setSnapshot(result.snapshot)
      setErrorMessage(result.errorMessage)
      setLoading(false)
    },
    [windowDays],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshIfNeeded()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshIfNeeded])

  return {
    windowDays,
    setWindowDays,
    snapshot,
    loading,
    errorMessage,
    refresh,
  }
}
