export const SPORT_KINDS = [
  'football',
  'rugby',
  'basketball',
  'hockey',
  'handball',
] as const

export type SportKind = (typeof SPORT_KINDS)[number]

export const SPORT_LABELS: Record<SportKind, string> = {
  football: 'Football',
  rugby: 'Rugby',
  basketball: 'Basketball',
  hockey: 'Hockey',
  handball: 'Handball',
}

/** Sports with a complete PDF report implementation. */
export function sportHasFullReports(sport: SportKind) {
  return sport === 'football' || sport === 'hockey'
}

export function detectSport(matchType?: string | null): SportKind {
  const value = (matchType ?? '').trim().toLowerCase()

  if (
    value.includes('rugby') ||
    value.includes('7s') ||
    value.includes('sevens')
  ) {
    return 'rugby'
  }

  if (value.includes('basket')) {
    return 'basketball'
  }

  if (value.includes('hockey') || value.includes('ice')) {
    return 'hockey'
  }

  if (value.includes('handball')) {
    return 'handball'
  }

  if (
    value.includes('football') ||
    value.includes('soccer') ||
    value.includes('futsal')
  ) {
    return 'football'
  }

  // Default: treat unknown / empty as football (existing behaviour).
  return 'football'
}
