import { SportPlaceholderPDF } from '#/components/pdf-reports/sports/sport-placeholder-pdf'
import type { SportReportModule } from '#/components/pdf-reports/sports/types'
import {
  SPORT_LABELS,
  type SportKind,
} from '#/lib/sports/detect-sport'
import { getTeamName } from '#/components/pdf-reports/transform-report-data'

export function createPlaceholderReportModule(
  sport: Exclude<SportKind, 'football'>,
): SportReportModule {
  const label = SPORT_LABELS[sport]

  return {
    sport,
    label,
    needsMatchCharts: false,
    renderMatchReport: ({ mode, team, teamStats }) => (
      <SportPlaceholderPDF
        fixture={teamStats.fixture}
        sportLabel={label}
        reportKind="match"
        teamName={
          mode === 'full' ? getTeamName(teamStats, team) : undefined
        }
      />
    ),
    renderPlayerReport: ({ fixture, playerName, teamName }) => (
      <SportPlaceholderPDF
        fixture={fixture}
        sportLabel={label}
        reportKind="player"
        teamName={teamName}
        playerName={playerName}
        isLandscape={false}
      />
    ),
  }
}
