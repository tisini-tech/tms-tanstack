import { MatchReportPDF } from '#/components/pdf-reports/match-report-pdf'
import { PlayerReportPDF } from '#/components/pdf-reports/player/player-report'
import { GenerateTeamStatsPDF } from '#/components/gen-simple-ts-pdf'
import { SPORT_LABELS } from '#/lib/sports/detect-sport'
import type { SportReportModule } from '#/components/pdf-reports/sports/types'

export const footballReportModule: SportReportModule = {
  sport: 'football',
  label: SPORT_LABELS.football,
  needsMatchCharts: true,
  renderMatchReport: ({
    mode,
    team,
    teamStats,
    playerStats,
    passMatrix,
    teamCharts,
    playerCharts,
  }) => {
    if (mode === 'team-only') {
      return <GenerateTeamStatsPDF teamStats={teamStats} />
    }

    return (
      <MatchReportPDF
        teamStats={teamStats}
        playerStats={playerStats}
        passMatrix={passMatrix}
        team={team}
        teamCharts={teamCharts}
        playerCharts={playerCharts}
      />
    )
  },
  renderPlayerReport: (input) => <PlayerReportPDF {...input} />,
}
