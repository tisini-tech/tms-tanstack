import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { VideoAnalysis } from '#/components/fixtures/video-analysis/video-analysis'
import { rawEventsQuery } from '#/lib/raw-events-queries'
import type { ReviewStats } from '#/lib/types'

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
  const { data: rawEvents } = useSuspenseQuery(rawEventsQuery(fixId))

  return <VideoAnalysis fixture={fixture} events={rawEvents} />
}
