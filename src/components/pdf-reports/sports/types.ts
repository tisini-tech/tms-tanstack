import type { ReactElement } from 'react'

import type { TeamChartImages } from '#/lib/charts/team-quarter-types'
import type { SportKind } from '#/lib/sports/detect-sport'
import type {
  FixturePassMatrix,
  FixturePlayerStats,
  FixtureQuarterStats,
  FixtureTeamStats,
  SimpleFixture,
} from '#/lib/types'
import type { PlayerTableRow, ReportTeam } from '#/components/pdf-reports/pdf-types'

export type MatchReportMode = 'full' | 'team-only'

export type MatchReportModuleInput = {
  mode: MatchReportMode
  team: ReportTeam
  teamStats: FixtureTeamStats
  playerStats: FixturePlayerStats[]
  quarterStats: FixtureQuarterStats
  passMatrix: FixturePassMatrix
  teamCharts: TeamChartImages
  playerCharts: Record<string, string>
}

export type PlayerReportModuleInput = {
  fixture: SimpleFixture
  playerChart: string
  playerName: string
  teamName: string
  jerseyNumber: number
  minutesPlayed: number
  rating: number
  photoUrl?: string
  attackingStats: PlayerTableRow
  defensiveStats: PlayerTableRow
  goalkeepingStats: PlayerTableRow
}

export type SportReportModule = {
  sport: SportKind
  label: string
  /** When false, match download skips chart generation. */
  needsMatchCharts: boolean
  renderMatchReport: (input: MatchReportModuleInput) => ReactElement
  renderPlayerReport: (input: PlayerReportModuleInput) => ReactElement
}
