import { useMemo } from 'react'

import type {
  DashboardPlayerStats,
  PlayerAppearance,
} from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  type DashboardFilters,
  filterPlayerStats,
} from '#/components/dashboard/dashboard-filters'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip'

const EVENT_COLORS = [
  'bg-sky-300 text-sky-950',
  'bg-amber-400 text-amber-950',
  'bg-violet-300 text-violet-950',
  'bg-teal-400 text-teal-950',
  'bg-rose-300 text-rose-950',
  'bg-lime-400 text-lime-950',
  'bg-orange-300 text-orange-950',
  'bg-fuchsia-300 text-fuchsia-950',
]

type PlayersTableProps = {
  playerStats: DashboardPlayerStats[]
  appearances: PlayerAppearance[]
  filters: DashboardFilters
}

type Segment = {
  id: string
  name: string
  value: number
  color: string
}

type PlayerBar = {
  playerId: number
  name: string
  total: number
  segments: Segment[]
}

type AppearanceMeta = {
  avgRating: number | null
  totalMinutes: number
  gamesPlayed: number
}

function formatMinutes(minutes: number) {
  return `${minutes.toLocaleString()}'`
}

function formatRating(rating: number | null) {
  if (rating == null) return '—'
  return rating.toFixed(1)
}

function formatGamesPlayed(games: number) {
  return `${games.toLocaleString()} ${games === 1 ? 'game' : 'games'}`
}

function per90(count: number, minutes: number) {
  if (minutes <= 0) return null
  return (count * 90) / minutes
}

function formatPer90(value: number | null) {
  if (value == null) return '—'
  return value.toFixed(2)
}

function appearanceMetaForFilters(
  appearance: PlayerAppearance | undefined,
  matchIds: number[] | null,
): AppearanceMeta {
  if (!appearance) {
    return { avgRating: null, totalMinutes: 0, gamesPlayed: 0 }
  }

  const matches =
    matchIds == null
      ? appearance.matches
      : appearance.matches.filter((match) => matchIds.includes(match.match_id))

  if (matchIds != null) {
    const totalMinutes = matches.reduce(
      (sum, match) => sum + (match.minutes_played || 0),
      0,
    )
    const rated = matches.filter((match) => match.rating > 0)
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, match) => sum + match.rating, 0) / rated.length
        : null
    const gamesPlayed = matches.filter(
      (match) => (match.minutes_played || 0) > 0,
    ).length
    return { avgRating, totalMinutes, gamesPlayed }
  }

  const rated = appearance.matches.filter((match) => match.rating > 0)
  const avgRating =
    rated.length > 0
      ? rated.reduce((sum, match) => sum + match.rating, 0) / rated.length
      : null

  return {
    avgRating,
    totalMinutes: appearance.total_minutes || 0,
    gamesPlayed: appearance.matches_played || 0,
  }
}

