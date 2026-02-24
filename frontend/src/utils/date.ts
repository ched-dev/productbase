// Type for timestamp that can be passed to Date constructor
type TimestampInput = string | number | Date

// Type for time range with optional start/end
type TimeRange = [number | undefined | null, number | undefined | null]

export function matchesMonth(
  timestamp: TimestampInput | undefined,
  expected: number | string | undefined
): boolean {
  if (
    typeof timestamp === 'undefined' ||
    typeof expected === 'undefined' ||
    isNaN(Number(expected))
  ) {
    return false
  }

  const date = new Date(timestamp)
  return date.getMonth() + 1 === Number(expected)
}

export function matchesDay(
  timestamp: TimestampInput | undefined,
  expected: number | string | undefined
): boolean {
  if (
    typeof timestamp === 'undefined' ||
    typeof expected === 'undefined' ||
    isNaN(Number(expected))
  ) {
    return false
  }

  const date = new Date(timestamp)
  return date.getDate() === Number(expected)
}

export function matchesYear(
  timestamp: TimestampInput | undefined,
  expected: number | string | undefined
): boolean {
  if (
    typeof timestamp === 'undefined' ||
    typeof expected === 'undefined' ||
    isNaN(Number(expected))
  ) {
    return false
  }

  const date = new Date(timestamp)
  return date.getFullYear() === Number(expected)
}

export function timestampWithinRange(
  timestamp: number,
  range: TimeRange,
  inclusive = true
): boolean {
  const [start, end] = range

  if (start && end) {
    if (inclusive) {
      return timestamp >= start && timestamp <= end
    }
    return timestamp > start && timestamp < end
  }
  if (!end) {
    if (inclusive) {
      return timestamp >= start!
    }
    return timestamp > start!
  }
  if (!start) {
    if (inclusive) {
      return timestamp <= end
    }
    return timestamp < end
  }

  return false
}

export function timestampTimeWithinRange(
  timestamp: TimestampInput,
  range: TimeRange,
  inclusive = true
): boolean {
  // values are total minutes within day
  const [start, end] = range
  const date = new Date(timestamp)
  const [hours, minutes] = [date.getHours(), date.getMinutes()]
  const dayMinutes = hours * 60 + minutes

  if (start && end) {
    if (inclusive) {
      return dayMinutes >= start && dayMinutes <= end
    }
    return dayMinutes > start && dayMinutes < end
  }
  if (!end) {
    if (inclusive) {
      return dayMinutes >= start!
    }
    return dayMinutes > start!
  }
  if (!start) {
    if (inclusive) {
      return dayMinutes <= end
    }
    return dayMinutes < end
  }

  return false
}

export function convertTimeToAMPM(time: string | undefined): string | null {
  if (typeof time === 'undefined') {
    return null
  }

  // time is '09:20' for 09:20am, or '21:40' for 09:40pm
  const [totalHours, minutes] = time.split(':')
  const hours = Number(totalHours) % 12
  const ampm = Number(totalHours) > 11 ? 'pm' : 'am'
  return (
    [(hours === 0 ? 12 : hours).toString().padStart(2, '0'), minutes].join(
      ':'
    ) + ampm
  )
}

export function convertTimeToDayMinutes(
  time: string | null | undefined
): number | null {
  if (typeof time === 'undefined' || time === null) {
    return null
  }

  // time is '09:20' for 09:20am, or '21:40' for 09:40pm
  const [hours, minutes] = time.split(':')
  const dayMinutes = Number(hours) * 60 + Number(minutes)
  return dayMinutes
}

export function convertDayMinutesToTime(
  minutes: number | null | undefined
): string | null {
  if (typeof minutes === 'undefined' || minutes === null) {
    return null
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const time = [
    hours.toString().padStart(2, '0'),
    remainingMinutes.toString().padStart(2, '0'),
  ].join(':')

  // time should be '09:20' for 09:20am, or '21:40' for 09:40pm
  return time
}
