import z from 'zod'
import { createFileRoute, getRouteApi, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import {
  getCompetitionStandingsFn,
  getLeagueDashboardFn,
} from '#/data/competitions'
import LeagueDashboardTable from '#/components/dashboard/league-dash'
import { SimpleLeagueReportDownload } from '#/components/dashboard/simple-league-report-download'
import {
  resolveDashboardEventIds,
  simpleDashboardEventIds,
} from '#/components/dashboard/initial-events'
import type { CompetitionStandings } from '#/lib/types'

const competitionRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/_dashboards/league-dashboard',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    /** Comma-separated metric/event ids, e.g. `19,238,155`. */
    eventIds: z.string().optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId, categoryId, eventIds } }) => ({
    seasonId,
    divisionId,
    categoryId,
    eventIds,
  }),
  loader: async ({
    params,
    deps: { seasonId, divisionId, categoryId, eventIds },
  }) => {
    const { compId } = params

    const resolvedEventIds =
      compId === '252'
        ? simpleDashboardEventIds
        : resolveDashboardEventIds(eventIds)

    const seasonKey = seasonId?.toString() ?? ''

    const [dashboard, standings] = await Promise.all([
      getLeagueDashboardFn({
        data: {
          competitionId: compId,
          seasonId: seasonKey,
          divisionId: divisionId?.toString(),
          categoryId: categoryId?.toString(),
          eventIds: resolvedEventIds,
        },
      }),
      seasonKey
        ? getCompetitionStandingsFn({
            data: {
              competitionId: compId,
              seasonId: seasonKey,
              divisionId: divisionId?.toString(),
              categoryId: categoryId?.toString(),
              addSeqPoints: true,
            },
          }).catch(() => null)
        : Promise.resolve(null),
    ])

    return {
      dashboard,
      seqPointsByTeamId: seqPointsFromStandings(standings),
    }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { dashboard, seqPointsByTeamId } = Route.useLoaderData()
  const { competition } = competitionRoute.useLoaderData()
  const { seasonId, divisionId, categoryId } = Route.useSearch()
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  const seasonName =
    competition.seasons.find((entry) => entry.id === seasonId)?.name ?? ''
  const divisionName =
    competition.divisions.find((entry) => entry.id === divisionId)?.name ?? ''
  const categoryName =
    (competition.categories ?? []).find((entry) => entry.id === categoryId)
      ?.name ?? ''

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-2">
      <div className="ml-auto">
        <SimpleLeagueReportDownload
          dashboard={dashboard}
          seqPointsByTeamId={seqPointsByTeamId}
          competitionName={competition.name}
          seasonName={seasonName}
          divisionName={divisionName}
          categoryName={categoryName}
        />
      </div>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-opacity',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <LeagueDashboardTable
          dashboard={dashboard}
          seqPointsByTeamId={seqPointsByTeamId}
        />
      </div>
    </div>
  )
}

function seqPointsFromStandings(standings: CompetitionStandings | null) {
  const map: Record<number, number> = {}
  if (!standings) return map

  const teams = [
    ...(standings.standings ?? []),
    ...(standings.stages ?? []).flatMap((stage) => stage.standings),
  ]

  for (const team of teams) {
    map[team.id] = team.seq_points ?? 0
  }

  return map
}
