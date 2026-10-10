import { FootballSimpleTeamStats } from '#/components/fixtures/stats/football-simple'
import { FootballTeamStats } from '#/components/fixtures/stats/football-team-stats'
import { RugbyTeamStats } from '#/components/fixtures/stats/rugby-team-stats'
import { reportSidesForRole } from '#/lib/roles'
import { detectSport } from '#/lib/sports/detect-sport'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/team-stats',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { compId } = Route.useParams()
  const { teamStats, reviewStats, teamIds } = fixIdRoute.useLoaderData()
  const { role, user } = Route.useRouteContext()

  const { fixture, stats, sequences } = teamStats

  const sport = detectSport(fixture.match_type)

  if (compId === '252') {
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
      <FootballSimpleTeamStats
        stats={stats ?? []}
        sequences={sequences}
        fixture={fixture}
        allowedSides={allowedSides}
      />
    )
  }

  if (sport === 'football') {
    return <FootballTeamStats stats={stats ?? []} />
  }

  if (sport === 'rugby') {
    return (
      <RugbyTeamStats
        stats={stats ?? []}
        sevens={isRugbySevens(fixture.match_type)}
      />
    )
  }

  return (
    <p className="flex h-[250px] items-center justify-center text-2xl text-muted-foreground">
      No data!
    </p>
  )
}

function isRugbySevens(matchType: string) {
  const value = matchType.trim().toLowerCase()
  return value.includes('7') || value.includes('seven')
}
