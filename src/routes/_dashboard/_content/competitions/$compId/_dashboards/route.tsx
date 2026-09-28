import { getTeamsFn } from '#/data/teams'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/_dashboards',
)({
  loader: async ({ params: { compId } }) => {
    const teams = await getTeamsFn({
      data: { competitionId: compId },
    })

    return { teams }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
