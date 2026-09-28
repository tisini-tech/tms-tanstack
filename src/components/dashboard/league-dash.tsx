import type {
  LeagueDashboard,
  LeagueDashboardEvent,
  LeagueDashboardSequence,
  LeagueDashboardSubEvent,
  SimpleLeagueDashboardTeam,
} from '#/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

const SHOT = 238
const FOUL = 11
const THROW_IN = 12
const FOUL_THROW_SUB = 521
const ON_TARGET_SUB_IDS = new Set([606, 610, 422, 405])

type SequenceKey = keyof LeagueDashboardSequence

const sequenceRows: { label: string; key: SequenceKey }[] = [
  { label: 'Below 3', key: 'below3' },
  { label: 'Btn 4-6', key: 'btwn4to6' },
  { label: 'Btn 7-9', key: 'btwn7to9' },
  { label: 'Over 10', key: 'over10' },
  { label: 'Total', key: 'total' },
  { label: 'Average', key: 'average' },
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

export default function LeagueDashboardTable({
  dashboard,
}: {
  dashboard: LeagueDashboard
}) {
  const teams = dashboard.teams
  const hasSequences = teams.some((team) => team.sequences != null)

  if (teams.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        No team data for this league yet.
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Sub-event</TableHead>
            {teams.map((team) => (
              <TableHead key={team.team_id} className="text-center">
                <span className="block font-medium">{team.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {team.games} {team.games === 1 ? 'game' : 'games'}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasSequences
            ? sequenceRows.map((row, index) => (
                <TableRow
                  key={row.key}
                  className={
                    row.key === 'total' || row.key === 'average'
                      ? 'bg-muted/40 font-medium'
                      : undefined
                  }
                >
                  {index === 0 ? (
                    <TableCell
                      rowSpan={sequenceRows.length}
                      className="font-medium"
                    >
                      Sequences
                    </TableCell>
                  ) : null}
                  <TableCell>{row.label}</TableCell>
                  {teams.map((team) => (
                    <TableCell
                      key={team.team_id}
                      className="text-center tabular-nums"
                    >
                      {formatNumber(
                        team.sequences?.[row.key] ?? 0,
                        row.key === 'average',
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}

          {otherEvents(dashboard.events).map((event, eventIndex) => {
            const subs = event.sub_events
            return (
              <EventBlock
                key={event.event_id}
                eventName={event.event_name}
                teams={teams}
                rows={
                  subs.length > 0
                    ? [
                        ...subs.map((sub) => ({
                          label: sub.sub_event_name,
                          cells: countCells(teams, sub.teams),
                        })),
                        {
                          label: 'Total',
                          cells: countCells(teams, event.teams),
                          summary: true,
                        },
                      ]
                    : [{ label: '', cells: countCells(teams, event.teams) }]
                }
                leadingSpacer={eventIndex > 0 || hasSequences}
              />
            )
          })}

          {shotEvent(dashboard.events) ? (
            <EventBlock
              eventName="Shot"
              teams={teams}
              rows={shotRows(teams, shotEvent(dashboard.events)!)}
              leadingSpacer
            />
          ) : null}

          <EventBlock
            eventName="Fouls committed"
            teams={teams}
            rows={[
              {
                label: '',
                cells: countCells(
                  teams,
                  foulEvent(dashboard.events)?.teams ?? [],
                ),
              },
            ]}
            leadingSpacer
          />
          <EventBlock
            eventName="Foul throw-in"
            teams={teams}
            rows={[
              {
                label: '',
                cells: countCells(teams, foulThrowTeams(dashboard.events)),
              },
            ]}
            leadingSpacer
          />
        </TableBody>
      </Table>
    </div>
  )
}

function EventBlock({
  eventName,
  teams,
  rows,
  leadingSpacer,
}: {
  eventName: string
  teams: LeagueDashboard['teams']
  rows: {
    label: string
    cells: string[]
    summary?: boolean
  }[]
  leadingSpacer: boolean
}) {
  return (
    <>
      {leadingSpacer ? <Spacer columns={teams.length} /> : null}
      {rows.map((row, index) => (
        <TableRow
          key={`${eventName}-${row.label || 'value'}`}
          className={row.summary ? 'bg-muted/40 font-medium' : undefined}
        >
          {index === 0 ? (
            <TableCell rowSpan={rows.length} className="font-medium">
              {eventName}
            </TableCell>
          ) : null}
          <TableCell>{row.label}</TableCell>
          {teams.map((team, teamIndex) => (
            <TableCell
              key={team.team_id}
              className="text-center tabular-nums"
            >
              {row.cells[teamIndex]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function Spacer({ columns }: { columns: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns + 2} className="h-4 border-0 p-0" />
    </TableRow>
  )
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

function shotRows(
  teams: LeagueDashboard['teams'],
  event: LeagueDashboardEvent,
) {
  const onTarget = teams.map((team) =>
    event.sub_events
      .filter(isOnTarget)
      .reduce((sum, sub) => sum + totalFor(sub.teams, team.team_id), 0),
  )
  const totals = teams.map((team) => totalFor(event.teams, team.team_id))

  return [
    { label: 'On target', cells: onTarget.map(String) },
    { label: 'Total', cells: totals.map(String) },
    {
      label: 'Percent',
      summary: true,
      cells: totals.map(
        (total, index) => `${percent(total, onTarget[index] ?? 0)}%`,
      ),
    },
  ]
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

function countCells(
  teams: LeagueDashboard['teams'],
  values: SimpleLeagueDashboardTeam[],
) {
  return teams.map((team) => String(totalFor(values, team.team_id)))
}

function totalFor(values: SimpleLeagueDashboardTeam[], teamId: number) {
  return values.find((entry) => entry.team_id === teamId)?.total ?? 0
}

function percent(total: number, part: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function formatNumber(value: number, decimal: boolean) {
  if (!decimal) return Math.round(value)
  return Math.round(value * 10) / 10
}
