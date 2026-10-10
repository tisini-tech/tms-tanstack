import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { PlayerStatsTable } from '#/components/stats/player-stats-table'
import { reportSidesForRole } from '#/lib/roles'
import type { FixturePlayerStats } from '#/lib/types'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/player-stats',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { playerStats, reviewStats, teamIds } = fixIdRoute.useLoaderData()
  const { role, user } = Route.useRouteContext()

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
  const allowedTeamIds = new Set(
    sides.map((side) =>
      side === 'home' ? fixture.home_team_id : fixture.away_team_id,
    ),
  )

  const players = (
    Array.isArray(playerStats) ? playerStats : playerStats ? [playerStats] : []
  ).filter((player) =>
    allowedTeamIds.has(player.team.team_id),
  ) as FixturePlayerStats[]

  return (
    <PlayerStatsTable
      players={players}
      matchType={fixture.match_type}
    />
  )
}
