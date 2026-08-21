import type { Team } from '#/lib/types'

const STORAGE_KEY = 'tisini.recent-teams'
const MAX_RECENT = 40

export function isUnresolvedTeamName(name: string | null | undefined, teamId?: number) {
  const trimmed = name?.trim() ?? ''
  if (!trimmed) return true
  if (teamId != null && trimmed === `Team ${teamId}`) return true
  return /^Team \d+$/i.test(trimmed)
}

export function rememberTeam(team: Team) {
  if (typeof window === 'undefined') return
  if (isUnresolvedTeamName(team.name, team.id)) return

  try {
    const existing = readRecentTeams().filter((entry) => entry.id !== team.id)
    const next = [team, ...existing].slice(0, MAX_RECENT)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
}

export function recallTeam(teamId: number): Team | null {
  if (typeof window === 'undefined') return null
  return readRecentTeams().find((entry) => entry.id === teamId) ?? null
}

function readRecentTeams(): Team[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Team[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
