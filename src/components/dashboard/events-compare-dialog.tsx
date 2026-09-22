import { useMemo } from 'react'

import type { DashboardMatch, DashboardTeamStats } from '#/lib/types'
import { cn } from '#/lib/utils'
import type {
  DashboardFilters,
  EventFilterKey,
} from '#/components/dashboard/dashboard-filters'
import { parseMatchRound } from '#/components/dashboard/match-round-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

const SERIES_COLORS = [
  'bg-sky-400',
  'bg-amber-400',
  'bg-violet-400',
  'bg-teal-400',
  'bg-rose-400',
  'bg-lime-400',
  'bg-orange-400',
  'bg-fuchsia-400',
]

type EventsCompareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  filters: DashboardFilters
}

type ChartSeries = {
  id: string
  name: string
  color: string
  values: number[]
}

function seriesKey(filter: EventFilterKey) {
  return filter.subEventId == null
    ? `e:${filter.eventId}`
    : `e:${filter.eventId}:s:${filter.subEventId}`
}

function matchValue(
  matches: { match_id: number; total: number }[] | undefined,
  matchId: number,
) {
  return matches?.find((match) => match.match_id === matchId)?.total ?? 0
}

function buildSeries(
  teamStats: DashboardTeamStats[],
  filters: EventFilterKey[],
  matchIds: number[],
): ChartSeries[] {
  return filters.map((filter, index) => {
    const event = teamStats.find((row) => row.event_id === filter.eventId)
    const color = SERIES_COLORS[index % SERIES_COLORS.length]!

    if (!event) {
      return {
        id: seriesKey(filter),
        name: `Event ${filter.eventId}`,
        color,
        values: matchIds.map(() => 0),
      }
    }

    if (filter.subEventId == null) {
      return {
        id: seriesKey(filter),
        name: event.event_name,
        color,
        values: matchIds.map((matchId) =>
          matchValue(event.matches, matchId),
        ),
      }
    }

    const sub = event.sub_events?.find(
      (row) => row.sub_event_id === filter.subEventId,
    )

    return {
      id: seriesKey(filter),
      name: sub?.sub_event_name ?? `${event.event_name} sub-event`,
      color,
      values: matchIds.map((matchId) =>
        matchValue(sub?.matches, matchId),
      ),
    }
  })
}

export function EventsCompareDialog({
  open,
  onOpenChange,
  matches,
  teamStats,
  filters,
}: EventsCompareDialogProps) {
  const matchIds = useMemo(
    () => matches.map((match) => match.match_id),
    [matches],
  )

  const series = useMemo(
    () => buildSeries(teamStats, filters.events, matchIds),
    [teamStats, filters.events, matchIds],
  )

  const maxValue = useMemo(() => {
    let max = 0
    for (const item of series) {
      for (const value of item.values) {
        if (value > max) max = value
      }
    }
    return max
  }, [series])

  const title =
    series.length === 1
      ? series[0]!.name
      : series.map((item) => item.name).join(' vs ')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,840px)] w-full flex-col gap-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Event comparison</DialogTitle>
          <DialogDescription>
            {series.length <= 1
              ? 'Grouped by match for the selected event.'
              : 'Grouped bars by match for the selected events.'}{' '}
            {title}
          </DialogDescription>
        </DialogHeader>

        {series.length > 0 ? (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {series.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span className={cn('size-2.5 rounded-sm', item.color)} />
                {item.name}
              </div>
            ))}
          </div>
        ) : null}

        {matches.length === 0 || series.length === 0 ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground">
            Select at least one event and match to chart.
          </div>
        ) : (
          <div className="scrollbar-thin min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-xl border border-border bg-muted/10 p-4">
            <div
              className="flex h-72 items-end gap-3"
              style={{
                minWidth: `${Math.max(matches.length * Math.max(series.length, 1) * 18, 480)}px`,
              }}
            >
              {matches.map((match, matchIndex) => {
                const { round } = parseMatchRound(match)

                return (
                  <div
                    key={match.match_id}
                    className="flex min-w-10 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-56 w-full items-end justify-center gap-0.5">
                      {series.map((item) => {
                        const value = item.values[matchIndex] ?? 0
                        const heightPct =
                          maxValue > 0 ? (value / maxValue) * 100 : 0

                        return (
                          <div
                            key={item.id}
                            title={`${item.name}: ${value.toLocaleString()} · ${match.label}`}
                            className={cn(
                              'w-full min-w-2 max-w-5 rounded-t-sm transition-colors',
                              item.color,
                              value === 0 && 'opacity-30',
                            )}
                            style={{
                              height: `${Math.max(heightPct, value > 0 ? 2 : 0)}%`,
                            }}
                          >
                            <span className="sr-only">
                              {item.name} {value} in {round}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <span
                      className="truncate text-[10px] font-medium text-muted-foreground"
                      title={match.label}
                    >
                      {round}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
