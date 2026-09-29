import { useMemo, useState } from 'react'
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react'

import type {
  LeagueDashboard,
  LeagueDashboardEvent,
  LeagueDashboardSubEvent,
  SimpleLeagueDashboardTeam,
} from '#/lib/types'
import { cn } from '#/lib/utils'

const SHOT = 238
const FOUL = 11
const THROW_IN = 12
const FOUL_THROW_SUB = 521
const ON_TARGET_SUB_IDS = new Set([606, 610, 422, 405])

const SEQ_SEGMENTS = [
  {
    key: 'below3' as const,
    label: 'Below 3',
    className: 'bg-slate-400 dark:bg-slate-500',
  },
  {
    key: 'btwn4to6' as const,
    label: '4–6',
    className: 'bg-sky-500',
  },
  {
    key: 'btwn7to9' as const,
    label: '7–9',
    className: 'bg-violet-500',
  },
  {
    key: 'over10' as const,
    label: 'Over 10',
    className: 'bg-amber-500',
  },
]

export type LeagueReportCell = {
  title?: string
  total: number
  stat?: number
  percent?: number
  below3?: number
  btwn4to6?: number
  btwn7to9?: number
  over10?: number
  average?: number
}

export function buildLeagueReport(dashboard: LeagueDashboard) {
  const teams = dashboard.teams
  const teamNames = teams.map((team) => team.name)
  const teamGamesCount: Record<string, number> = {}
  const tableData: Record<string, Record<string, LeagueReportCell>> = {}

  for (const team of teams) {
    teamGamesCount[team.name] = team.games
  }

  if (teams.some((team) => team.sequences != null)) {
    const sequences: Record<string, LeagueReportCell> = {}
    for (const team of teams) {
      const sequence = team.sequences
      sequences[team.name] = {
        below3: sequence?.below3 ?? 0,
        btwn4to6: sequence?.btwn4to6 ?? 0,
        btwn7to9: sequence?.btwn7to9 ?? 0,
        over10: sequence?.over10 ?? 0,
        total: sequence?.total ?? 0,
        average: sequence?.average ?? 0,
      }
    }
    tableData.Sequences = sequences
  }

  for (const event of otherEvents(dashboard.events)) {
    if (event.sub_events.length === 0) {
      tableData[event.event_name] = countRow(teams, event.teams)
      continue
    }

    for (const sub of event.sub_events) {
      tableData[`${event.event_name} — ${sub.sub_event_name}`] = countRow(
        teams,
        sub.teams,
      )
    }
    tableData[`${event.event_name} — Total`] = countRow(teams, event.teams)
  }

  const shot = shotEvent(dashboard.events)
  if (shot) {
    const shotRow: Record<string, LeagueReportCell> = {}
    for (const team of teams) {
      const onTarget = shot.sub_events
        .filter(isOnTarget)
        .reduce((sum, sub) => sum + totalFor(sub.teams, team.team_id), 0)
      const total = totalFor(shot.teams, team.team_id)
      shotRow[team.name] = {
        title: 'On target',
        stat: onTarget,
        total,
        percent: percent(total, onTarget),
      }
    }
    tableData.Shot = shotRow
  }

  tableData['Fouls committed'] = countRow(
    teams,
    foulEvent(dashboard.events)?.teams ?? [],
  )
  tableData['Foul throw-in'] = countRow(teams, foulThrowTeams(dashboard.events))

  return {
    tableData,
    teamNames,
    teamGamesCount,
    numberOfTeams: teams.length,
    gamesPlayed: teams.reduce(
      (highest, team) => Math.max(highest, team.games),
      0,
    ),
  }
}

function countRow(
  teams: LeagueDashboard['teams'],
  values: SimpleLeagueDashboardTeam[],
) {
  const row: Record<string, LeagueReportCell> = {}
  for (const team of teams) {
    row[team.name] = { total: totalFor(values, team.team_id) }
  }
  return row
}

type TeamRow = {
  id: number
  name: string
  games: number
  below3: number
  btwn4to6: number
  btwn7to9: number
  over10: number
  seqTotal: number
  seqAverage: number
  seqPoints: number
  shotOn: number
  shotTotal: number
  fouls: number
  foulThrows: number
}

type SortKey =
  | 'name'
  | 'games'
  | 'below3'
  | 'btwn4to6'
  | 'btwn7to9'
  | 'over10'
  | 'seqAverage'
  | 'seqPoints'
  | 'shotPct'
  | 'fouls'
  | 'foulThrows'

