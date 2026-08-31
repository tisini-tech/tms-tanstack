import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { columns } from '#/components/fixtures/raw-events/columns'
import { ReviewTable } from '#/components/fixtures/raw-events/review-table'
import {
  metricsQuery,
  rawEventsQuery,
  teamPlayersQuery,
  toFixtureType,
} from '#/lib/raw-events-queries'
import type { ReviewStats } from '#/lib/types'

export const Route = createFileRoute(
  '/_dashboard/competitions/$compId/fixtures/$fixId/raw-events',
)({
  loader: async ({ params, context, parentMatchPromise }) => {
    const parentMatch = await parentMatchPromise
    const parentData = parentMatch?.loaderData as
      | { reviewStats: ReviewStats }
      | undefined

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
  const { data: rawEvents } = useSuspenseQuery(rawEventsQuery(fixId))

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewTable columns={columns} data={rawEvents} />
    </Suspense>
  )
}
