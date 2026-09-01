import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { PlayerStatsTable } from '#/components/stats/player-stats-table'
import type { FixturePlayerStats } from '#/lib/types'

const fixIdRoute = getRouteApi('/_dashboard/_content/competitions/$compId/fixtures/$fixId')

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/player-stats',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { playerStats, reviewStats } = fixIdRoute.useLoaderData()

  const players = (
    Array.isArray(playerStats) ? playerStats : playerStats ? [playerStats] : []
  ) as FixturePlayerStats[]

  return (
    <PlayerStatsTable
      players={players}
      matchType={reviewStats.fixture.match_type}
    />
  )
}
