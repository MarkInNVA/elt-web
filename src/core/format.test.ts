import { describe, expect, it } from 'vitest'
import { filingRangeLabel } from './format'

describe('filingRangeLabel', () => {
  it('returns null when no dates', () => {
    expect(filingRangeLabel(null, undefined)).toBeNull()
  })

  it('formats a single day', () => {
    expect(filingRangeLabel('2026-10-05', '2026-10-05')).toBe('Filed (range): Oct 5, 2026')
    expect(filingRangeLabel('2026-10-05', null)).toBe('Filed (range): Oct 5, 2026')
  })

  it('formats a range in the same month', () => {
    expect(filingRangeLabel('2026-10-05', '2026-10-12')).toBe('Filed (range): Oct 5 – 12, 2026')
  })

  it('formats a range across months in the same year', () => {
    expect(filingRangeLabel('2026-10-05', '2026-12-01')).toBe('Filed (range): Oct 5 – Dec 1, 2026')
  })

  it('formats a range across years', () => {
    expect(filingRangeLabel('2025-12-20', '2026-01-03')).toBe('Filed (range): Dec 20, 2025 – Jan 3, 2026')
  })
})
