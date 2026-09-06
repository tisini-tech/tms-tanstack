import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { PassSequenceAnalysis } from '#/components/fixtures/pass-sequence/pass-sequence-analysis'

const fixIdRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/$fixId/pass-sequence',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { teamStats } = fixIdRoute.useLoaderData()

  return <PassSequenceAnalysis teamStats={teamStats} />
}
