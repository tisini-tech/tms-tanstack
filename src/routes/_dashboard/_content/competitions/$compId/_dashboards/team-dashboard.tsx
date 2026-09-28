import { z } from 'zod'
import { useMemo, useState } from 'react'
import { createFileRoute, getRouteApi, redirect, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

import type { Team } from '#/lib/types'
import { getMetricsFn } from '#/data/metrics'
import { getTeamDashboardFn } from '#/data/teams'
import { getCompetitionsFn } from '#/data/competitions'
import TeamDashboard from '#/components/dashboard/team-dashboard'
import TeamDashboardSimple from '#/components/dashboard/team-dash'
import { DashboardKpiCards } from '#/components/dashboard/dashboard-kpi-cards'
import { MetricsMultiSelect } from '#/components/dashboard/metrics-multi-select'
import { SimpleTeamReportDownload } from '#/components/dashboard/simple-team-report-download'
import {
  resolveDashboardEventIds,
  serializeEventIdsSearch,
  simpleDashboardEventIds,
} from '#/components/dashboard/initial-events'
import {
  EMPTY_FILTERS,
  type DashboardFilters,
} from '#/components/dashboard/dashboard-filters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const dashboardLayoutRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId/_dashboards',
)

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/_dashboards/team-dashboard',
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
    deps: { teamId, seasonId, divisionId, categoryId, eventIds },
    parentMatchPromise,
  }) => {
    const parentMatch = await parentMatchPromise
    const teams =
      (parentMatch?.loaderData as { teams: Team[] } | undefined)?.teams ?? []

    const categoryName = await categoryNameFor(compId, categoryId)
    const visibleTeams = teamsInCategory(teams, categoryName)
    const selectedTeamId =
      teamId != null && visibleTeams.some((team) => team.id === teamId)
        ? teamId
        : visibleTeams[0]?.id

    if (selectedTeamId != null && selectedTeamId !== teamId) {
      throw redirect({
        to: '/competitions/$compId/team-dashboard',
        params: { compId },
        search: {
          teamId: selectedTeamId,
          seasonId,
          divisionId,
          categoryId,
          eventIds,
        },
        replace: true,
      })
    }

    const resolvedEventIds =
      compId === '252'
        ? simpleDashboardEventIds
        : resolveDashboardEventIds(eventIds)

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
        categoryName,
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
          categoryId: categoryId?.toString() ?? '',
          eventIds: resolvedEventIds,
        },
      }),
      metricsPromise,
    ])

    return {
      dashboardData,
      selectedTeamId,
      categoryName,
      metrics,
      eventIds: resolvedEventIds,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { compId } = Route.useParams()

  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (state) => state.isLoading })

  const { teams } = dashboardLayoutRoute.useLoaderData()
  const {
    dashboardData,
    selectedTeamId,
    categoryName,
    metrics = [],
    eventIds,
  } = Route.useLoaderData()

  const matches = dashboardData?.matches ?? []
  const teamStats = dashboardData?.team_stats ?? []
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS)

  const teamItems = useMemo(
    () =>
      teamsInCategory(teams, categoryName).map((team) => ({
        value: team.id.toString(),
        label: team.name,
      })),
    [teams, categoryName],
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
            : teamItems.length === 0
              ? `No teams match ${categoryName}.`
              : 'Select a team to view the dashboard.'}
        </div>
      </div>
    )
  }

  if (compId === '252') {
    return (
      <div className="flex h-[calc(100dvh-7rem)] flex-col gap-2">
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <SimpleTeamReportDownload
            teamName={
              teams.find((team) => team.id === selectedTeamId)?.name ?? ''
            }
            matches={matches}
            teamStats={teamStats}
            sequences={dashboardData.sequences}
            opponentStats={dashboardData.opponent_stats}
          />
          <TeamSelect
            items={teamItems}
            value={selectedTeamId.toString()}
            onValueChange={handleTeamChange}
          />
        </div>
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col transition-opacity',
            isLoading && 'pointer-events-none opacity-50',
          )}
        >
          <TeamDashboardSimple
            matches={matches}
            teamStats={teamStats}
            sequences={dashboardData.sequences}
            opponentStats={dashboardData.opponent_stats}
          />
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
            value={selectedTeamId.toString()}
            onValueChange={handleTeamChange}
          />
        </div>
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col transition-opacity',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <TeamDashboard
          matches={matches}
          teamStats={teamStats}
          filters={filters}
          setFilters={setFilters}
          quarterStats={dashboardData.quarter_stats ?? []}
          playerStats={dashboardData.player_stats ?? []}
          playerAppearances={dashboardData.player_appearances ?? []}
        />
      </div>
    </div>
  )
}

async function categoryNameFor(
  compId: string,
  categoryId: number | undefined,
) {
  if (categoryId == null) return ''
  const competitions = await getCompetitionsFn()
  return (
    competitions
      .find((competition) => String(competition.id) === compId)
      ?.categories.find((category) => category.id === categoryId)?.name ?? ''
  )
}

function teamsInCategory(teams: Team[], categoryName: string) {
  const needle = categoryName.trim().toUpperCase()
  if (!needle) return teams
  return teams.filter((team) => team.name.toUpperCase().includes(needle))
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
