import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { MatchReportDownload } from '#/components/fixtures/match-report-download'
import { PlayerReportDownload } from '#/components/fixtures/player-report-download'
import Highlights from '#/components/fixtures/stats/highlights'
import { reportSidesForRole } from '#/lib/roles'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const {
    teamStats,
    playerStats,
    quarterStats,
    passMatrix,
    teamIds,
    reviewStats,
  } = fixIdRoute.useLoaderData()
  const { role, user } = Route.useRouteContext()

  const highlights = teamStats.timeline

  console.log(highlights)

  const { fixture } = reviewStats
  const homeAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.home_team_id,
  )
  const awayAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.away_team_id,
  )
  const sides = reportSidesForRole({
    role,
    userId: user?.id,
    teamIds,
    homeTeamId: fixture.home_team_id,
    awayTeamId: fixture.away_team_id,
    homeAgentId: homeAgent?.agent_id,
    awayAgentId: awayAgent?.agent_id,
  })
  const allowedTeamIds = sides.map((side) =>
    side === 'home' ? fixture.home_team_id : fixture.away_team_id,
  )

  if (sides.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <MatchReportDownload
          teamStats={teamStats}
          playerStats={playerStats}
          quarterStats={quarterStats}
          passMatrix={passMatrix}
          role={role ?? ''}
          userId={user?.id}
          teamIds={teamIds}
          homeAgent={homeAgent}
          awayAgent={awayAgent}
        />

        <PlayerReportDownload
          fixture={teamStats.fixture}
          playerStats={playerStats}
          quarterStats={quarterStats}
          teamIds={allowedTeamIds}
        />
      </div>

      <Highlights timeline={teamStats.timeline} fixture={teamStats.fixture} />
    </div>
  )
}
