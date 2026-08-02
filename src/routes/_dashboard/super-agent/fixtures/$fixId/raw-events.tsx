import { columns } from '#/components/fixtures/raw-events/columns'
import { ReviewTable } from '#/components/fixtures/raw-events/review-table'
import { getFixtureRawEventsFn } from '#/data/fixtures'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

const rawEventsQuery = (id: string) =>
  queryOptions({
    queryKey: ['fixture-raw-events', id],
    queryFn: () => getFixtureRawEventsFn({ data: { id } }),
  })

export const Route = createFileRoute(
  '/_dashboard/super-agent/fixtures/$fixId/raw-events',
)({
  loader: async ({ params, context }) => {
    await context.queryClient.prefetchQuery(rawEventsQuery(params.fixId))
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
