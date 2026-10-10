import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { PassSequenceAnalysis } from '#/components/fixtures/pass-sequence/pass-sequence-analysis'
import { reportSidesForRole } from '#/lib/roles'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/pass-sequence',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { teamStats, reviewStats, teamIds } = fixIdRoute.useLoaderData()
  const { role, user } = Route.useRouteContext()
  const { fixture } = reviewStats
  const homeAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.home_team_id,
  )
  const awayAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.away_team_id,
  )
  const allowedSides = reportSidesForRole({
    role,
    userId: user?.id,
    teamIds,
    homeTeamId: fixture.home_team_id,
    awayTeamId: fixture.away_team_id,
    homeAgentId: homeAgent?.agent_id,
    awayAgentId: awayAgent?.agent_id,
  })

  return (
    <PassSequenceAnalysis teamStats={teamStats} allowedSides={allowedSides} />
  )
}
