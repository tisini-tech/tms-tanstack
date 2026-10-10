import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { VideoAnalysis } from '#/components/fixtures/video-analysis/video-analysis'
import { rawEventsQuery } from '#/data/fixtures'
import { reportSidesForRole } from '#/lib/roles'
import type { ReviewStats } from '#/lib/types'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/video-analysis',
)({
  loader: async ({ params, context, parentMatchPromise }) => {
    const parentMatch = await parentMatchPromise
    const parentData = parentMatch?.loaderData as
      { reviewStats: ReviewStats } | undefined

    const fixture = parentData?.reviewStats.fixture
    if (!fixture) {
      throw new Error('Missing fixture review data')
    }

    await context.queryClient.prefetchQuery(rawEventsQuery(params.fixId))

    return { fixture, fixId: params.fixId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixture, fixId } = Route.useLoaderData()
  const { reviewStats, teamIds } = fixIdRoute.useLoaderData()
  const { role, user } = Route.useRouteContext()
  const { data: rawEvents } = useSuspenseQuery(rawEventsQuery(fixId))

  const homeAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.home_team_id,
  )
  const awayAgent = reviewStats.agents.find(
    (agent) => agent.team_id === fixture.away_team_id,
  )
  const allowedTeamIds = reportSidesForRole({
    role,
    userId: user?.id,
    teamIds,
    homeTeamId: fixture.home_team_id,
    awayTeamId: fixture.away_team_id,
    homeAgentId: homeAgent?.agent_id,
    awayAgentId: awayAgent?.agent_id,
  }).map((side) =>
    side === 'home' ? fixture.home_team_id : fixture.away_team_id,
  )

  return (
    <VideoAnalysis
      fixture={fixture}
      events={rawEvents}
      allowedTeamIds={allowedTeamIds}
    />
  )
}
