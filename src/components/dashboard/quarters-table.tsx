import { useMemo } from 'react'

import type {
  DashboardMatch,
  DashboardQuarterStats,
} from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  type DashboardFilters,
  filterQuarterStats,
} from '#/components/dashboard/dashboard-filters'
import {
  MatchRoundHeader,
  sortMatchesByRound,
} from '#/components/dashboard/match-round-header'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

const QUARTER_ORDER = [
  '0-15',
  '16-30',
  '31-45',
  '46-60',
  '61-75',
  '76-90',
] as const

type QuartersTableProps = {
  matches: DashboardMatch[]
  quarterStats: DashboardQuarterStats[]
  filters: DashboardFilters
}

function normalizeQuarter(label: string) {
  const trimmed = label.trim()
  if (trimmed === '1-15') return '0-15'
  return trimmed
}

function heatmapClass(value: number, min: number, max: number) {
  if (value <= 0 || max <= 0) {
    return 'bg-transparent text-muted-foreground/40'
  }

  const t = max === min ? 1 : (value - min) / (max - min)

  if (t >= 0.75) return 'bg-slate-700 text-white dark:bg-slate-500'
  if (t >= 0.5) return 'bg-teal-700/85 text-white dark:bg-teal-600'
  if (t >= 0.25) return 'bg-teal-500/55 text-foreground dark:bg-teal-700/50'
  return 'bg-teal-200/70 text-foreground dark:bg-teal-900/40'
}

function buildTotalsMatrix(quarterStats: DashboardQuarterStats[]) {
  const totals = new Map<string, Map<number, number>>()

  for (const label of QUARTER_ORDER) {
    totals.set(label, new Map())
  }

  for (const event of quarterStats) {
    for (const quarter of event.quarters ?? []) {
      const label = normalizeQuarter(quarter.quarter)
      if (!totals.has(label)) totals.set(label, new Map())
      const byMatch = totals.get(label)!

      for (const match of quarter.matches ?? []) {
        byMatch.set(
          match.match_id,
          (byMatch.get(match.match_id) ?? 0) + match.total,
        )
      }
    }
  }

  return totals
}

export default function QuartersTable({
  matches,
  quarterStats,
  filters,
}: QuartersTableProps) {
  const filteredStats = useMemo(
    () => filterQuarterStats(quarterStats, filters),
    [quarterStats, filters],
  )

  const orderedMatches = useMemo(() => {
    const sorted = sortMatchesByRound(matches)
    if (filters.matchIds == null) return sorted
    const allowed = new Set(filters.matchIds)
    return sorted.filter((match) => allowed.has(match.match_id))
  }, [matches, filters.matchIds])

  const totalsByQuarter = useMemo(
    () => buildTotalsMatrix(filteredStats),
    [filteredStats],
  )

  const quarters = useMemo(
    () =>
      QUARTER_ORDER.map((label) => ({
        quarter: label,
        byMatch: totalsByQuarter.get(label) ?? new Map<number, number>(),
      })),
    [totalsByQuarter],
  )

  const { cellMin, cellMax, columnTotals, grandTotal } = useMemo(() => {
    const values: number[] = []
    const totals = new Map<number, number>()

    for (const match of orderedMatches) {
      totals.set(match.match_id, 0)
    }

    for (const quarter of quarters) {
      for (const match of orderedMatches) {
        const value = quarter.byMatch.get(match.match_id) ?? 0
        values.push(value)
        totals.set(match.match_id, (totals.get(match.match_id) ?? 0) + value)
      }
    }

    const nonzero = values.filter((v) => v > 0)

    return {
      cellMin: nonzero.length ? Math.min(...nonzero) : 0,
      cellMax: nonzero.length ? Math.max(...nonzero) : 0,
      columnTotals: totals,
      grandTotal: [...totals.values()].reduce((sum, n) => sum + n, 0),
    }
  }, [quarters, orderedMatches])

  if (matches.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No matches for this team yet.
      </div>
    )
  }

  if (quarterStats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No quarter stats for the selected filters.
      </div>
    )
  }

  if (orderedMatches.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        No matches match the current filters.
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-xl border border-border bg-card [&_[data-slot=table-container]]:h-full [&_table]:h-full">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="sticky left-0 z-20 h-7 w-[72px] bg-muted/95 px-2 text-xs">
              Quarter
            </TableHead>
            {orderedMatches.map((match) => (
              <TableHead
                key={match.match_id}
                title={match.label}
                className="h-8 min-w-[56px] px-1 text-center text-[11px] font-semibold whitespace-normal"
              >
                <MatchRoundHeader match={match} />
              </TableHead>
            ))}
            <TableHead className="sticky right-0 z-20 h-7 w-[84px] bg-muted/95 px-1 text-center text-xs">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {quarters.map((quarter) => {
            const rowTotal = orderedMatches.reduce(
              (sum, match) => sum + (quarter.byMatch.get(match.match_id) ?? 0),
              0,
            )

            return (
              <TableRow key={quarter.quarter}>
                <TableCell className="sticky left-0 z-10 bg-card px-2 py-0.5 text-xs font-medium tabular-nums">
                  {quarter.quarter}
                </TableCell>
                {orderedMatches.map((match) => {
                  const value = quarter.byMatch.get(match.match_id) ?? 0
                  return (
                    <TableCell
                      key={match.match_id}
                      className={cn(
                        'px-1 py-0.5 text-center text-xs font-medium tabular-nums',
                        heatmapClass(value, cellMin, cellMax),
                      )}
                    >
                      {value}
                    </TableCell>
                  )
                })}
                <TableCell className="sticky right-0 z-10 bg-card px-1 py-0.5 text-center text-xs font-semibold tabular-nums">
                  {rowTotal}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>

        <TableFooter>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell className="sticky left-0 z-10 bg-muted/30 px-2 py-0.5 text-xs font-semibold">
              Total
            </TableCell>
            {orderedMatches.map((match) => (
              <TableCell
                key={match.match_id}
                className="px-1 py-0.5 text-center text-xs font-semibold tabular-nums"
              >
                {columnTotals.get(match.match_id) ?? 0}
              </TableCell>
            ))}
            <TableCell className="sticky right-0 z-10 bg-muted/30 px-1 py-0.5 text-center text-xs font-bold tabular-nums">
              {grandTotal.toLocaleString()}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
