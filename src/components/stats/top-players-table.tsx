import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '#/lib/utils'
import { Input } from '#/components/ui/input'
import { StatsPreview } from '#/components/stats/stats-preview'
import { SPORT_CATEGORIES } from '#/components/stats/stats-columns'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import type { TopPlayerRow } from '#/components/stats/transform-top-player-stats'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export type PlayerPanelView =
  'overall' | 'attacking' | 'defensive' | 'goalkeeping'

export type StatMode = 'stats' | 'total-p90' | 'complete-p90'

const statModes = [
  { value: 'stats', label: 'Stats' },
  { value: 'total-p90', label: 'Total P90' },
  { value: 'complete-p90', label: 'Complete P90' },
] as const

interface TopPlayersTableProps {
  rows: TopPlayerRow[]
  panelView?: PlayerPanelView
  matchType?: string
  statMode: StatMode
  onStatModeChange: (mode: StatMode) => void
}

const FOOTBALL_CATEGORY: Record<PlayerPanelView, string> = {
  overall: 'Overall',
  attacking: 'Attacking',
  defensive: 'Defense',
  goalkeeping: 'Goalkeeping',
}

const RUGBY_CATEGORY: Record<Exclude<PlayerPanelView, 'goalkeeping'>, string> = {
  overall: 'Overall',
  attacking: 'Attacking',
  defensive: 'Defense',
}

function isRugby(matchType: string) {
  return matchType.toLowerCase().includes('rugby')
}

function isFootball(matchType: string) {
  return matchType.toLowerCase().includes('football')
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function formatRating(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return value.toFixed(2)
}

function columnValue(row: TopPlayerRow, key: string) {
  if (key === 'matchesPlayed') return row.matchesPlayed
  if (key === 'minutesPlayed') return row.minutesPlayed
  if (key === 'cleanSheets') return row.cleanSheets
  if (key === 'rating') return formatRating(row.rating)
  if (key === 'attRating') return formatRating(row.attRating)
  if (key === 'defRating') return formatRating(row.defRating)
  if (key === 'gkRating') return formatRating(row.gkRating)
  if (key === 'pointsScored') return row.pointsScored ?? '—'
  if (key === 'offside') return row.values.offsides ?? '—'
  return row.values[key] ?? '—'
}

export function TopPlayersTable({
  rows,
  panelView = 'overall',
  matchType = 'football',
  statMode,
  onStatModeChange,
}: TopPlayersTableProps) {
  const [query, setQuery] = useState('')
  const [previewId, setPreviewId] = useState<number | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false })
  const rugby = isRugby(matchType)
  const football = isFootball(matchType)
  const rugbyView = panelView === 'goalkeeping' ? 'overall' : panelView
  const columns = rugby
    ? (SPORT_CATEGORIES.rugby[RUGBY_CATEGORY[rugbyView]] ??
      SPORT_CATEGORIES.rugby.Overall)
    : (SPORT_CATEGORIES.football[FOOTBALL_CATEGORY[panelView]] ??
      SPORT_CATEGORIES.football.Overall)

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return rows
    return rows.filter((row) => {
      const name = row.name.toLowerCase()
      const team = row.teamName.toLowerCase()
      return name.includes(needle) || team.includes(needle)
    })
  }, [rows, query])

  const preview =
    visibleRows.find((row) => row.id === previewId) ??
    rows.find((row) => row.id === previewId) ??
    null

  useEffect(() => {
    const frame = frameRef.current
    const scroller =
      frame?.closest<HTMLElement>('[data-stats-scroll]') ??
      frame?.querySelector<HTMLElement>('[data-slot=table-container]')
    if (!scroller) return

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth
      setScrollEdges({
        left: scroller.scrollLeft > 4,
        right: max - scroller.scrollLeft > 4,
      })
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [columns, visibleRows.length])

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No player stats available.
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search players"
          aria-label="Search players"
          className="w-full sm:w-[220px]"
        />

        {football ? (
          <div
            className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted p-1"
            role="tablist"
            aria-label="Stat calculation"
          >
            {statModes.map((mode) => {
              const selected = statMode === mode.value
              return (
                <button
                  key={mode.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onStatModeChange(mode.value)}
                  className={cn(
                    'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors',
                    selected
                      ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {mode.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div
        ref={frameRef}
        className="relative min-w-0 rounded-lg border border-border bg-card [&_[data-slot=table-container]]:overflow-visible!"
      >
        <Table className="w-max min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="sticky top-0 left-0 z-30 w-[9rem] max-w-[9rem] min-w-[9rem] border-b border-border bg-muted px-2 shadow-[8px_0_12px_-10px] shadow-black/40 sm:w-[11rem] sm:max-w-[11rem] sm:min-w-[11rem]">
                Player
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className="sticky top-0 z-20 min-w-[4.5rem] border-b border-border bg-muted px-2 text-center text-xs leading-tight whitespace-normal"
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No players match your search.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="sticky left-0 z-10 w-[9rem] max-w-[9rem] min-w-[9rem] bg-card px-2 shadow-[8px_0_12px_-10px] shadow-black/40 sm:w-[11rem] sm:max-w-[11rem] sm:min-w-[11rem]">
                    <div className="flex items-center gap-1.5">
                      <Avatar size="sm">
                        <AvatarImage src={row.photo} alt={row.name} />
                        <AvatarFallback>{initials(row.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewId(row.id)}
                            className="min-w-0 truncate text-left font-medium text-foreground hover:underline"
                          >
                            {row.name}
                          </button>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                            #{row.jerseyNumber}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {row.teamName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className="px-2 text-center whitespace-nowrap tabular-nums"
                    >
                      {columnValue(row, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {scrollEdges.left ? (
          <div className="pointer-events-none absolute inset-y-0 left-[9rem] z-10 w-6 bg-gradient-to-r from-card to-transparent sm:left-[11rem]" />
        ) : null}
        {scrollEdges.right ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent" />
        ) : null}
      </div>
      <StatsPreview
        player={preview}
        open={preview != null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null)
        }}
      />
    </div>
  )
}
