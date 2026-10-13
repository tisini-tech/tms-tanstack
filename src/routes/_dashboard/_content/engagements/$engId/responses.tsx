import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { getEngResponsesFn } from '#/data/engagements'
import { ResponseResults } from '#/components/engagements/response-results'

const engRoute = getRouteApi('/_dashboard/_content/engagements/$engId')

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/responses',
)({
  loader: async ({ params: { engId } }) => {
    if (!engId) {
      throw new Error('Engagement ID is required')
    }

    const responses = await getEngResponsesFn({ data: { engId } })

    return { responses }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { engagement } = engRoute.useLoaderData()
  const { responses } = Route.useLoaderData() ?? {}

  return (
    <ResponseResults
      title={engagement?.title || 'Engagement'}
      questions={engagement?.questions ?? []}
      responses={responses ?? []}
    />
  )
}
