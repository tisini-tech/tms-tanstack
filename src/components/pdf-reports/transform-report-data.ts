import type {
  FixturePassMatrix,
  FixturePlayerStats,
  FixtureQuarterStats,
  FixtureTeamStats,
  PassMatrix,
  PlayerQuarterStats,
  QuarterMetrics,
  TeamQuarterStats,
  TimelineEvent,
} from '#/lib/types'

import { teamStatsToResult } from '#/lib/dashboard/stats'

import {
  computePlayerStats,
  computeSinglePlayerGoalkeepingRow,
} from './compute-player-stats'
import {
  computeAttackingStats,
  computeDefenseStats,
} from './compute-team-stats'
import type {
  ChartSeries,
  PlayerTableRow,
  QuarterChartData,
  ReportTeam,
  TableData,
} from './pdf-types'

const QUARTER_LABELS = ['0-15', '16-30', '31-45', '46-60', '61-75', '76-90']

export function transformAttackingTeamStats(
  teamStats: FixtureTeamStats,
  team: ReportTeam,
): TableData {
  return computeAttackingStats(teamStatsToResult(teamStats.stats, team))
}

export function transformDefenseTeamStats(
  teamStats: FixtureTeamStats,
  team: ReportTeam,
): TableData {
  return computeDefenseStats(teamStatsToResult(teamStats.stats, team))
}

export function transformPlayerAttackingStats(
  players: FixturePlayerStats[],
  teamId: number,
): PlayerTableRow[] {
  return computePlayerStats(players, teamId).playerAttackingStats
}

export function transformPlayerDefensiveStats(
  players: FixturePlayerStats[],
  teamId: number,
): PlayerTableRow[] {
  return computePlayerStats(players, teamId).playerDefensiveStats
}

export function transformPlayerGoalkeepingStats(
  players: FixturePlayerStats[],
  teamId: number,
): PlayerTableRow[] {
  return computePlayerStats(players, teamId).playerGoalkeepingStats
}

function playerDisplayName(player: FixturePlayerStats) {
  return [player.first_name, player.sir_name, player.other_name]
    .filter(Boolean)
    .join(' ')
}

export function transformSinglePlayerReportStats(
  players: FixturePlayerStats[],
  player: FixturePlayerStats,
) {
  const teamId = player.team.team_id
  const computed = computePlayerStats(players, teamId)
  const name = playerDisplayName(player)

  const pick = (rows: PlayerTableRow[]) =>
    rows.find((row) => row['Player name'] === name) ?? {}

  return {
    attacking: pick(computed.playerAttackingStats),
    defensive: pick(computed.playerDefensiveStats),
    goalkeeping: computeSinglePlayerGoalkeepingRow(player),
  }
}

export function transformPassMatrix(matrix: PassMatrix) {
  const formatted: Record<string, Record<string, string>> = {}

  for (const [passer, receivers] of Object.entries(matrix)) {
    formatted[passer] = {}
    for (const [receiver, count] of Object.entries(receivers)) {
      formatted[passer][receiver] = String(count)
    }
  }

  return formatted
}

export function getPassMatrixForTeam(
  passMatrix: FixturePassMatrix,
  team: ReportTeam,
) {
  return transformPassMatrix(team === 'home' ? passMatrix.home : passMatrix.away)
}

export function getTeamId(teamStats: FixtureTeamStats, team: ReportTeam) {
  return team === 'home'
    ? teamStats.fixture.home_team_id
    : teamStats.fixture.away_team_id
}

export function getTeamName(teamStats: FixtureTeamStats, team: ReportTeam) {
  return team === 'home'
    ? teamStats.fixture.home_team
    : teamStats.fixture.away_team
}

export function filterTimelineForTeam(
  timeline: TimelineEvent[],
  teamId: number,
) {
  return timeline.filter((event) => event.team === teamId)
}

function quarterKeys(stats: TeamQuarterStats) {
  const fromQuarters = Object.keys(stats.quarters ?? {})
  if (fromQuarters.length) {
    return fromQuarters.sort((left, right) => {
      const order = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth']
      return order.indexOf(left) - order.indexOf(right)
    })
  }

  const fromAverage = Object.keys(stats.average ?? {})
  if (fromAverage.length) {
    return fromAverage.sort((a, b) => Number(a) - Number(b))
  }

  const fromPlayers = stats.players?.[0]?.periods
  if (fromPlayers) {
    return Object.keys(fromPlayers).sort((a, b) => Number(a) - Number(b))
  }

  return ['1', '2', '3', '4', '5', '6']
}

function quarterLabels(keys: string[]) {
  const intervalOrder = QUARTER_LABELS
  if (keys.every((key) => intervalOrder.includes(key))) {
    return keys
  }

  return keys.map((key, index) => QUARTER_LABELS[index] ?? key)
}

function valuesFromQuarters(
  stats: TeamQuarterStats,
  keys: string[],
  metric: keyof QuarterMetrics,
): number[] {
  return keys.map((key) => stats.quarters?.[key]?.[metric] ?? 0)
}

export function buildQuarterChartData(
  quarterStats: FixtureQuarterStats,
  _teamStats: FixtureTeamStats,
  team: ReportTeam,
  metric: 'shots' | 'chances' | 'defense' | 'passing',
): QuarterChartData {
  const teamData = team === 'home' ? quarterStats.home : quarterStats.away
  const keys = quarterKeys(teamData)
  const labels = quarterLabels(keys)

  const metricKey =
    metric === 'shots'
      ? 'total_shots'
      : metric === 'chances'
        ? 'chances'
        : metric === 'defense'
          ? 'defensive_actions'
          : 'complete_passes'

  const primary: ChartSeries = {
    label:
      metric === 'shots'
        ? 'Total shots'
        : metric === 'chances'
          ? 'Chances'
          : metric === 'defense'
            ? 'Defensive Actions'
            : 'Completed Passes',
    values: valuesFromQuarters(teamData, keys, metricKey),
  }

  const series: ChartSeries[] = [primary]

  if (metric === 'shots') {
    const onTarget = valuesFromQuarters(teamData, keys, 'shot_on_target')
    if (onTarget.some((value) => value > 0)) {
      series.push({ label: 'On target', values: onTarget })
    }
  }

  return { labels, series }
}

export function getPlayerQuarterCharts(
  quarterStats: FixtureQuarterStats,
  team: ReportTeam,
): PlayerQuarterStats[] {
  const teamData = team === 'home' ? quarterStats.home : quarterStats.away
  return teamData.players ?? []
}

export function getPlayerQuarterAverage(
  quarterStats: FixtureQuarterStats,
  team: ReportTeam,
) {
  const teamData = team === 'home' ? quarterStats.home : quarterStats.away
  return teamData.average ?? {}
}
