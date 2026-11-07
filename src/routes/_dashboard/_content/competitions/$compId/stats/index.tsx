import { z } from 'zod'
import { useMemo, useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { topPlayersStatsQueryOptions } from '#/data/stats'
import { toTopPlayerRows } from '#/components/stats/transform-top-player-stats'
import {
  TopPlayersTable,
  type StatMode,
} from '#/components/stats/top-players-table'
import {
  minMatchesSearchSchema,
  panelViewSearchSchema,
  roundsSearchSchema,
} from './route'

const panelViews = [
  { value: 'overall', label: 'Overall' },
  { value: 'attacking', label: 'Attacking' },
  { value: 'defensive', label: 'Defensive' },
  { value: 'goalkeeping', label: 'Goalkeeping' },
] as const

type PanelView = (typeof panelViews)[number]['value']

function panelFlags(panelView: PanelView | undefined) {
  return {
    isAttacking: panelView === 'attacking',
    isDefensive: panelView === 'defensive',
    isGoalkeeping: panelView === 'goalkeeping',
  }
}

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/stats/',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
    minMatches: minMatchesSearchSchema,
    teamId: z.coerce.number().optional(),
    panelView: panelViewSearchSchema,
    matchType: z.string().optional(),
  }),
  loaderDeps: ({
    search: {
      seasonId,
      divisionId,
      categoryId,
      rounds,
      month,
      minMatches,
      teamId,
      panelView,
    },
  }) => ({
    seasonId,
    divisionId,
    categoryId,
    rounds,
    month,
    minMatches,
    teamId,
    panelView,
  }),
  loader: async ({ context, params: { compId }, deps }) => {
    const {
      seasonId,
      divisionId,
      categoryId,
      rounds,
      month,
      minMatches,
      teamId,
      panelView,
    } = deps

    if (!seasonId) {
      return { topPlayersStats: null }
    }

    const { isAttacking, isDefensive, isGoalkeeping } = panelFlags(panelView)

    const topPlayersStats = await context.queryClient.ensureQueryData(
      topPlayersStatsQueryOptions(
        Number(compId),
        seasonId,
        divisionId,
        categoryId,
        rounds,
        month,
        minMatches,
        teamId,
        isAttacking,
        isDefensive,
        isGoalkeeping,
      ),
    )

    return { topPlayersStats }
  },
  component: RouteComponent,
})

function statModeFlags(mode: StatMode) {
  return {
    isP90: mode === 'total-p90',
    isCompP90: mode === 'complete-p90',
  }
}

function resolveView(view: PanelView | undefined, rugby: boolean): PanelView {
  if (rugby && view === 'goalkeeping') return 'overall'
  return view ?? 'overall'
}

function RouteComponent() {
  const { topPlayersStats } = Route.useLoaderData()
  const { panelView, matchType } = Route.useSearch()
  const navigate = Route.useNavigate()
  const rugby = (matchType ?? '').toLowerCase().includes('rugby')
  const views = rugby
    ? panelViews.filter((view) => view.value !== 'goalkeeping')
    : panelViews
  const activeView = resolveView(panelView, rugby)
  const pendingView = useRouterState({
    select: (state) => {
      const samePage =
        state.location.pathname === state.resolvedLocation?.pathname
      if (!state.isLoading || !samePage) return null
      const search = state.location.search as { panelView?: PanelView }
      return resolveView(search.panelView, rugby)
    },
  })
  const isPanelLoading = pendingView != null
  const displayedView = pendingView ?? activeView
  const [statMode, setStatMode] = useState<StatMode>('stats')

  const rows = useMemo(() => {
    const { isP90, isCompP90 } = statModeFlags(statMode)
    return toTopPlayerRows(topPlayersStats?.results ?? [], isP90, isCompP90, matchType)
  }, [topPlayersStats, statMode, matchType])

  return (
    <div className="min-w-0 space-y-4">
      <div
        className={cn(
          'grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1',
          rugby ? 'sm:grid-cols-3' : 'sm:grid-cols-4',
        )}
        role="tablist"
        aria-label="Player stats view"
        aria-busy={isPanelLoading}
      >
        {views.map((view) => {
          const selected = displayedView === view.value
          return (
            <button
              key={view.value}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={isPanelLoading}
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    panelView:
                      view.value === 'overall' ? undefined : view.value,
                  }),
                  replace: true,
                })
              }
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors disabled:cursor-progress',
                selected
                  ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {selected && isPanelLoading ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : null}
              {view.label}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'relative min-w-0 transition-opacity',
          isPanelLoading && 'pointer-events-none opacity-50',
        )}
        aria-busy={isPanelLoading}
      >
        <TopPlayersTable
          rows={rows}
          panelView={activeView}
          matchType={matchType}
          statMode={statMode}
          onStatModeChange={setStatMode}
        />
        {isPanelLoading ? (
          <div className="absolute inset-x-0 top-14 z-20 flex justify-center">
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <Loader2Icon className="size-4 animate-spin" />
              Loading {views.find((view) => view.value === displayedView)?.label} stats
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
