import { DownloadIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'

import { Button } from '#/components/ui/button'
import { useTeamCharts } from '#/hooks/use-team-charts'
import { ensurePdfPolyfills } from '#/lib/pdf-polyfills'
import { usePlayerCharts } from '#/hooks/use-player-charts'
import type { ReportTeam } from '#/components/pdf-reports/pdf-types'
import type { TeamChartImages } from '#/lib/charts/team-quarter-types'
import { getSportReportModule } from '#/components/pdf-reports/sports'
import { getTeamQuarterStatsForCharts } from '#/lib/charts/team-quarter-adapters'
import {
  toAverageQuarterStats,
  toPlayerQuarterStat,
} from '#/lib/charts/player-quarter-adapters'
import {
  getTeamId,
  getPlayerQuarterAverage,
  getPlayerQuarterCharts,
  getTeamName,
} from '#/components/pdf-reports/transform-report-data'
import type {
  FixturePassMatrix,
  FixturePlayerStats,
  FixtureQuarterStats,
  FixtureTeamStats,
} from '#/lib/types'

interface MatchReportDownloadProps {
  teamStats: FixtureTeamStats
  playerStats: FixturePlayerStats[]
  quarterStats: FixtureQuarterStats
  passMatrix: FixturePassMatrix
}

function ReportDownloadButton({
  team,
  teamStats,
  playerStats,
  quarterStats,
  passMatrix,
}: MatchReportDownloadProps & { team: ReportTeam }) {
  const [isClient, setIsClient] = useState(false)
  const [polyfillsReady, setPolyfillsReady] = useState(false)

  const reportModule = useMemo(
    () => getSportReportModule(teamStats.fixture.match_type),
    [teamStats.fixture.match_type],
  )

  useEffect(() => {
    let cancelled = false

    void ensurePdfPolyfills().then(() => {
      if (!cancelled) {
        setPolyfillsReady(true)
        setIsClient(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const needsCharts = reportModule.needsMatchCharts

  const teamQuarterStats = useMemo(
    () =>
      isClient && needsCharts
        ? getTeamQuarterStatsForCharts(quarterStats, team)
        : {},
    [isClient, needsCharts, quarterStats, team],
  )

  const playerQuarterStats = useMemo(
    () =>
      isClient && needsCharts
        ? getPlayerQuarterCharts(quarterStats, team).map(toPlayerQuarterStat)
        : [],
    [isClient, needsCharts, quarterStats, team],
  )

  const averageQuarterStats = useMemo(
    () =>
      isClient && needsCharts
        ? toAverageQuarterStats(getPlayerQuarterAverage(quarterStats, team))
        : ({} as ReturnType<typeof toAverageQuarterStats>),
    [isClient, needsCharts, quarterStats, team],
  )

  const { teamCharts, isGeneratingChart } = useTeamCharts(
    needsCharts ? teamQuarterStats : {},
  )
  const { playerCharts, isGeneratingPlayerCharts } = usePlayerCharts(
    needsCharts ? playerQuarterStats : [],
    averageQuarterStats,
  )

  const teamName = getTeamName(teamStats, team)
  const teamId = getTeamId(teamStats, team)
  const hasTeamPlayerStats = playerStats.some(
    (player) => player.team.team_id === teamId,
  )
  const mode = hasTeamPlayerStats ? 'full' : 'team-only'
  const fileName = hasTeamPlayerStats
    ? `${teamName.replace(/\s+/g, '_')}-${reportModule.sport}-${teamStats.fixture.matchday}_match_report.pdf`
    : `${teamStats.fixture.home_team}_vs_${teamStats.fixture.away_team}-${reportModule.sport}-${teamStats.fixture.matchday}_match_report.pdf`

  const isTeamChartsReady =
    Boolean(teamCharts.shots) &&
    Boolean(teamCharts.chances) &&
    Boolean(teamCharts.defense) &&
    Boolean(teamCharts.possession)

  const waitingForCharts =
    needsCharts &&
    hasTeamPlayerStats &&
    (isGeneratingChart || isGeneratingPlayerCharts || !isTeamChartsReady)

  if (!isClient || !polyfillsReady || waitingForCharts) {
    return (
      <Button variant="outline" disabled>
        <DownloadIcon size={16} />
        {teamName} report
      </Button>
    )
  }

  const document = reportModule.renderMatchReport({
    mode,
    team,
    teamStats,
    playerStats,
    quarterStats,
    passMatrix,
    teamCharts: teamCharts as TeamChartImages,
    playerCharts,
  })

  return (
    <PDFDownloadLink
      document={document}
      fileName={fileName}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <Button variant="outline" disabled={loading}>
          <DownloadIcon size={16} />
          {loading
            ? 'Preparing...'
            : `${teamName} ${reportModule.label.toLowerCase()} report`}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

export function MatchReportDownload(props: MatchReportDownloadProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <ReportDownloadButton {...props} team="home" />
      <ReportDownloadButton {...props} team="away" />
    </div>
  )
}
