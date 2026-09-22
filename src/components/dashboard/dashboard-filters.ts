import type {
  DashboardPlayerStats,
  DashboardQuarterStats,
  DashboardTeamStats,
} from '#/lib/types'

export type EventFilterKey = {
  eventId: number
  /** When set, filter to this sub-event only. */
  subEventId?: number
}

export type DashboardFilters = {
  /**
   * `null` = all matches (default).
   * `[]` = no matches selected.
   * `[ids]` = only those matches.
   */
  matchIds: number[] | null
  events: EventFilterKey[]
}

export const EMPTY_FILTERS: DashboardFilters = {
  matchIds: null,
  events: [],
}

export function filtersAreActive(filters: DashboardFilters) {
  return filters.matchIds != null || filters.events.length > 0
}

function eventKey(filter: EventFilterKey) {
  return filter.subEventId == null
    ? `e:${filter.eventId}`
    : `e:${filter.eventId}:s:${filter.subEventId}`
}

export function isEventSelected(
  filters: DashboardFilters,
  eventId: number,
  subEventId?: number,
) {
  return filters.events.some(
    (item) =>
      item.eventId === eventId &&
      (subEventId == null
        ? item.subEventId == null
        : item.subEventId === subEventId),
  )
}

export function isMatchSelected(filters: DashboardFilters, matchId: number) {
  return filters.matchIds != null && filters.matchIds.includes(matchId)
}

/** Resolve which match IDs are currently in the view. */
export function selectedMatchIds(
  filters: DashboardFilters,
  allMatchIds: number[],
) {
  if (filters.matchIds == null) return allMatchIds
  return filters.matchIds
}

export function isAllMatchesSelected(filters: DashboardFilters) {
  return filters.matchIds == null
}

export function setMatchSelection(
  filters: DashboardFilters,
  nextIds: number[],
  allMatchIds: number[],
): DashboardFilters {
  const unique = [...new Set(nextIds)]
  const isAll =
    unique.length === allMatchIds.length &&
    allMatchIds.length > 0 &&
    allMatchIds.every((id) => unique.includes(id))

  return {
    ...filters,
    matchIds: isAll ? null : unique,
  }
}

/** Plain click replaces; Ctrl/Cmd click toggles within that dimension. */
export function toggleMatchFilter(
  filters: DashboardFilters,
  matchId: number,
  additive: boolean,
  allMatchIds: number[],
): DashboardFilters {
  const current = selectedMatchIds(filters, allMatchIds)

  if (additive) {
    const exists = current.includes(matchId)
    const next = exists
      ? current.filter((id) => id !== matchId)
      : [...current, matchId]
    return setMatchSelection(filters, next, allMatchIds)
  }

  const onlyThis = current.length === 1 && current[0] === matchId
  return setMatchSelection(
    filters,
    onlyThis ? allMatchIds : [matchId],
    allMatchIds,
  )
}

export function toggleEventFilter(
  filters: DashboardFilters,
  next: EventFilterKey,
  additive: boolean,
): DashboardFilters {
  const key = eventKey(next)
  const exists = filters.events.some((item) => eventKey(item) === key)

  if (additive) {
    return {
      ...filters,
      events: exists
        ? filters.events.filter((item) => eventKey(item) !== key)
        : [...filters.events, next],
    }
  }

  const onlyThis =
    filters.events.length === 1 && eventKey(filters.events[0]!) === key
  return {
    ...filters,
    events: onlyThis ? [] : [next],
  }
}

export function filterQuarterStats(
  quarterStats: DashboardQuarterStats[],
  filters: DashboardFilters,
): DashboardQuarterStats[] {
  if (filters.events.length === 0) return quarterStats

  const eventIds = new Set(filters.events.map((item) => item.eventId))
  const subKeys = new Set(
    filters.events
      .filter((item) => item.subEventId != null)
      .map((item) => `${item.eventId}:${item.subEventId}`),
  )
  const wholeEvents = new Set(
    filters.events
      .filter((item) => item.subEventId == null)
      .map((item) => item.eventId),
  )

  return quarterStats
    .filter((event) => eventIds.has(event.event_id))
    .map((event) => {
      if (wholeEvents.has(event.event_id)) return event

      return {
        ...event,
        quarters: (event.quarters ?? []).map((quarter) => {
          const matches = (quarter.matches ?? []).map((match) => {
            const subs = (match.sub_events ?? []).filter((sub) =>
              subKeys.has(`${event.event_id}:${sub.sub_event_id}`),
            )
            return {
              ...match,
              total: subs.reduce((sum, sub) => sum + sub.total, 0),
              sub_events: subs,
            }
          })
          return {
            ...quarter,
            matches,
            total: matches.reduce((sum, match) => sum + match.total, 0),
          }
        }),
      }
    })
}

export function filterPlayerStats(
  playerStats: DashboardPlayerStats[],
  filters: DashboardFilters,
): DashboardPlayerStats[] {
  let next = playerStats

  if (filters.events.length > 0) {
    const eventIds = new Set(filters.events.map((item) => item.eventId))
    const subKeys = new Set(
      filters.events
        .filter((item) => item.subEventId != null)
        .map((item) => `${item.eventId}:${item.subEventId}`),
    )
    const wholeEvents = new Set(
      filters.events
        .filter((item) => item.subEventId == null)
        .map((item) => item.eventId),
    )

    next = playerStats
      .filter((event) => eventIds.has(event.event_id))
      .map((event) => {
        if (wholeEvents.has(event.event_id)) return event

        return {
          ...event,
          players: (event.players ?? []).map((player) => {
            const matches = (player.matches ?? []).map((match) => {
              const subs = (match.sub_events ?? []).filter((sub) =>
                subKeys.has(`${event.event_id}:${sub.sub_event_id}`),
              )
              return {
                ...match,
                total: subs.reduce((sum, sub) => sum + sub.total, 0),
                sub_events: subs,
              }
            })
            return {
              ...player,
              total: matches.reduce((sum, match) => sum + match.total, 0),
              matches,
            }
          }),
        }
      })
  }

  if (filters.matchIds == null) return next

  const matchSet = new Set(filters.matchIds)
  return next.map((event) => ({
    ...event,
    players: (event.players ?? []).map((player) => {
      const matches = (player.matches ?? []).filter((match) =>
        matchSet.has(match.match_id),
      )
      return {
        ...player,
        total: matches.reduce((sum, match) => sum + match.total, 0),
        matches,
      }
    }),
  }))
}

export function filterLabel(
  filters: DashboardFilters,
  teamStats: DashboardTeamStats[],
  matchLabels: Map<number, string>,
) {
  const parts: string[] = []

  if (filters.matchIds != null) {
    if (filters.matchIds.length === 0) {
      parts.push('No matches')
    } else {
      for (const matchId of filters.matchIds) {
        parts.push(matchLabels.get(matchId) ?? `Match ${matchId}`)
      }
    }
  }

  for (const item of filters.events) {
    const event = teamStats.find((row) => row.event_id === item.eventId)
    if (!event) continue
    if (item.subEventId == null) {
      parts.push(event.event_name)
      continue
    }
    const sub = event.sub_events?.find(
      (row) => row.sub_event_id === item.subEventId,
    )
    parts.push(sub?.sub_event_name ?? `${event.event_name} sub-event`)
  }

  return parts.join(' · ')
}
