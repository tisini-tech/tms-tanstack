import { useMemo, useState } from 'react'

import type { FixturePlayerStats } from '#/lib/types'
import { cn } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  detectSport,
  SPORT_CATEGORIES,
  toPlayerStatRows,
  type SportKind,
} from '#/components/stats/transform-fixture-player-stats'

interface PlayerStatsTableProps {
  players: FixturePlayerStats[]
  /** Override auto-detected sport from match type */
  sport?: SportKind
  matchType?: string | null
}

function ratingClass(rating: number) {
  if (rating >= 7) {
    return 'bg-win/15 text-win'
  }
  if (rating >= 6) {
    return 'bg-primary/10 text-primary'
  }
  return 'bg-destructive/10 text-destructive'
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function PlayerStatsTable({
  players,
  sport: sportProp,
  matchType,
}: PlayerStatsTableProps) {
  const sport = sportProp ?? detectSport(matchType)
  const categories = SPORT_CATEGORIES[sport]
  const categoryNames = Object.keys(categories)
  const [activeCategory, setActiveCategory] = useState(
    categoryNames[0] ?? 'Attacking',
  )

  const rows = useMemo(() => toPlayerStatRows(players, sport), [players, sport])
  const columns =
    categories[activeCategory] ?? categories[categoryNames[0]!] ?? []

  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        No player stats for this fixture.
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto">
        <div className="flex w-max gap-2 pb-1">
          {categoryNames.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="sticky left-0 z-20 min-w-[220px] bg-muted/40">
                  Player
                </TableHead>
                <TableHead className="min-w-[70px] text-center">Rating</TableHead>
                <TableHead className="min-w-[60px] text-center">Mins</TableHead>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className="min-w-[72px] text-center"
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="sticky left-0 z-10 bg-card">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarImage src={player.photo} alt={player.name} />
                        <AvatarFallback>{initials(player.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-foreground">
                            {player.name}
                          </span>
                          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                            #{player.jerseyNumber}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {player.teamName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'inline-flex size-7 items-center justify-center rounded-full text-xs font-bold',
                        ratingClass(player.rating),
                      )}
                    >
                      {player.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">
                    {player.minutesPlayed}
                  </TableCell>
                  {columns.map((column) => {
                    const value = player.values[column.key] ?? 0
                    const isRatio =
                      typeof value === 'string' && value.includes('%')

                    return (
                      <TableCell
                        key={column.key}
                        className={cn(
                          'text-center tabular-nums',
                          isRatio && 'font-medium text-primary',
                        )}
                      >
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full bg-win/30" />
          <span>Rating ≥ 7.0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full bg-primary/30" />
          <span>Rating 6.0–6.9</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full bg-destructive/30" />
          <span>Rating &lt; 6.0</span>
        </div>
      </div>
    </div>
  )
}
