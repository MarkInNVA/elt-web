import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function displayedSnapshot(
  snapshot: Snapshot | null,
  windowDays: WindowDays,
): Snapshot | null {
  if (!snapshot || snapshot.windowDays !== windowDays) return null
  return snapshot
}

export type BrowseState = {
  windowDays: WindowDays
  setWindowDays: (days: WindowDays) => void
  /** Snapshot for the selected window only (matches iOS `BrowseModel.displayed`). */
  displayed: Snapshot | null
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
  const windowDaysRef = useRef(windowDays)
  const fetchIdRef = useRef(0)
  snapshotRef.current = snapshot
  windowDaysRef.current = windowDays

  const displayed = useMemo(
    () => displayedSnapshot(snapshot, windowDays),
    [snapshot, windowDays],
  )

  const loadForWindow = useCallback(async (days: WindowDays, force = false) => {
    const fetchId = ++fetchIdRef.current
    setLoading(true)
    setErrorMessage(null)
    const memory = snapshotRef.current
    const compatibleMemory =
      !force && memory?.windowDays === days ? memory : null
    const result = await refreshSnapshot(days, compatibleMemory)
    if (fetchId !== fetchIdRef.current) return
    if (windowDaysRef.current !== days) return
    setSnapshot(result.snapshot)
    setErrorMessage(result.errorMessage)
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    await loadForWindow(windowDaysRef.current, true)
  }, [loadForWindow])

  const refreshIfNeeded = useCallback(async () => {
    const days = windowDaysRef.current
    const memory = snapshotRef.current
    const compatibleMemory = memory?.windowDays === days ? memory : null
    const result = await refreshSnapshot(days, compatibleMemory)
    if (windowDaysRef.current !== days) return
    if (result.snapshot !== snapshotRef.current || result.errorMessage !== errorMessage) {
      setSnapshot(result.snapshot)
      setErrorMessage(result.errorMessage)
    }
  }, [errorMessage])

  const setWindowDays = useCallback(
    (days: WindowDays) => {
      if (days === windowDaysRef.current) return
      localStorage.setItem(WINDOW_KEY, String(days))
      setLoading(true)
      setErrorMessage(null)
      setWindowDaysState(days)
    },
    [],
  )

  useEffect(() => {
    void loadForWindow(windowDays)
  }, [windowDays, loadForWindow])

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
    displayed,
    loading,
    errorMessage,
    refresh,
  }
}
