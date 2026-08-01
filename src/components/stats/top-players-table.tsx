import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { TopPlayerStats } from '#/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface TopPlayersTableProps {
  players: TopPlayerStats[]
}

export function TopPlayersTable({ players }: TopPlayersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (playerId: number) => {
    setExpandedRows((current) => {
      const next = new Set(current)
      if (next.has(playerId)) {
        next.delete(playerId)
      } else {
        next.add(playerId)
      }
      return next
    })
  }

  if (players.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No player stats available.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Jersey</TableHead>
            <TableHead className="text-center">Mins</TableHead>
            <TableHead className="text-center">Matches</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead className="text-right">Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const isExpanded = expandedRows.has(player.player_id)

            return (
              <Fragment key={player.player_id}>
                <TableRow>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.team_name}</TableCell>
                  <TableCell className="text-center">
                    {player.jersey_no}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.total_minutes_played}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.matches_played}
                  </TableCell>
                  <TableCell className="text-center">
                    {player.avg_rating.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => toggleRow(player.player_id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                      Stats
                    </Button>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={7} className="p-0">
                      <PlayerStatsDetail stats={player.stats} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function PlayerStatsDetail({ stats }: { stats: TopPlayerStats['stats'] }) {
  if (stats.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        No detailed stats for this player.
      </div>
    )
  }

  return (
    <div className="border-t px-4 py-3">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Event</TableHead>
            <TableHead>Sub-event</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((stat) => (
            <Fragment key={stat.event_id}>
              <TableRow>
                <TableCell className="font-medium">{stat.event_name}</TableCell>
                <TableCell className="text-muted-foreground">—</TableCell>
                <TableCell className="text-right tabular-nums">
                  {stat.total}
                </TableCell>
              </TableRow>
              {stat.sub_events.map((subEvent) => (
                <TableRow
                  key={`${stat.event_id}-${subEvent.sub_event_id}`}
                  className="bg-muted/10"
                >
                  <TableCell className="text-muted-foreground">└</TableCell>
                  <TableCell className="text-muted-foreground">
                    {subEvent.sub_event_name}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {subEvent.total}
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
