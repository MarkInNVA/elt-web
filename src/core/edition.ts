import { format, parse, subDays } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

const EASTERN = 'America/New_York'
const BOUNDARY_MINUTES = 23 * 60 + 50

export function formatFilingDay(date: Date): string {
  return formatInTimeZone(date, EASTERN, 'yyyy-MM-dd')
}

/** Catalog edition filing day (matches elt-ios `Edition.current`). */
export function currentEditionFilingDay(now = new Date()): string {
  const eastern = toZonedTime(now, EASTERN)
  const minutes = eastern.getHours() * 60 + eastern.getMinutes()
  let day = eastern
  if (minutes < BOUNDARY_MINUTES) {
    day = subDays(eastern, 1)
  }
  return formatFilingDay(day)
}

export function previousFilingDay(filingDay: string): string {
  const date = parse(filingDay, 'yyyy-MM-dd', new Date())
  return format(subDays(date, 1), 'yyyy-MM-dd')
}
