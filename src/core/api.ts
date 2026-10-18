import { apiBaseUrl, REQUEST_TIMEOUT_MS } from './config'
import type { PreviewRequest, TransactionsRequest } from './lakeScope'
import { parsePreviewBody, parseTransactionsBody } from './types'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function postJson<T>(path: string, body: unknown, parse: (data: unknown) => T): Promise<T> {
  const url = `${apiBaseUrl()}/${path.replace(/^\//, '')}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'POST',
      // text/plain is a CORS-safelisted content type, so the browser skips the
      // preflight. API Gateway forwards OPTIONS to the Lambda, which answers 405,
      // and that aborts any application/json POST before it leaves the browser.
      // The lake parses the body as JSON regardless of content type.
      headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const text = await response.text()
    let data: unknown = {}
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { detail: text }
      }
    }
    if (!response.ok) {
      const detail =
        typeof data === 'object' && data && 'detail' in data
          ? String((data as { detail: unknown }).detail)
          : text || response.statusText
      throw new ApiError(response.status, detail)
    }
    return parse(data)
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. The lake may still be updating — try again.')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function fetchPreview(request: PreviewRequest) {
  return postJson('v1/preview', request, parsePreviewBody)
}

export function fetchTransactions(request: TransactionsRequest) {
  return postJson('v1/transactions', request, parseTransactionsBody)
}

export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 503) {
      return 'Lake preview timed out (API 503). Try again — a warm cache usually answers quickly.'
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Unknown error'
}
