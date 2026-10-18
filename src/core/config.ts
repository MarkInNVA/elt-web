const DEFAULT_API =
  'https://kr8dyq5kr8.execute-api.us-east-1.amazonaws.com'

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) return DEFAULT_API
  return raw.replace(/\/$/, '')
}

export const REQUEST_TIMEOUT_MS = 35_000
