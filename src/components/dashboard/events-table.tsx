import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  XIcon,
} from 'lucide-react'

import type { DashboardMatch, DashboardTeamStats } from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  EMPTY_FILTERS,
  type DashboardFilters,
  filtersAreActive,
  isEventSelected,
  isMatchSelected,
  selectedMatchIds,
  toggleEventFilter,
  toggleMatchFilter,
} from '#/components/dashboard/dashboard-filters'
import { EventsCompareDialog } from '#/components/dashboard/events-compare-dialog'
import {
  MatchRoundHeader,
  sortMatchesByRound,
} from '#/components/dashboard/match-round-header'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { MatchMultiSelect } from './match-multi-select'

type EventsTableProps = {
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
}

function matchTotal(
  matches: DashboardTeamStats['matches'] | undefined,
  matchId: number,
) {
  return matches?.find((m) => m.match_id === matchId)?.total ?? 0
}

function initialExpanded() {
  return new Set<number>()
}

export default function EventsTable({
  matches,
  teamStats,
  filters,
  onFiltersChange,
}: EventsTableProps) {
  const [expanded, setExpanded] = useState<Set<number>>(initialExpanded)
  const [compareOpen, setCompareOpen] = useState(false)

  const orderedMatches = useMemo(() => sortMatchesByRound(matches), [matches])
  const allMatchIds = useMemo(
    () => orderedMatches.map((match) => match.match_id),
    [orderedMatches],
  )
  const visibleMatches = useMemo(() => {
    const allowed = new Set(selectedMatchIds(filters, allMatchIds))
    return orderedMatches.filter((match) => allowed.has(match.match_id))
  }, [orderedMatches, filters, allMatchIds])
  const active = filtersAreActive(filters)
  const hasEventSelection = filters.events.length > 0

  useEffect(() => {
    if (!hasEventSelection) setCompareOpen(false)
  }, [hasEventSelection])

  // Keep parents open when a sub-event filter is active so the selection stays visible.
  useEffect(() => {
    const parentIds = filters.events
      .filter((item) => item.subEventId != null)
      .map((item) => item.eventId)
    if (parentIds.length === 0) return
    setExpanded((prev) => {
      const next = new Set(prev)
      let changed = false
      for (const eventId of parentIds) {
        if (!next.has(eventId)) {
          next.add(eventId)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [filters.events])

  function toggleExpand(eventId: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return next
    })
  }

  function handleMatchClick(mouseEvent: React.MouseEvent, matchId: number) {
    mouseEvent.preventDefault()
    onFiltersChange(
      toggleMatchFilter(
        filters,
        matchId,
        mouseEvent.metaKey || mouseEvent.ctrlKey,
        allMatchIds,
      ),
    )
  }

  function handleEventClick(
    mouseEvent: React.MouseEvent,
    eventId: number,
    subEventId?: number,
  ) {
    mouseEvent.preventDefault()
    onFiltersChange(
      toggleEventFilter(
        filters,
        { eventId, subEventId },
        mouseEvent.metaKey || mouseEvent.ctrlKey,
      ),
    )
  }

  if (orderedMatches.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No matches for this team yet.
      </div>
    )
  }

  if (teamStats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No event stats for the selected filters.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-heading">Team events</h2>
          <p className="text-xs text-muted-foreground">
            Click an event or sub-event to filter. Hold Ctrl/Cmd to
            multi-select.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-end gap-2">
          <MatchMultiSelect
            matches={orderedMatches}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
          {hasEventSelection ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="mb-0.5"
              aria-label="Open event comparison chart"
              title="View comparison chart"
              onClick={() => setCompareOpen(true)}
            >
              <EyeIcon className="size-3.5" />
            </Button>
          ) : null}
          {active ? (
            <button
              type="button"
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
              className="mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            >
              <XIcon className="size-3" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <EventsCompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        matches={visibleMatches}
        teamStats={teamStats}
        filters={filters}
      />

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overflow-x-hidden [&_[data-slot=table-container]]:overflow-x-hidden">
        {visibleMatches.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            Select at least one match to show columns.
          </div>
        ) : (
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-30 bg-muted/95 backdrop-blur">
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="sticky left-0 z-20 w-[108px] bg-muted/95 px-2 text-xs">
                  Event
                </TableHead>
                {visibleMatches.map((match) => {
                  const selected = isMatchSelected(filters, match.match_id)
                  return (
                    <TableHead
                      key={match.match_id}
                      title={`${match.label} — click to filter`}
                      className={cn(
                        'cursor-pointer px-0.5 text-center text-[10px] font-semibold whitespace-normal transition-colors',
                        selected
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted/80',
                      )}
                      onClick={(mouseEvent) =>
                        handleMatchClick(mouseEvent, match.match_id)
                      }
                    >
                      <MatchRoundHeader match={match} />
                    </TableHead>
                  )
                })}
                <TableHead className="sticky right-0 z-20 w-12 bg-muted/95 px-1 text-center text-xs">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {teamStats.map((eventRow) => {
                const hasSubs = (eventRow.sub_events?.length ?? 0) > 0
                const isOpen = expanded.has(eventRow.event_id)
                const eventSelected = isEventSelected(
                  filters,
                  eventRow.event_id,
                )
                const eventVisibleTotal = visibleMatches.reduce(
                  (sum, match) =>
                    sum + matchTotal(eventRow.matches, match.match_id),
                  0,
                )

                return (
                  <Fragment key={eventRow.event_id}>
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        className={cn(
                          'sticky left-0 z-10 px-2 py-2.5',
                          eventSelected
                            ? 'bg-accent/40'
                            : 'bg-muted/20 hover:bg-muted/30',
                        )}
                      >
                        <div className="flex items-center gap-1">
                          {hasSubs ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(eventRow.event_id)}
                              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={
                                isOpen
                                  ? 'Collapse sub-events'
                                  : 'Expand sub-events'
                              }
                            >
                              {isOpen ? (
                                <ChevronDownIcon className="size-3" />
                              ) : (
                                <ChevronRightIcon className="size-3" />
                              )}
                            </button>
                          ) : (
                            <span className="inline-block w-4" />
                          )}
                          <button
                            type="button"
                            onClick={(mouseEvent) =>
                              handleEventClick(mouseEvent, eventRow.event_id)
                            }
                            className={cn(
                              'truncate text-left text-xs font-medium',
                              eventSelected
                                ? 'text-pitch'
                                : 'text-foreground hover:underline',
                            )}
                          >
                            {eventRow.event_name}
                          </button>
                        </div>
                      </TableCell>

                      {visibleMatches.map((match) => {
                        const value = matchTotal(
                          eventRow.matches,
                          match.match_id,
                        )
                        const matchSelected = isMatchSelected(
                          filters,
                          match.match_id,
                        )
                        return (
                          <TableCell
                            key={match.match_id}
                            className={cn(
                              'px-0.5 py-2.5 text-center text-[11px] tabular-nums',
                              value === 0 && 'text-muted-foreground/50',
                              eventSelected
                                ? 'bg-accent/40'
                                : matchSelected
                                  ? 'bg-accent/35'
                                  : 'bg-muted/20 hover:bg-muted/30',
                            )}
                          >
                            {value}
                          </TableCell>
                        )
                      })}

                      <TableCell
                        className={cn(
                          'sticky right-0 z-10 px-1 py-2.5 text-center text-xs font-semibold tabular-nums',
                          eventSelected
                            ? 'bg-accent/40'
                            : 'bg-muted/20 hover:bg-muted/30',
                        )}
                      >
                        {eventVisibleTotal}
                      </TableCell>
                    </TableRow>

                    {hasSubs && isOpen
                      ? eventRow.sub_events.map((sub) => {
                          const subSelected = isEventSelected(
                            filters,
                            eventRow.event_id,
                            sub.sub_event_id,
                          )
                          const subVisibleTotal = visibleMatches.reduce(
                            (sum, match) =>
                              sum + matchTotal(sub.matches, match.match_id),
                            0,
                          )
                          return (
                            <TableRow
                              key={`${eventRow.event_id}-${sub.sub_event_id}`}
                              className="hover:bg-transparent"
                            >
                              <TableCell
                                className={cn(
                                  'sticky left-0 z-10 px-2 py-2.5 pl-7',
                                  subSelected
                                    ? 'bg-accent/40'
                                    : 'bg-background hover:bg-muted/15',
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={(mouseEvent) =>
                                    handleEventClick(
                                      mouseEvent,
                                      eventRow.event_id,
                                      sub.sub_event_id,
                                    )
                                  }
                                  className={cn(
                                    'text-left text-[11px]',
                                    subSelected
                                      ? 'font-medium text-pitch'
                                      : 'text-muted-foreground hover:underline',
                                  )}
                                >
                                  {sub.sub_event_name}
                                </button>
                              </TableCell>
                              {visibleMatches.map((match) => {
                                const value = matchTotal(
                                  sub.matches,
                                  match.match_id,
                                )
                                const matchSelected = isMatchSelected(
                                  filters,
                                  match.match_id,
                                )
                                return (
                                  <TableCell
                                    key={match.match_id}
                                    className={cn(
                                      'px-0.5 py-2.5 text-center text-[11px] tabular-nums text-muted-foreground',
                                      value === 0 && 'text-muted-foreground/40',
                                      subSelected
                                        ? 'bg-accent/40'
                                        : matchSelected
                                          ? 'bg-accent/35'
                                          : 'bg-background hover:bg-muted/15',
                                    )}
                                  >
                                    {value}
                                  </TableCell>
                                )
                              })}
                              <TableCell
                                className={cn(
                                  'sticky right-0 z-10 px-1 py-2.5 text-center text-[11px] tabular-nums text-muted-foreground',
                                  subSelected
                                    ? 'bg-accent/40'
                                    : 'bg-background hover:bg-muted/15',
                                )}
                              >
                                {subVisibleTotal}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : null}
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
