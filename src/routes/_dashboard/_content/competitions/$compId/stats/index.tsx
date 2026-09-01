import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getTopPlayersStatsFn } from '#/data/stats'
import { TopPlayersTable } from '#/components/stats/top-players-table'

const roundsSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  return Array.isArray(value) ? value : [value]
}, z.array(z.string()).optional())

export const Route = createFileRoute('/_dashboard/_content/competitions/$compId/stats/')({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
  }),
  loaderDeps: ({
    search: { seasonId, divisionId, rounds, month },
  }) => ({
    seasonId,
    divisionId,
    rounds,
    month,
  }),
  loader: async ({ params: { compId }, deps }) => {
    const { seasonId, divisionId, rounds, month } = deps

    if (!seasonId) {
      return { topPlayersStats: null }
    }

    const topPlayersStats = await getTopPlayersStatsFn({
      data: {
        competitionId: Number(compId),
        seasonId,
        ...(divisionId != null && { divisionId }),
        ...(rounds?.length ? { rounds } : {}),
        ...(month && { month }),
      },
    })

    return { topPlayersStats }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { topPlayersStats } = Route.useLoaderData()

  return (
    <div>
      <TopPlayersTable players={topPlayersStats?.results || []} />
    </div>
  )
}
