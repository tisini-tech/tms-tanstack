import { HockeyMatchReportPDF } from '#/components/pdf-reports/sports/hockey/hockey-match-report-pdf'
import { SportPlaceholderPDF } from '#/components/pdf-reports/sports/sport-placeholder-pdf'
import type { SportReportModule } from '#/components/pdf-reports/sports/types'
import { SPORT_LABELS } from '#/lib/sports/detect-sport'

export const hockeyReportModule: SportReportModule = {
  sport: 'hockey',
  label: SPORT_LABELS.hockey,
  needsMatchCharts: false,
  renderMatchReport: ({ mode, team, teamStats, playerStats }) => (
    <HockeyMatchReportPDF
      teamStats={teamStats}
      playerStats={playerStats}
      team={team}
      includePlayerPage={mode === 'full'}
    />
  ),
  renderPlayerReport: ({ fixture, playerName, teamName }) => (
    <SportPlaceholderPDF
      fixture={fixture}
      sportLabel={SPORT_LABELS.hockey}
      reportKind="player"
      teamName={teamName}
      playerName={playerName}
      isLandscape={false}
    />
  ),
}
