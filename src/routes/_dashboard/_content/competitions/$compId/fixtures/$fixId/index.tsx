import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { MatchReportDownload } from '#/components/fixtures/match-report-download'
import { PlayerReportDownload } from '#/components/fixtures/player-report-download'

const fixIdRoute = getRouteApi('/_dashboard/_content/competitions/$compId/fixtures/$fixId')

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { teamStats, playerStats, quarterStats, passMatrix } =
    fixIdRoute.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Download the match report for either team.
        </p>
      </div>

      <MatchReportDownload
        teamStats={teamStats}
        playerStats={playerStats}
        quarterStats={quarterStats}
        passMatrix={passMatrix}
      />

      <PlayerReportDownload
        fixture={teamStats.fixture}
        playerStats={playerStats}
        quarterStats={quarterStats}
      />
    </div>
  )
}