function buildBars(
  playerStats: DashboardPlayerStats[],
  nameById: Map<number, string>,
  preferSubSegments: boolean,
): { rows: PlayerBar[]; legend: Segment[] } {
  const eventLegend: Segment[] = playerStats.map((event, index) => ({
    id: `event:${event.event_id}`,
    name: event.event_name,
    value: 0,
    color: EVENT_COLORS[index % EVENT_COLORS.length]!,
  }))

  const subLegendMap = new Map<string, Segment>()
  for (const event of playerStats) {
    for (const player of event.players ?? []) {
      for (const match of player.matches ?? []) {
        for (const sub of match.sub_events ?? []) {
          const id = `sub:${event.event_id}:${sub.sub_event_id}`
          if (!subLegendMap.has(id)) {
            subLegendMap.set(id, {
              id,
              name: sub.sub_event_name,
              value: 0,
              color: EVENT_COLORS[subLegendMap.size % EVENT_COLORS.length]!,
            })
          }
        }
      }
    }
  }

  const stackingBySub =
    preferSubSegments && subLegendMap.size > 0
  const activeLegend = stackingBySub ? [...subLegendMap.values()] : eventLegend
  const colorById = new Map(activeLegend.map((item) => [item.id, item.color]))

  const byPlayer = new Map<
    number,
    { name: string; segments: Map<string, number> }
  >()

  for (const event of playerStats) {
    for (const player of event.players ?? []) {
      const existing = byPlayer.get(player.player_id) ?? {
        name: nameById.get(player.player_id) ?? `Player ${player.player_id}`,
        segments: new Map<string, number>(),
      }

      if (stackingBySub) {
        for (const match of player.matches ?? []) {
          for (const sub of match.sub_events ?? []) {
            const id = `sub:${event.event_id}:${sub.sub_event_id}`
            existing.segments.set(
              id,
              (existing.segments.get(id) ?? 0) + sub.total,
            )
          }
        }
      } else {
        const eventTotal =
          player.total ||
          (player.matches ?? []).reduce((sum, match) => sum + match.total, 0)
        if (eventTotal > 0) {
          const id = `event:${event.event_id}`
          existing.segments.set(
            id,
            (existing.segments.get(id) ?? 0) + eventTotal,
          )
        }
      }

      byPlayer.set(player.player_id, existing)
    }
  }

  const rows = [...byPlayer.entries()]
    .map(([playerId, data]) => {
      const segments = activeLegend
        .map((item) => ({
          id: item.id,
          name: item.name,
          value: data.segments.get(item.id) ?? 0,
          color: colorById.get(item.id) ?? EVENT_COLORS[0]!,
        }))
        .filter((segment) => segment.value > 0)

      const total = segments.reduce((sum, segment) => sum + segment.value, 0)

      return {
        playerId,
        name: data.name,
        total,
        segments,
      }
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total)

  return { rows, legend: activeLegend }
}

export default function PlayersTable({
  playerStats,
  appearances,
  filters,
}: PlayersTableProps) {
  const nameById = useMemo(() => {
    const map = new Map<number, string>()
    for (const appearance of appearances) {
      map.set(appearance.player_id, appearance.name)
    }
    return map
  }, [appearances])

  const metaById = useMemo(() => {
    const map = new Map<number, AppearanceMeta>()
    for (const appearance of appearances) {
      map.set(
        appearance.player_id,
        appearanceMetaForFilters(appearance, filters.matchIds),
      )
    }
    return map
  }, [appearances, filters.matchIds])

  const filteredStats = useMemo(
    () => filterPlayerStats(playerStats, filters),
    [playerStats, filters],
  )

  const { rows, legend } = useMemo(
    () =>
      buildBars(
        filteredStats,
        nameById,
        filters.events.some((item) => item.subEventId != null),
      ),
    [filteredStats, nameById, filters.events],
  )

  const maxTotal = rows[0]?.total ?? 0

  if (playerStats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No player stats for the selected filters.
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No player totals for the current filters.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-heading">Totals by player</h2>
        <p className="text-xs text-muted-foreground">
          Stacked event totals for the season, sorted by volume.
        </p>
      </div>

      {legend.length > 1 ? (
        <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-2 border-b border-border px-4 py-3">
          {legend.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span
                className={cn('size-2.5 rounded-sm', item.color.split(' ')[0])}
              />
              {item.name}
            </div>
          ))}
        </div>
      ) : null}

      <TooltipProvider>
        <div className="scrollbar-thin min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {rows.map((row) => {
            const meta = metaById.get(row.playerId) ?? {
              avgRating: null,
              totalMinutes: 0,
              gamesPlayed: 0,
            }
            const metaLabel = `${formatRating(meta.avgRating)} · ${formatMinutes(meta.totalMinutes)}`

            return (
              <div
                key={row.playerId}
                className="grid grid-cols-[minmax(72px,110px)_1fr] items-center gap-2"
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-xs font-medium text-foreground"
                    title={row.name}
                  >
                    {row.name}
                  </p>
                  <p
                    className="truncate text-[10px] tabular-nums text-muted-foreground"
                    title={`Avg rating ${formatRating(meta.avgRating)} · ${formatMinutes(meta.totalMinutes)} played`}
                  >
                    {metaLabel}
                  </p>
                </div>

                <div className="flex h-6 w-full min-w-0 overflow-hidden rounded-sm">
                  {row.segments.map((segment) => {
                    const widthPct =
                      maxTotal > 0 ? (segment.value / maxTotal) * 100 : 0
                    const showLabel = widthPct >= 8 || segment.value >= 5
                    const rate = per90(segment.value, meta.totalMinutes)

                    return (
                      <Tooltip key={segment.id}>
                        <TooltipTrigger
                          render={
                            <div
                              className={cn(
                                'flex h-full items-center justify-center overflow-hidden text-[10px] font-semibold tabular-nums',
                                segment.color,
                              )}
                              style={{ width: `${widthPct}%` }}
                            />
                          }
                        >
                          {showLabel ? segment.value : null}
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="flex flex-col items-start gap-0.5 px-3 py-2 text-left"
                        >
                          <span className="font-medium">
                            {segment.name}: {segment.value.toLocaleString()}
                          </span>
                          <span className="text-background/80">
                            {formatGamesPlayed(meta.gamesPlayed)} played
                          </span>
                          <span className="tabular-nums text-background/80">
                            {formatPer90(rate)} per 90
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}
