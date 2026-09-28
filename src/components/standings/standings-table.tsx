import { useMemo, useState } from 'react'

import { cn, getInitials } from '#/lib/utils'
import type { CompetitionStandings, StandingTeam } from '#/lib/types'
import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

const STAT_COLUMNS = [
  { key: 'P', label: 'P', title: 'Played' },
  { key: 'W', label: 'W', title: 'Won' },
  { key: 'D', label: 'D', title: 'Drawn' },
  { key: 'L', label: 'L', title: 'Lost' },
  { key: 'GF', label: 'GF', title: 'Goals for' },
  { key: 'GA', label: 'GA', title: 'Goals against' },
  { key: 'GD', label: 'GD', title: 'Goal difference' },
] as const

type StatKey = (typeof STAT_COLUMNS)[number]['key']
type PointsMode = 'with-seq' | 'match'

export default function StandingsTable({
  standings,
  showSeqPoints = false,
}: {
  standings: CompetitionStandings
  showSeqPoints?: boolean
}) {
  const [pointsMode, setPointsMode] = useState<PointsMode>('with-seq')

  const tables = useMemo(() => {
    const includeSeq = showSeqPoints && pointsMode === 'with-seq'
    const stages =
      standings.stages?.filter((stage) => stage.standings.length > 0) ?? []

    if (stages.length > 0) {
      return stages.map((stage) => ({
        key: String(stage.id),
        title: stage.name,
        rows: sortStandings(stage.standings, includeSeq),
      }))
    }

    return [
      {
        key: 'league',
        title: 'League table',
        rows: sortStandings(standings.standings ?? [], includeSeq),
      },
    ]
  }, [pointsMode, showSeqPoints, standings.stages, standings.standings])

  if (tables.every((table) => table.rows.length === 0)) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
        No standings for this selection yet.
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Standings</h1>
          <p className="text-sm text-muted-foreground">
            {standings.matches_played}{' '}
            {standings.matches_played === 1 ? 'match' : 'matches'} played
            {standings.type ? ` · ${formatType(standings.type)}` : ''}
            {showSeqPoints
              ? pointsMode === 'with-seq'
                ? ' · match + sequence points'
                : ' · match points only'
              : ''}
          </p>
        </div>

        {showSeqPoints ? (
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={pointsMode === 'with-seq' ? 'default' : 'ghost'}
              className="h-8"
              onClick={() => setPointsMode('with-seq')}
            >
              With seq points
            </Button>
            <Button
              type="button"
              size="sm"
              variant={pointsMode === 'match' ? 'default' : 'ghost'}
              className="h-8"
              onClick={() => setPointsMode('match')}
            >
              Match points
            </Button>
          </div>
        ) : null}
      </div>

      {showSeqPoints ? (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Sequence points</p>
          <p className="mt-1">
            4–6 passes +1, 7–9 passes +2, over 10 passes +1. Maximum{' '}
            <span className="tabular-nums text-foreground">4</span> sequence
            points per team.
          </p>
        </div>
      ) : null}

      {tables.map((table) => (
        <StandingsBoard
          key={table.key}
          title={tables.length > 1 ? table.title : undefined}
          rows={table.rows}
          showSeqColumn={showSeqPoints && pointsMode === 'with-seq'}
          includeSeqInPts={showSeqPoints && pointsMode === 'with-seq'}
        />
      ))}
    </div>
  )
}

function StandingsBoard({
  title,
  rows,
  showSeqColumn,
  includeSeqInPts,
}: {
  title?: string
  rows: StandingTeam[]
  showSeqColumn: boolean
  includeSeqInPts: boolean
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {title ? (
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          {title}
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Team</TableHead>
            {STAT_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                title={column.title}
                className="w-12 text-center"
              >
                {column.label}
              </TableHead>
            ))}
            {showSeqColumn ? (
              <TableHead title="Sequence points" className="w-12 text-center">
                Seq
              </TableHead>
            ) : null}
            <TableHead title="Points" className="w-12 text-center">
              Pts
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((team, index) => {
            const points = displayPoints(team, includeSeqInPts)
            return (
              <TableRow key={team.id}>
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex min-w-48 items-center gap-3">
                    <Avatar className="size-8 rounded-md">
                      {team.logo ? (
                        <AvatarImage src={team.logo} alt={team.team_name} />
                      ) : null}
                      <AvatarFallback className="rounded-md text-[10px]">
                        {getInitials(team.short_name || team.team_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {team.team_name}
                      </div>
                      {team.live ? (
                        <div className="mt-0.5 truncate text-xs text-emerald-500">
                          Live {team.live.score} vs {team.live.opponent}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                {STAT_COLUMNS.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      'text-center tabular-nums',
                      column.key === 'GD' && goalDifferenceClass(team.GD),
                    )}
                  >
                    {formatStat(team, column.key)}
                  </TableCell>
                ))}
                {showSeqColumn ? (
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {team.seq_points ?? 0}
                  </TableCell>
                ) : null}
                <TableCell className="text-center font-semibold tabular-nums">
                  {points}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function sortStandings(rows: StandingTeam[], includeSeq: boolean) {
  return [...rows].sort((a, b) => {
    const pointsDiff =
      displayPoints(b, includeSeq) - displayPoints(a, includeSeq)
    if (pointsDiff !== 0) return pointsDiff
    if (b.GD !== a.GD) return b.GD - a.GD
    if (b.GF !== a.GF) return b.GF - a.GF
    return a.team_name.localeCompare(b.team_name)
  })
}

function displayPoints(team: StandingTeam, includeSeq: boolean) {
  if (includeSeq) return team.Pts
  return team.Pts - (team.seq_points ?? 0)
}

function formatStat(team: StandingTeam, key: StatKey) {
  const value = team[key]
  if (key === 'GD' && value > 0) return `+${value}`
  return value
}

function goalDifferenceClass(value: number) {
  if (value > 0) return 'text-emerald-500'
  if (value < 0) return 'text-rose-500'
  return undefined
}

function formatType(type: string) {
  if (!type) return ''
  return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}