type SortDir = 'asc' | 'desc'

const BOARD_COLS =
  'grid-cols-[minmax(8.5rem,1.45fr)_minmax(2.4rem,0.4fr)_repeat(4,minmax(2.5rem,0.5fr))_minmax(5.5rem,0.85fr)_minmax(3.5rem,0.65fr)_minmax(6rem,0.95fr)_minmax(3.25rem,0.6fr)_minmax(3.25rem,0.6fr)]'

const STICKY_TEAM =
  'sticky left-0 z-[1] pr-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.35)]'

export type LeagueDashboardTableProps = {
  dashboard: LeagueDashboard
  seqPointsByTeamId?: Record<number, number>
}

export default function LeagueDashboardTable({
  dashboard,
  seqPointsByTeamId = {},
}: LeagueDashboardTableProps) {
  const baseRows = useMemo(
    () => buildTeamRows(dashboard, seqPointsByTeamId),
    [dashboard, seqPointsByTeamId],
  )
  const [sortKey, setSortKey] = useState<SortKey>('seqAverage')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const rows = useMemo(
    () => sortTeamRows(baseRows, sortKey, sortDir),
    [baseRows, sortKey, sortDir],
  )

  const leagueRow = useMemo(() => leagueAggregate(baseRows), [baseRows])
  const selected = rows.find((row) => row.id === selectedId) ?? null
  const focus = selected ?? leagueRow
  const isLeague = selected == null

  if (baseRows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        No team data for this league yet.
      </div>
    )
  }

  const teamCount = baseRows.length
  const seqTotal = baseRows.reduce((sum, row) => sum + row.seqTotal, 0)
  const seqAverage =
    baseRows.reduce((sum, row) => sum + row.seqAverage, 0) / teamCount
  const shotOn = baseRows.reduce((sum, row) => sum + row.shotOn, 0)
  const shotTotal = baseRows.reduce((sum, row) => sum + row.shotTotal, 0)
  const fouls = baseRows.reduce((sum, row) => sum + row.fouls, 0)
  const seqPointsTotal = baseRows.reduce((sum, row) => sum + row.seqPoints, 0)
  const gamesPlayed = Math.max(...baseRows.map((row) => row.games), 0)
  const averages = averageRow(baseRows)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'name' ? 'asc' : 'desc')
  }

  function selectTeam(id: number) {
    setSelectedId((current) => (current === id ? null : id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="grid shrink-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Teams"
          value={String(teamCount)}
          hint={`${gamesPlayed} games (max)`}
        />
        <KpiCard
          label="Seq. average"
          value={formatNumber(seqAverage, true)}
          hint={`${seqTotal} sequences`}
        />
        <KpiCard
          label="Seq. points"
          value={String(seqPointsTotal)}
          hint={`avg ${formatNumber(seqPointsTotal / teamCount, true)} / team`}
        />
        <KpiCard
          label="Shot on target"
          value={`${percent(shotTotal, shotOn)}%`}
          hint={`${shotOn}/${shotTotal}`}
        />
        <KpiCard
          label="Fouls"
          value={String(fouls)}
          hint={`avg ${Math.round(fouls / teamCount)} / team`}
        />
      </div>

      <section className="shrink-0 rounded-xl border border-border bg-card p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              {isLeague ? 'League overview' : focus.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isLeague
                ? 'Totals across all teams — select a row below to filter'
                : 'Filtered to this team — click again or League to clear'}
            </p>
          </div>
          {!isLeague ? (
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Show league
            </button>
          ) : null}
        </div>
        <OverviewPanel row={focus} isLeague={isLeague} teamCount={teamCount} />
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card p-4">
        <div className="mb-3 shrink-0">
          <h2 className="text-sm font-semibold tracking-tight">Team board</h2>
          <p className="text-xs text-muted-foreground">
            Compare every team — click a row to filter the overview, or a column
            to sort
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[52rem]">
            <div
              className={cn(
                'sticky top-0 z-10 grid gap-2 border-b border-border bg-card px-2 py-2 text-[10px] tracking-wide text-muted-foreground uppercase',
                BOARD_COLS,
              )}
            >
              <div className={cn(STICKY_TEAM, '-ml-2 bg-card pl-2')}>
                <SortHeader
                  label="Team"
                  sortKey="name"
                  activeKey={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="left"
                />
              </div>
              <SortHeader
                label="G"
                sortKey="games"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Below 3"
                sortKey="below3"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="4–6"
                sortKey="btwn4to6"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="7–9"
                sortKey="btwn7to9"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="10+"
                sortKey="over10"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Seq"
                sortKey="seqAverage"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Seq pts"
                sortKey="seqPoints"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Attempts"
                sortKey="shotPct"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Fouls"
                sortKey="fouls"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortHeader
                label="Throw-in"
                sortKey="foulThrows"
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
            </div>

            {rows.map((row, index) => {
              const shotPct = percent(row.shotTotal, row.shotOn)
              const selected = row.id === selectedId
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => selectTeam(row.id)}
                  className={cn(
                    'grid w-full items-center gap-2 px-2 py-2 text-left transition-colors',
                    BOARD_COLS,
                    index % 2 === 1 && 'bg-muted',
                    'hover:bg-muted/70',
                    selected && 'bg-muted/80 ring-1 ring-border',
                  )}
                >
                  <div
                    className={cn(
                      'truncate text-sm font-medium',
                      STICKY_TEAM,
                      '-ml-2 pl-2',
                      selected
                        ? 'bg-muted'
                        : index % 2 === 1
                          ? 'bg-muted'
                          : 'bg-card',
                    )}
                  >
                    {row.name}
                  </div>
                  <div className="text-center text-sm tabular-nums text-muted-foreground">
                    {row.games}
                  </div>
                  <div className="text-center text-sm tabular-nums">
                    {row.below3}
                  </div>
                  <div className="text-center text-sm tabular-nums">
                    {row.btwn4to6}
                  </div>
                  <div className="text-center text-sm tabular-nums">
                    {row.btwn7to9}
                  </div>
                  <div className="text-center text-sm tabular-nums">
                    {row.over10}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold tabular-nums">
                      {row.seqTotal} tot
                    </div>
                    <div className="text-[11px] tabular-nums text-muted-foreground">
                      avg {formatNumber(row.seqAverage, true)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold tabular-nums">
                      {row.seqPoints}
                    </div>
                    <div className="text-[11px] tabular-nums text-muted-foreground">
                      avg{' '}
                      {formatNumber(
                        row.games > 0 ? row.seqPoints / row.games : 0,
                        true,
                      )}
                    </div>
                  </div>
                  <div className="text-center text-sm tabular-nums">
                    {row.shotOn}/{row.shotTotal}{' '}
                    <span className="text-muted-foreground">({shotPct}%)</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold tabular-nums">
                      {row.fouls}
                    </div>
                    <div className="text-[11px] tabular-nums text-muted-foreground">
                      avg{' '}
                      {formatNumber(
                        row.games > 0 ? row.fouls / row.games : 0,
                        true,
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold tabular-nums">
                      {row.foulThrows}
                    </div>
                    <div className="text-[11px] tabular-nums text-muted-foreground">
                      avg{' '}
                      {formatNumber(
                        row.games > 0 ? row.foulThrows / row.games : 0,
                        true,
                      )}
                    </div>
                  </div>
                </button>
              )
            })}

            <div
              className={cn(
                'sticky bottom-0 z-[2] grid items-center gap-2 border-t border-border bg-muted px-2 py-2.5',
                BOARD_COLS,
              )}
            >
              <div
                className={cn(
                  'text-sm font-semibold tracking-tight',
                  STICKY_TEAM,
                  'z-[3] -ml-2 bg-muted pl-2',
                )}
              >
                Avg
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.games, true)}
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.below3, true)}
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.btwn4to6, true)}
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.btwn7to9, true)}
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.over10, true)}
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold tabular-nums">
                  {formatNumber(averages.seqTotal, true)} tot
                </div>
                <div className="text-[11px] tabular-nums text-muted-foreground">
                  avg {formatNumber(averages.seqAverage, true)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold tabular-nums">
                  {formatNumber(averages.seqPoints, true)}
                </div>
                <div className="text-[11px] tabular-nums text-muted-foreground">
                  avg {formatNumber(averages.seqPointsPerGame, true)}
                </div>
              </div>
              <div className="text-center text-sm font-semibold tabular-nums">
                {formatNumber(averages.shotOn, true)}/
                {formatNumber(averages.shotTotal, true)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({percent(averages.shotTotal, averages.shotOn)}%)
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold tabular-nums">
                  {formatNumber(averages.fouls, true)}
                </div>
                <div className="text-[11px] tabular-nums text-muted-foreground">
                  avg {formatNumber(averages.foulsPerGame, true)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold tabular-nums">
                  {formatNumber(averages.foulThrows, true)}
                </div>
                <div className="text-[11px] tabular-nums text-muted-foreground">
                  avg {formatNumber(averages.foulThrowsPerGame, true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function OverviewPanel({
  row,
  isLeague,
  teamCount,
}: {
  row: TeamRow
  isLeague: boolean
  teamCount: number
}) {
  const shotPct = percent(row.shotTotal, row.shotOn)
  const seqMax = Math.max(
    row.below3,
    row.btwn4to6,
    row.btwn7to9,
    row.over10,
    1,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            Sequence mix
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            {row.seqTotal} sequences · avg {formatNumber(row.seqAverage, true)}{' '}
            · seq pts{' '}
            <span className="font-medium text-foreground">
              {isLeague ? formatNumber(row.seqPoints, true) : row.seqPoints}
            </span>
          </div>
        </div>
        <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
          {SEQ_SEGMENTS.map((segment) => {
            const value = row[segment.key]
            const width = (value / seqMax) * 100
            return (
              <div
                key={segment.key}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-3"
              >
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-sm',
                      segment.className,
                    )}
                  />
                  {segment.label}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', segment.className)}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="text-right text-sm font-semibold tabular-nums">
                  {value}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
          <OnTargetBar
            label="Attempts"
            onTarget={row.shotOn}
            total={row.shotTotal}
            pct={shotPct}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatTile
            label="Seq points"
            value={
              isLeague ? formatNumber(row.seqPoints, true) : row.seqPoints
            }
            hint={
              isLeague
                ? `avg ${formatNumber(row.seqPoints / Math.max(teamCount, 1), true)} / team`
                : `avg ${formatNumber(row.games > 0 ? row.seqPoints / row.games : 0, true)} / game`
            }
          />
          <StatTile
            label="Fouls committed"
            value={row.fouls}
            hint={
              isLeague
                ? `avg ${Math.round(row.fouls / Math.max(teamCount, 1))} / team`
                : `avg ${formatNumber(row.games > 0 ? row.fouls / row.games : 0, true)} / game`
            }
          />
          <StatTile
            label="Foul throw-in"
            value={row.foulThrows}
            hint={
              isLeague
                ? `avg ${Math.round(row.foulThrows / Math.max(teamCount, 1))} / team`
                : `avg ${formatNumber(row.games > 0 ? row.foulThrows / row.games : 0, true)} / game`
            }
          />
        </div>
      </div>
    </div>
  )
}

function OnTargetBar({
  label,
  onTarget,
  total,
  pct,
}: {
  label: string
  onTarget: number
  total: number
  pct: number
}) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-xs tabular-nums text-muted-foreground">
          <span className="font-medium text-foreground">
            {onTarget}/{total}
          </span>{' '}
          · {pct}% on target
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint: string
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'center',
}: {
  label: string
  sortKey: SortKey
  activeKey: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
  align?: 'left' | 'center'
}) {
  const active = activeKey === sortKey
  const Icon = !active
    ? ArrowUpDownIcon
    : dir === 'asc'
      ? ArrowUpIcon
      : ArrowDownIcon

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm hover:text-foreground',
        align === 'center' ? 'justify-center' : 'justify-start',
        active && 'text-foreground',
      )}
    >
      <span>{label}</span>
      <Icon className="size-3 shrink-0 opacity-70" />
    </button>
  )
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  )
}

function leagueAggregate(rows: TeamRow[]): TeamRow {
  const n = rows.length || 1
  return {
    id: -1,
    name: 'League',
    games: Math.max(...rows.map((row) => row.games), 0),
    below3: rows.reduce((sum, row) => sum + row.below3, 0),
    btwn4to6: rows.reduce((sum, row) => sum + row.btwn4to6, 0),
    btwn7to9: rows.reduce((sum, row) => sum + row.btwn7to9, 0),
    over10: rows.reduce((sum, row) => sum + row.over10, 0),
    seqTotal: rows.reduce((sum, row) => sum + row.seqTotal, 0),
    seqAverage: rows.reduce((sum, row) => sum + row.seqAverage, 0) / n,
    seqPoints: rows.reduce((sum, row) => sum + row.seqPoints, 0),
    shotOn: rows.reduce((sum, row) => sum + row.shotOn, 0),
    shotTotal: rows.reduce((sum, row) => sum + row.shotTotal, 0),
    fouls: rows.reduce((sum, row) => sum + row.fouls, 0),
    foulThrows: rows.reduce((sum, row) => sum + row.foulThrows, 0),
  }
}

function buildTeamRows(
  dashboard: LeagueDashboard,
  seqPointsByTeamId: Record<number, number>,
): TeamRow[] {
  const shot = shotEvent(dashboard.events)
  const fouls = foulEvent(dashboard.events)?.teams ?? []
  const foulThrows = foulThrowTeams(dashboard.events)

  return dashboard.teams.map((team) => {
    const shotOn = shot
      ? shot.sub_events
          .filter(isOnTarget)
          .reduce((sum, sub) => sum + totalFor(sub.teams, team.team_id), 0)
      : 0
    const shotTotal = shot ? totalFor(shot.teams, team.team_id) : 0

    return {
      id: team.team_id,
      name: team.name,
      games: team.games,
      below3: team.sequences?.below3 ?? 0,
      btwn4to6: team.sequences?.btwn4to6 ?? 0,
      btwn7to9: team.sequences?.btwn7to9 ?? 0,
      over10: team.sequences?.over10 ?? 0,
      seqTotal: team.sequences?.total ?? 0,
      seqAverage: team.sequences?.average ?? 0,
      seqPoints: seqPointsByTeamId[team.team_id] ?? 0,
      shotOn,
      shotTotal,
      fouls: totalFor(fouls, team.team_id),
      foulThrows: totalFor(foulThrows, team.team_id),
    }
  })
}

function sortTeamRows(rows: TeamRow[], key: SortKey, dir: SortDir) {
  const factor = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = sortValue(a, key)
    const right = sortValue(b, key)
    if (typeof left === 'string' && typeof right === 'string') {
      return left.localeCompare(right) * factor
    }
    if (left !== right) return ((left as number) - (right as number)) * factor
    return a.name.localeCompare(b.name)
  })
}

