import type { PlayerStats, TeamStats } from '#/lib/types'

import type { ReportTeam } from '#/components/pdf-reports/pdf-types'

export interface TeamStatsResult {
  [eventId: string]: {
    total: number
    subEvents: Record<string, number>
  }
}

export function getDashTotal(id: string, stats: TeamStatsResult) {
  return stats[id]?.total ?? 0
}

export function getDashSubEvent(
  id: string,
  subId: string,
  stats: TeamStatsResult,
) {
  return stats[id]?.subEvents[subId] ?? 0
}

export function teamStatsToResult(
  stats: TeamStats[],
  team: ReportTeam,
): TeamStatsResult {
  const result: TeamStatsResult = {}

  for (const row of stats) {
    const id = String(row.event_id)
    const subEvents: Record<string, number> = {}

    for (const subEvent of row.sub_events ?? []) {
      subEvents[String(subEvent.subevent_id)] =
        team === 'home' ? subEvent.home_count : subEvent.away_count
    }

    result[id] = {
      total: team === 'home' ? row.home_count : row.away_count,
      subEvents,
    }
  }

  return result
}

export function playerStatsToResult(stats: PlayerStats[]): TeamStatsResult {
  const result: TeamStatsResult = {}

  for (const row of stats) {
    const id = String(row.event_id)
    const subEvents: Record<string, number> = {}

    for (const subEvent of row.sub_events ?? []) {
      subEvents[String(subEvent.sub_event_id)] = subEvent.total
    }

    result[id] = {
      total: row.total,
      subEvents,
    }
  }

  return result
}
