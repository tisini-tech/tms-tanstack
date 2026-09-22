import z from 'zod'
import { useMemo, useState } from 'react'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import type { Team } from '#/lib/types'
import { getMetricsFn } from '#/data/metrics'
import { getTeamDashboardFn } from '#/data/teams'
import EventsTable from '#/components/dashboard/events-table'
import PlayersTable from '#/components/dashboard/players-table'
import QuartersTable from '#/components/dashboard/quarters-table'
import { DashboardKpiCards } from '#/components/dashboard/dashboard-kpi-cards'
import { MetricsMultiSelect } from '#/components/dashboard/metrics-multi-select'
import {
  EMPTY_FILTERS,
  type DashboardFilters,
} from '#/components/dashboard/dashboard-filters'
import {
  resolveDashboardEventIds,
  serializeEventIdsSearch,
} from '#/components/dashboard/initial-events'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

/** Layout route (no trailing slash) — owns `teams`. */
const dashboardLayoutRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/dashboard',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/dashboard/',
)({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    /** Comma-separated metric/event ids, e.g. `19,238,155`. */
    eventIds: z.string().optional(),
  }),
  loaderDeps: ({
    search: { teamId, seasonId, divisionId, categoryId, eventIds },
  }) => ({
    teamId,
    seasonId,
    divisionId,
    categoryId,
    eventIds,
  }),
  loader: async ({
    params: { compId },
    deps: { teamId, seasonId, divisionId, eventIds },
    parentMatchPromise,
  }) => {
    const parentMatch = await parentMatchPromise
    const teams =
      (parentMatch?.loaderData as { teams: Team[] } | undefined)?.teams ?? []
    const selectedTeamId = teamId ?? teams[0]?.id
    const resolvedEventIds = resolveDashboardEventIds(eventIds)

    const metricsPromise = getMetricsFn({
      data: {
        fixType:
          teams
            .map((team) => team.team_type.name.toLowerCase())
            .find(Boolean) ?? 'football',
      },
    })

    if (!selectedTeamId) {
      return {
        dashboardData: null,
        selectedTeamId: undefined as number | undefined,
        metrics: await metricsPromise,
        eventIds: resolvedEventIds,
      }
    }

    const [dashboardData, metrics] = await Promise.all([
      getTeamDashboardFn({
        data: {
          competitionId: compId,
          seasonId: seasonId?.toString() ?? '',
          teamId: selectedTeamId.toString(),
          divisionId: divisionId?.toString() ?? '',
          eventIds: resolvedEventIds,
        },
      }),
      metricsPromise,
    ])

    return {
      dashboardData,
      selectedTeamId,
      metrics,
      eventIds: resolvedEventIds,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  const { teams } = dashboardLayoutRoute.useLoaderData()
  const {
    dashboardData,
    selectedTeamId,
    metrics = [],
    eventIds,
  } = Route.useLoaderData()

  const matches = dashboardData?.matches ?? []
  const teamStats = dashboardData?.team_stats ?? []
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)

  const teamItems = useMemo(
    () =>
      teams.map((team) => ({ value: team.id.toString(), label: team.name })),
    [teams],
  )

  function handleTeamChange(value: string | null) {
    if (value == null) return
    const nextTeamId = Number(value)
    if (!Number.isFinite(nextTeamId) || nextTeamId === selectedTeamId) return

    setFilters(EMPTY_FILTERS)
    void navigate({
      search: (prev) => ({
        ...prev,
        teamId: nextTeamId,
      }),
    })
  }

  function handleMetricsApply(nextEventIds: number[]) {
    setFilters(EMPTY_FILTERS)
    void navigate({
      search: (prev) => ({
        ...prev,
        eventIds: serializeEventIdsSearch(nextEventIds),
      }),
    })
  }

  if (!dashboardData || selectedTeamId == null) {
    return (
      <div className="flex h-[calc(100dvh-7rem)] flex-col gap-2">
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <MetricsMultiSelect
            metrics={metrics}
            selectedIds={eventIds}
            onApply={handleMetricsApply}
          />
          <TeamSelect
            items={teamItems}
            value={selectedTeamId?.toString()}
            onValueChange={handleTeamChange}
          />
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
          {teams.length === 0
            ? 'No teams in this competition yet.'
            : 'Select a team to view the dashboard.'}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-2">
      <div className="flex w-full shrink-0 flex-wrap items-end justify-between gap-2">
        <DashboardKpiCards
          teamStats={teamStats}
          matches={matches}
          loadedEventIds={eventIds}
          filters={filters}
        />
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <MetricsMultiSelect
            metrics={metrics}
            selectedIds={eventIds}
            onApply={handleMetricsApply}
          />
          <TeamSelect
            items={teamItems}
            value={selectedTeamId?.toString()}
            onValueChange={handleTeamChange}
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:grid-cols-5">
        <div className="flex min-h-0 min-w-0 flex-col gap-4 lg:col-span-4">
          <div className="min-h-0 flex-1">
            <EventsTable
              matches={matches}
              teamStats={teamStats}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
          <div className="min-h-0 basis-[28%] shrink-0 grow-0">
            <QuartersTable
              matches={matches}
              quarterStats={dashboardData.quarter_stats ?? []}
              filters={filters}
            />
          </div>
        </div>

        <div className="min-h-0 min-w-0 lg:col-span-1">
          <PlayersTable
            playerStats={dashboardData.player_stats ?? []}
            appearances={dashboardData.player_appearances ?? []}
            filters={filters}
          />
        </div>
      </div>
    </div>
  )
}

function TeamSelect({
  items,
  value,
  onValueChange,
}: {
  items: { value: string; label: string }[]
  value?: string
  onValueChange: (value: string | null) => void
}) {
  if (items.length === 0) return null

  return (
    <Select value={value} items={items} onValueChange={onValueChange}>
      <SelectTrigger className="min-w-52 max-w-72">
        <SelectValue placeholder="Select a team" />
      </SelectTrigger>
      <SelectContent align="end">
        {items.map((team) => (
          <SelectItem key={team.value} value={team.value}>
            {team.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
