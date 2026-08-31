import type { Competition } from '#/lib/types'

const COMPETITION_ID_KEY = 'tms:lastCompetitionId'
const FILTERS_KEY = 'tms:competitionFilters'

export type CompetitionFilters = {
  seasonId?: number
  divisionId?: number
  categoryId?: number
}

type StoredFiltersByCompetition = Record<string, CompetitionFilters>

export function getLastCompetitionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(COMPETITION_ID_KEY)
  } catch {
    return null
  }
}

export function rememberCompetitionId(compId: string | number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COMPETITION_ID_KEY, String(compId))
  } catch {
    // ignore quota / private mode
  }
}

function readAllFilters(): StoredFiltersByCompetition {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(FILTERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredFiltersByCompetition
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getStoredCompetitionFilters(
  compId: string | number,
): CompetitionFilters {
  return readAllFilters()[String(compId)] ?? {}
}

export function rememberCompetitionFilters(
  compId: string | number,
  filters: CompetitionFilters,
) {
  if (typeof window === 'undefined') return
  try {
    const all = readAllFilters()
    all[String(compId)] = {
      seasonId: filters.seasonId,
      divisionId: filters.divisionId,
      categoryId: filters.categoryId,
    }
    localStorage.setItem(FILTERS_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

/** Path after `/competitions/:compId`, e.g. `/teams` or `/fixtures/12`. */
export function getCompetitionSectionPath(pathname: string) {
  const match = pathname.match(/^\/competitions\/[^/]+(\/.*)?$/)
  const rest = match?.[1]
  if (!rest || rest === '/') return ''
  return rest
}

export function isCompetitionModulePath(pathname: string) {
  return pathname === '/competitions' || pathname.startsWith('/competitions/')
}

export function parseCompIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/competitions\/(\d+)/)
  return match?.[1] ?? null
}

/**
 * Prefer URL → last used (if still in list) → first competition.
 */
export function resolveCompetition(
  competitions: Competition[],
  pathname: string,
): Competition | null {
  if (!competitions.length) return null

  const fromPath = parseCompIdFromPath(pathname)
  if (fromPath) {
    const match = competitions.find((c) => c.id === Number(fromPath))
    if (match) return match
  }

  const lastId = getLastCompetitionId()
  if (lastId) {
    const match = competitions.find((c) => String(c.id) === lastId)
    if (match) return match
  }

  return competitions[0] ?? null
}

function pickId(
  preferred: number | undefined,
  stored: number | undefined,
  options: Array<{ id: number }>,
): number | undefined {
  if (preferred != null && options.some((o) => o.id === preferred)) {
    return preferred
  }
  if (stored != null && options.some((o) => o.id === stored)) {
    return stored
  }
  return options[0]?.id
}

/**
 * URL values win when valid; else last stored for this competition; else first option.
 */
export function resolveCompetitionFilters(
  competition: Competition,
  current: CompetitionFilters = {},
): CompetitionFilters {
  const stored = getStoredCompetitionFilters(competition.id)
  const seasons = competition.seasons ?? []
  const divisions = competition.divisions ?? []
  const categories = competition.categories ?? []

  return {
    seasonId: pickId(current.seasonId, stored.seasonId, seasons),
    divisionId: pickId(current.divisionId, stored.divisionId, divisions),
    categoryId: pickId(current.categoryId, stored.categoryId, categories),
  }
}

export function competitionFiltersSearch(
  filters: CompetitionFilters,
): CompetitionFilters {
  return {
    ...(filters.seasonId != null ? { seasonId: filters.seasonId } : {}),
    ...(filters.divisionId != null ? { divisionId: filters.divisionId } : {}),
    ...(filters.categoryId != null ? { categoryId: filters.categoryId } : {}),
  }
}
