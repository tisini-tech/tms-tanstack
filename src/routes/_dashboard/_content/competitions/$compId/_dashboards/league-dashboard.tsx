import z from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { getLeagueDashboardFn } from '#/data/competitions'
import LeagueDashboardTable from '#/components/dashboard/league-dash'
import { SimpleLeagueReportDownload } from '#/components/dashboard/simple-league-report-download'
import {
  resolveDashboardEventIds,
  simpleDashboardEventIds,
} from '#/components/dashboard/initial-events'

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

    const dashboard = await getLeagueDashboardFn({
      data: {
        competitionId: compId,
        seasonId: seasonId?.toString() ?? '',
        divisionId: divisionId?.toString(),
        categoryId: categoryId?.toString(),
        eventIds: resolvedEventIds,
      },
    })

    return { dashboard }
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { dashboard } = Route.useLoaderData()
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-2">
      <div className="ml-auto">
        <SimpleLeagueReportDownload dashboard={dashboard} />
      </div>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-opacity',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <LeagueDashboardTable dashboard={dashboard} />
      </div>
    </div>
  )
}
