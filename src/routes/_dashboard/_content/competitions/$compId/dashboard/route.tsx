import { getTeamsFn } from '#/data/teams'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/dashboard',
)({
  beforeLoad: ({ params, location }) => {
    if (
      params.compId === '252' &&
      !location.pathname.endsWith('/dashboard/simple')
    ) {
      throw redirect({
        to: '/competitions/$compId/dashboard/simple',
        params: { compId: params.compId },
        search: location.search,
      })
    }
  },
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
