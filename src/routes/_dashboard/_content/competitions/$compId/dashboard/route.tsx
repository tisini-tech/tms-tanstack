import { getTeamsFn } from '#/data/teams'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/dashboard',
)({
  loader: async ({ params: { compId } }) => {
    const teams = await getTeamsFn({
      data: { competitionId: compId },
    })

    if (compId === '252') {
      throw redirect({
        to: '/competitions/$compId/dashboard/simple',
        params: { compId },
      })
    }

    return { teams }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
