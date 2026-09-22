import { useMemo } from 'react'

import type { DashboardMatch, DashboardTeamStats } from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  type DashboardFilters,
  selectedMatchIds,
} from '#/components/dashboard/dashboard-filters'
import { computeDashboardKpis } from '#/components/dashboard/dashboard-kpis'

type DashboardKpiCardsProps = {
  teamStats: DashboardTeamStats[]
  matches: DashboardMatch[]
  loadedEventIds: number[]
  filters: DashboardFilters
  className?: string
}

export function DashboardKpiCards({
  teamStats,
  matches,
  loadedEventIds,
  filters,
  className,
}: DashboardKpiCardsProps) {
  const matchIds = useMemo(() => {
    const allIds = matches.map((match) => match.match_id)
    return selectedMatchIds(filters, allIds)
  }, [matches, filters])

  const selectedEventIds = useMemo(
    () => [...new Set(filters.events.map((item) => item.eventId))],
    [filters.events],
  )

  const kpis = useMemo(
    () =>
      computeDashboardKpis({
        teamStats,
        matchIds,
        loadedEventIds,
        selectedEventIds,
      }),
    [teamStats, matchIds, loadedEventIds, selectedEventIds],
  )

  if (kpis.length === 0) return null

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-wrap items-stretch gap-2',
        className,
      )}
    >
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={cn(
            'min-w-[7.5rem] flex-1 rounded-xl border border-border bg-card px-3 py-2 sm:max-w-[11rem]',
            !kpi.available && 'opacity-60',
          )}
        >
          <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-heading">
            {kpi.display}
          </p>
          {kpi.detail ? (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {kpi.detail}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
