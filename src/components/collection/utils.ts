import type { AgentFixture, TeamLineup } from '#/lib/types'

export const MOMENTS = ['firsthalf', 'secondhalf', 'extrafirst', 'extrasecond']

export const OTHER_CATEGORY = -1

export const SUBSTITUTE_METRIC_IDS = new Set([
  17, 39, 52, 110, 226, 252, 284, 285,
])

export const SCORE_METRIC_IDS = new Set([19, 31, 253, 276])

export const PLAYER_KEYS = '123456789abcdefghijklmnopqrstuvwxyz'

export type ColumnKey =
  'category' | 'metric' | 'detail' | 'subdetail' | 'zone' | 'player' | 'bench'

export function playerLabel(entry: TeamLineup | undefined) {
  if (!entry) return ''
  return `${entry.jersey_number} -> ${entry.player.name}`
}

export function byOrder<
  T extends { order?: number; position?: number; name: string },
>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      (a.order ?? a.position ?? 0) - (b.order ?? b.position ?? 0) ||
      a.name.localeCompare(b.name),
  )
}

function roleKey(role: string) {
  return role.trim().toLowerCase()
}

export function isSubRole(role: string) {
  const key = roleKey(role)
  return key === 'sub' || key === 'substitute' || key === 'subs'
}

export function shortcutIndex(key: string, letters: boolean) {
  if (/^[1-9]$/.test(key)) return Number(key) - 1
  if (!letters || !/^[a-z]$/i.test(key)) return null
  return 9 + key.toLowerCase().charCodeAt(0) - 97
}

export type TeamSide = 'home' | 'away'

export function teamContext(fixture: AgentFixture | null, side: TeamSide) {
  if (side === 'away') {
    return {
      side,
      name: fixture?.team2_name?.trim() || 'Away',
      id: fixture?.team2_id ?? 0,
    }
  }
  return {
    side,
    name: fixture?.team1_name?.trim() || 'Home',
    id: fixture?.team1_id ?? 0,
  }
}

export function isRugby(code: string | undefined, name: string | undefined) {
  return `${code ?? ''} ${name ?? ''}`.toLowerCase().includes('rugby')
}

type ClockSport = 'football' | 'rugby15' | 'rugby10' | 'rugby7'

export const HALF_MINUTES: Record<ClockSport, number> = {
  football: 45,
  rugby15: 40,
  rugby10: 10,
  rugby7: 7,
}

export function clockSport(
  code: string | undefined,
  name: string | undefined,
): ClockSport {
  const value = `${code ?? ''} ${name ?? ''}`.toLowerCase().replace(/\s+/g, '')
  if (value.includes('rugby15')) return 'rugby15'
  if (value.includes('rugby10')) return 'rugby10'
  if (value.includes('rugby7')) return 'rugby7'
  if (value.includes('rugby')) return 'rugby15'
  return 'football'
}

export function matchQuarter(
  sport: ClockSport,
  minute: number,
  inSecondHalf: boolean,
) {
  if (sport === 'rugby7' || sport === 'rugby10') {
    return inSecondHalf ? 'second' : 'first'
  }

  if (sport === 'rugby15') {
    if (!inSecondHalf) {
      if (minute <= 10) return 'first'
      if (minute <= 20) return 'second'
      if (minute <= 30) return 'third'
      return 'fourth'
    }
    if (minute <= 50) return 'fifth'
    if (minute <= 60) return 'sixth'
    if (minute <= 70) return 'seventh'
    return 'eighth'
  }

  if (!inSecondHalf) {
    if (minute <= 15) return 'first'
    if (minute <= 30) return 'second'
    return 'third'
  }
  if (minute <= 60) return 'fourth'
  if (minute <= 75) return 'fifth'
  return 'sixth'
}

export function formatVideoTime(totalSeconds: number) {
  const total = Math.max(0, Math.floor(totalSeconds))
  const minute = Math.floor(total / 60)
  const second = total % 60
  return `${minute}:${String(second).padStart(2, '0')}`
}

export function parseVideoTime(value: string) {
  const match = value.trim().match(/^(\d+):(\d{1,2})$/)
  if (!match) return null
  const second = Number(match[2])
  if (second >= 60) return null
  return Number(match[1]) * 60 + second
}

export function matchClock(
  videoSeconds: number,
  firstHalf: number | null,
  secondHalf: number | null,
  sport: ClockSport,
) {
  const inSecondHalf = secondHalf != null && videoSeconds >= secondHalf
  if (inSecondHalf) {
    const total =
      Math.max(0, Math.floor(videoSeconds - secondHalf)) +
      HALF_MINUTES[sport] * 60
    const minute = Math.floor(total / 60)
    const second = total % 60
    return {
      minute,
      second,
      moment: 'secondhalf',
      quarter: matchQuarter(sport, minute, true),
    }
  }

  if (firstHalf == null || videoSeconds < firstHalf) return null

  const total = Math.max(0, Math.floor(videoSeconds - firstHalf))
  const minute = Math.floor(total / 60)
  const second = total % 60
  return {
    minute,
    second,
    moment: 'firsthalf',
    quarter: matchQuarter(sport, minute, false),
  }
}
