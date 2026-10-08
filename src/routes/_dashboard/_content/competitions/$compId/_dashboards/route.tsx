import { z } from 'zod'
import { getTeamsFn } from '#/data/teams'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/_dashboards',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId, categoryId } }) => ({
    seasonId,
    divisionId,
    categoryId,
  }),
  loader: async ({
    params: { compId },
    deps: { seasonId, divisionId, categoryId },
  }) => {
    const teams = await getTeamsFn({
      data: {
        competitionId: compId,
        ...(seasonId != null ? { seasonId: String(seasonId) } : {}),
        ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
        ...(categoryId != null ? { categoryId: String(categoryId) } : {}),
      },
    })

    return { teams }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
