import type { FixtureQuarterStats, QuarterMetrics } from '#/lib/types'

import type { ReportTeam } from '#/components/pdf-reports/pdf-types'

import type { ChartTeamQuarterStats, QuarterStats } from './team-quarter-types'

function toQuarterStats(metrics: QuarterMetrics): QuarterStats {
  return {
    shotOnTarget: metrics.shot_on_target ?? 0,
    totalShots: metrics.total_shots ?? 0,
    chances: metrics.chances ?? 0,
    completePasses: metrics.complete_passes ?? 0,
    defensiveActions: metrics.defensive_actions ?? 0,
  }
}

export function getTeamQuarterStatsForCharts(
  quarterStats: FixtureQuarterStats,
  team: ReportTeam,
): ChartTeamQuarterStats {
  const teamData = team === 'home' ? quarterStats.home : quarterStats.away
  const result: ChartTeamQuarterStats = {}

  for (const [quarter, metrics] of Object.entries(teamData.quarters ?? {})) {
    result[quarter] = toQuarterStats(metrics)
  }

  return result
}
