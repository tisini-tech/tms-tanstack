import { getCompetitionStandingsFn } from '#/data/competitions'
import StandingsTable from '#/components/standings/standings-table'
import { createFileRoute, useRouterState } from '@tanstack/react-router'
import z from 'zod'
import { cn } from '#/lib/utils'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/standings/',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search }) => ({
    seasonId: search.seasonId,
    divisionId: search.divisionId,
    categoryId: search.categoryId,
  }),
  loader: async ({
    params: { compId },
    deps: { seasonId, divisionId, categoryId },
  }) => {
    const addSeqPoints = compId === '252'

    const standings = await getCompetitionStandingsFn({
      data: {
        competitionId: compId,
        seasonId: seasonId?.toString() ?? '',
        divisionId: divisionId?.toString(),
        categoryId: categoryId?.toString(),
        addSeqPoints,
      },
    })

    return { standings, addSeqPoints }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { standings, addSeqPoints } = Route.useLoaderData()
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  return (
    <div
      className={cn(
        'flex h-[calc(100dvh-7rem)] flex-col p-1 transition-opacity',
        isLoading && 'pointer-events-none opacity-50',
      )}
    >
      <StandingsTable standings={standings} showSeqPoints={addSeqPoints} />
    </div>
  )
}