function sortValue(row: TeamRow, key: SortKey): number | string {
  if (key === 'shotPct') return percent(row.shotTotal, row.shotOn)
  if (key === 'name') return row.name
  return row[key]
}

function averageRow(rows: TeamRow[]) {
  const n = rows.length || 1
  const sum = (pick: (row: TeamRow) => number) =>
    rows.reduce((total, row) => total + pick(row), 0) / n

  return {
    games: sum((row) => row.games),
    below3: sum((row) => row.below3),
    btwn4to6: sum((row) => row.btwn4to6),
    btwn7to9: sum((row) => row.btwn7to9),
    over10: sum((row) => row.over10),
    seqTotal: sum((row) => row.seqTotal),
    seqAverage: sum((row) => row.seqAverage),
    seqPoints: sum((row) => row.seqPoints),
    seqPointsPerGame: sum((row) =>
      row.games > 0 ? row.seqPoints / row.games : 0,
    ),
    shotOn: sum((row) => row.shotOn),
    shotTotal: sum((row) => row.shotTotal),
    fouls: sum((row) => row.fouls),
    foulThrows: sum((row) => row.foulThrows),
    foulsPerGame: sum((row) =>
      row.games > 0 ? row.fouls / row.games : 0,
    ),
    foulThrowsPerGame: sum((row) =>
      row.games > 0 ? row.foulThrows / row.games : 0,
    ),
  }
}

