import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { TopPlayerStats } from '#/lib/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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

const ALL_TEAMS = 'all'

export function TopPlayersTable({ players }: TopPlayersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [teamFilter, setTeamFilter] = useState(ALL_TEAMS)

  const teams = useMemo(() => {
    const byId = new Map<number, string>()
    for (const player of players) {
      byId.set(player.team_id, player.team_name)
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [players])

  const filteredPlayers = useMemo(() => {
    if (teamFilter === ALL_TEAMS) return players
    const teamId = Number(teamFilter)
    return players.filter((player) => player.team_id === teamId)
  }, [players, teamFilter])

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
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Select
          value={teamFilter}
          onValueChange={(value) => setTeamFilter(value ?? ALL_TEAMS)}
        >
          <SelectTrigger className="w-[220px]" aria-label="Filter by team">
            <SelectValue placeholder="All teams">
              {teamFilter === ALL_TEAMS
                ? 'All teams'
                : (teams.find((team) => String(team.id) === teamFilter)?.name ??
                  'All teams')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={ALL_TEAMS}>All teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={String(team.id)}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
            {filteredPlayers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No players for this team.
                </TableCell>
              </TableRow>
            ) : (
              filteredPlayers.map((player) => {
                const isExpanded = expandedRows.has(player.player_id)

                return (
                  <Fragment key={player.player_id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {player.name}
                      </TableCell>
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
              })
            )}
          </TableBody>
        </Table>
      </div>
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
