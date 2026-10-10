import { Suspense } from 'react'
import { createFileRoute, getRouteApi, redirect } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { columns } from '#/components/fixtures/raw-events/columns'
import DownloadRawExcel from '#/components/fixtures/raw-events/download-excel'
import { ReviewTable } from '#/components/fixtures/raw-events/review-table'
import { toFixtureType } from '#/lib/utils'
import { metricsQuery } from '#/data/metrics'
import { rawEventsQuery } from '#/data/fixtures'
import { teamPlayersQuery } from '#/data/players'
import type { ReviewStats } from '#/lib/types'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/raw-events',
)({
  beforeLoad: ({ context, params }) => {
    if (!['1', '7'].includes(String(context.role ?? ''))) {
      throw redirect({
        to: '/competitions/$compId/fixtures/$fixId',
        params,
      })
    }
  },
  loader: async ({ params, context, parentMatchPromise }) => {
    const parentMatch = await parentMatchPromise
    const parentData = parentMatch?.loaderData as
      { reviewStats: ReviewStats } | undefined

    const fixture = parentData?.reviewStats.fixture
    const homeTeamId = fixture?.home_team_id
    const awayTeamId = fixture?.away_team_id
    const fixType = toFixtureType(fixture?.match_type ?? 'football')

    if (!homeTeamId || !awayTeamId) {
      throw new Error('Missing home/away team on fixture')
    }

    await Promise.all([
      context.queryClient.prefetchQuery(metricsQuery(fixType)),
      context.queryClient.prefetchQuery(rawEventsQuery(params.fixId)),
      // Squad fetch can 404 for some teams — don't block the page
      context.queryClient
        .prefetchQuery(teamPlayersQuery(homeTeamId))
        .catch(() => undefined),
      context.queryClient
        .prefetchQuery(teamPlayersQuery(awayTeamId))
        .catch(() => undefined),
    ])

    return { homeTeamId, awayTeamId, fixType }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixId } = Route.useParams()
  const { reviewStats } = fixIdRoute.useLoaderData()
  const { data: rawEvents } = useSuspenseQuery(rawEventsQuery(fixId))
  const { fixture } = reviewStats

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewTable
        columns={columns}
        data={rawEvents}
        download={
          <DownloadRawExcel
            events={rawEvents}
            homeTeam={fixture.home_team}
            awayTeam={fixture.away_team}
            homeTeamId={fixture.home_team_id}
            awayTeamId={fixture.away_team_id}
          />
        }
      />
    </Suspense>
  )
}