function otherEvents(events: LeagueDashboardEvent[]) {
  return events.filter(
    (event) =>
      event.event_id !== SHOT &&
      event.event_id !== FOUL &&
      event.event_id !== THROW_IN,
  )
}

function shotEvent(events: LeagueDashboardEvent[]) {
  return events.find((event) => event.event_id === SHOT)
}

function foulEvent(events: LeagueDashboardEvent[]) {
  return events.find((event) => event.event_id === FOUL)
}

function foulThrowTeams(events: LeagueDashboardEvent[]) {
  const throwIn = events.find((event) => event.event_id === THROW_IN)
  const sub = throwIn?.sub_events.find(
    (entry) =>
      entry.sub_event_id === FOUL_THROW_SUB ||
      /foul throw/i.test(entry.sub_event_name),
  )
  return sub?.teams ?? []
}

function isOnTarget(sub: LeagueDashboardSubEvent) {
  return (
    ON_TARGET_SUB_IDS.has(sub.sub_event_id) ||
    /on target/i.test(sub.sub_event_name)
  )
}

function totalFor(values: SimpleLeagueDashboardTeam[], teamId: number) {
  return values.find((entry) => entry.team_id === teamId)?.total ?? 0
}

function percent(total: number, part: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function formatNumber(value: number, decimal: boolean) {
  if (!decimal) return String(Math.round(value))
  return String(Math.round(value * 10) / 10)
}
