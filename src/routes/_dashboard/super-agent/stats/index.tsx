import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getTopPlayersStatsFn } from '#/data/stats'
import { TopPlayersTable } from '#/components/stats/top-players-table'

const roundsSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  return Array.isArray(value) ? value : [value]
}, z.array(z.string()).optional())

export const Route = createFileRoute('/_dashboard/super-agent/stats/')({
  validateSearch: z.object({
    competitionId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
  }),
  loaderDeps: ({
    search: { competitionId, divisionId, seasonId, rounds, month },
  }) => ({
    competitionId,
    divisionId,
    seasonId,
    rounds,
    month,
  }),
  loader: async ({ deps }) => {
    const { competitionId, divisionId, seasonId, rounds, month } = deps

    if (!competitionId || !seasonId) {
      return { topPlayersStats: null }
    }

    const topPlayersStats = await getTopPlayersStatsFn({
      data: {
        competitionId,
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
