import { describe, expect, it } from 'vitest'
import { currentEditionFilingDay, previousFilingDay } from './edition'

describe('edition', () => {
  it('uses previous eastern day before 23:50', () => {
    const day = currentEditionFilingDay(new Date('2026-10-11T23:49:00-04:00'))
    expect(day).toBe('2026-10-10')
  })

  it('uses same eastern day at 23:50', () => {
    const day = currentEditionFilingDay(new Date('2026-10-11T23:50:00-04:00'))
    expect(day).toBe('2026-10-11')
  })

  it('steps back one calendar day', () => {
    expect(previousFilingDay('2026-10-13')).toBe('2026-10-12')
  })
})
