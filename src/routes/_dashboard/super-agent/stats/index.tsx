import { createFileRoute } from '@tanstack/react-router'

import { getTopPlayersStatsFn } from '#/data/stats'
import { TopPlayersTable } from '#/components/stats/top-players-table'
import z from 'zod'

export const Route = createFileRoute('/_dashboard/super-agent/stats/')({
  validateSearch: z.object({
    competitionId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    round: z.string().optional(),
    month: z.string().optional(),
  }),
  loaderDeps: ({
    search: { competitionId, divisionId, seasonId, round, month },
  }) => ({
    competitionId,
    divisionId,
    seasonId,
    round,
    month,
  }),
  loader: async ({ deps }) => {
    const { competitionId, divisionId, seasonId, round, month } = deps

    if (!competitionId || !seasonId) {
      return { topPlayersStats: null }
    }

    const topPlayersStats = await getTopPlayersStatsFn({
      data: {
        competitionId,
        seasonId,
        ...(divisionId != null && { divisionId }),
        ...(round && { round }),
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
