import type {
  DashboardMatch,
  DashboardSequences,
  DashboardTeamStats,
  MatchSequence,
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

type SequenceKey = keyof Pick<
  MatchSequence,
  'below3' | 'btwn4to6' | 'btwn7to9' | 'over10' | 'total' | 'average'
>

const sequenceRows: { label: string; key: SequenceKey }[] = [
  { label: 'Below 3', key: 'below3' },
  { label: '4–6', key: 'btwn4to6' },
  { label: '7–9', key: 'btwn7to9' },
  { label: 'Over 10', key: 'over10' },
  { label: 'Total', key: 'total' },
  { label: 'Average', key: 'average' },
]

export type SimpleTeamResult = {
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

export function buildSimpleTeamReport({
  matches,
  teamStats,
  sequences,
  opponentStats,
}: {
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  sequences: DashboardSequences | null
  opponentStats: DashboardTeamStats[] | DashboardTeamStats | null
}) {
  const columns = matchColumns(matches)
  const opponents = opponentList(opponentStats)
  const sequenceByMatch = new Map(
    (sequences?.matches ?? []).map((entry) => [entry.match_id, entry]),
  )
  const tableData: Record<string, Record<string, SimpleTeamResult>> = {}

  const sequencesRow: Record<string, SimpleTeamResult> = {}
  const attemptsRow: Record<string, SimpleTeamResult> = {}
  const facedRow: Record<string, SimpleTeamResult> = {}
  const foulsRow: Record<string, SimpleTeamResult> = {}
  const throwInsRow: Record<string, SimpleTeamResult> = {}

  for (const column of columns) {
    const key = `vs ${column.label}`
    const matchId = column.match.match_id
    const sequence = sequenceByMatch.get(matchId)
    const attemptsOnTarget = subTotal(
      teamStats,
      SHOT,
      ON_TARGET_SUB_IDS,
      matchId,
    )
    const attempts = eventTotal(teamStats, SHOT, matchId)
    const facedOnTarget = subTotal(opponents, SHOT, ON_TARGET_SUB_IDS, matchId)
    const faced = eventTotal(opponents, SHOT, matchId)

    sequencesRow[key] = {
      total: sequence?.total ?? 0,
      below3: sequence?.below3 ?? 0,
      btwn4to6: sequence?.btwn4to6 ?? 0,
      btwn7to9: sequence?.btwn7to9 ?? 0,
      over10: sequence?.over10 ?? 0,
      average: sequence?.average ?? 0,
    }
    attemptsRow[key] = {
      title: 'On Target',
      stat: attemptsOnTarget,
      total: attempts,
      percent: percent(attempts, attemptsOnTarget),
    }
    facedRow[key] = {
      title: 'On Target',
      stat: facedOnTarget,
      total: faced,
      percent: percent(faced, facedOnTarget),
    }
    foulsRow[key] = { total: eventTotal(teamStats, FOUL, matchId) }
    throwInsRow[key] = {
      total: subTotal(teamStats, THROW_IN, new Set([FOUL_THROW_SUB]), matchId),
    }
  }

  tableData.Sequences = sequencesRow
  tableData.Attempts = attemptsRow
  tableData['Attempts Faced'] = facedRow
  tableData['Fouls Committed'] = foulsRow
  tableData['Foul Throwin'] = throwInsRow

  return {
    tableData,
    opponents: columns.map((column) => column.label),
    numberOfGames: columns.length,
  }
}

export default function TeamDashboardSimple({
  matches,
  teamStats,
  sequences,
  opponentStats,
}: {
  matches: DashboardMatch[]
  teamStats: DashboardTeamStats[]
  sequences: DashboardSequences | null
  opponentStats: DashboardTeamStats[] | DashboardTeamStats | null
}) {
  const opponents = opponentList(opponentStats)
  const columns = matchColumns(matches)
  const gameCount = columns.length || 1

  const sequenceByMatch = new Map(
    (sequences?.matches ?? []).map((entry) => [entry.match_id, entry]),
  )

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Sub-event</TableHead>
            {columns.map((column) => (
              <TableHead key={column.match.match_id} className="text-center">
                {`vs ${column.label}`}
              </TableHead>
            ))}
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Average</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sequenceRows.map((row, index) => {
            const values = columns.map(
              (column) =>
                sequenceByMatch.get(column.match.match_id)?.[row.key] ?? 0,
            )
            const total =
              row.key === 'average'
                ? (sequences?.average ?? 0)
                : (sequences?.[row.key] ?? sum(values))
            const average =
              row.key === 'average' ? total : Math.round(total / gameCount)

            return (
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
                {values.map((value, valueIndex) => (
                  <TableCell
                    key={columns[valueIndex]?.match.match_id}
                    className="text-center tabular-nums"
                  >
                    {formatNumber(value, row.key === 'average')}
                  </TableCell>
                ))}
                <TableCell className="text-center tabular-nums">
                  {formatNumber(total, row.key === 'average')}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {formatNumber(average, row.key === 'average')}
                </TableCell>
              </TableRow>
            )
          })}

          <Spacer columns={columns.length} />

          <RateRows
            event="Attempts"
            columns={columns}
            onTarget={(matchId) =>
              subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS, matchId)
            }
            total={(matchId) => eventTotal(teamStats, SHOT, matchId)}
            seasonOnTarget={subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS)}
            seasonTotal={eventTotal(teamStats, SHOT)}
          />

          <Spacer columns={columns.length} />

          <RateRows
            event="Attempts faced"
            columns={columns}
            onTarget={(matchId) =>
              subTotal(opponents, SHOT, ON_TARGET_SUB_IDS, matchId)
            }
            total={(matchId) => eventTotal(opponents, SHOT, matchId)}
            seasonOnTarget={subTotal(opponents, SHOT, ON_TARGET_SUB_IDS)}
            seasonTotal={eventTotal(opponents, SHOT)}
          />

          <Spacer columns={columns.length} />

          <CountRow
            event="Fouls committed"
            columns={columns}
            value={(matchId) => eventTotal(teamStats, FOUL, matchId)}
            seasonTotal={eventTotal(teamStats, FOUL)}
          />

          <Spacer columns={columns.length} />

          <CountRow
            event="Foul throw-in"
            columns={columns}
            value={(matchId) =>
              subTotal(teamStats, THROW_IN, new Set([FOUL_THROW_SUB]), matchId)
            }
            seasonTotal={subTotal(
              teamStats,
              THROW_IN,
              new Set([FOUL_THROW_SUB]),
            )}
          />
        </TableBody>
      </Table>
    </div>
  )
}

function RateRows({
  event,
  columns,
  onTarget,
  total,
  seasonOnTarget,
  seasonTotal,
}: {
  event: string
  columns: { match: DashboardMatch }[]
  onTarget: (matchId: number) => number
  total: (matchId: number) => number
  seasonOnTarget: number
  seasonTotal: number
}) {
  const onTargetValues = columns.map((column) =>
    onTarget(column.match.match_id),
  )
  const totalValues = columns.map((column) => total(column.match.match_id))
  const games = columns.length || 1
  const seasonPercent = percent(seasonTotal, seasonOnTarget)

  return (
    <>
      <TableRow>
        <TableCell rowSpan={3} className="font-medium">
          {event}
        </TableCell>
        <TableCell>On target</TableCell>
        {onTargetValues.map((value, index) => (
          <TableCell
            key={columns[index]?.match.match_id}
            className="text-center tabular-nums"
          >
            {value}
          </TableCell>
        ))}
        <TableCell className="text-center tabular-nums">
          {seasonOnTarget}
        </TableCell>
        <TableCell className="text-center tabular-nums">
          {Math.round(seasonOnTarget / games)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Total</TableCell>
        {totalValues.map((value, index) => (
          <TableCell
            key={columns[index]?.match.match_id}
            className="text-center tabular-nums"
          >
            {value}
          </TableCell>
        ))}
        <TableCell className="text-center tabular-nums">
          {seasonTotal}
        </TableCell>
        <TableCell className="text-center tabular-nums">
          {Math.round(seasonTotal / games)}
        </TableCell>
      </TableRow>
      <TableRow className="bg-muted/40 font-medium">
        <TableCell>Percent</TableCell>
        {columns.map((column, index) => (
          <TableCell
            key={column.match.match_id}
            className="text-center tabular-nums"
          >
            {percent(totalValues[index] ?? 0, onTargetValues[index] ?? 0)}%
          </TableCell>
        ))}
        <TableCell className="text-center tabular-nums">
          {seasonPercent}%
        </TableCell>
        <TableCell className="text-center tabular-nums">
          {seasonPercent}%
        </TableCell>
      </TableRow>
    </>
  )
}

function CountRow({
  event,
  columns,
  value,
  seasonTotal,
}: {
  event: string
  columns: { match: DashboardMatch }[]
  value: (matchId: number) => number
  seasonTotal: number
}) {
  const games = columns.length || 1

  return (
    <TableRow>
      <TableCell className="font-medium">{event}</TableCell>
      <TableCell />
      {columns.map((column) => (
        <TableCell
          key={column.match.match_id}
          className="text-center tabular-nums"
        >
          {value(column.match.match_id)}
        </TableCell>
      ))}
      <TableCell className="text-center tabular-nums">{seasonTotal}</TableCell>
      <TableCell className="text-center tabular-nums">
        {Math.round(seasonTotal / games)}
      </TableCell>
    </TableRow>
  )
}

function Spacer({ columns }: { columns: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns + 4} className="h-4 border-0 p-0" />
    </TableRow>
  )
}

function opponentList(
  value: DashboardTeamStats[] | DashboardTeamStats | null | undefined,
) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function eventOf(stats: DashboardTeamStats[], eventId: number) {
  return stats.find((event) => event.event_id === eventId)
}

function eventTotal(
  stats: DashboardTeamStats[],
  eventId: number,
  matchId?: number,
) {
  const event = eventOf(stats, eventId)
  if (!event) return 0
  if (matchId == null) return event.total
  return event.matches.find((match) => match.match_id === matchId)?.total ?? 0
}

function subTotal(
  stats: DashboardTeamStats[],
  eventId: number,
  subIds: Set<number>,
  matchId?: number,
) {
  const event = eventOf(stats, eventId)
  if (!event) return 0

  return event.sub_events
    .filter(
      (sub) =>
        subIds.has(sub.sub_event_id) ||
        (eventId === SHOT && /on target/i.test(sub.sub_event_name)),
    )
    .reduce((total, sub) => {
      if (matchId == null) return total + sub.total
      return (
        total +
        (sub.matches.find((match) => match.match_id === matchId)?.total ?? 0)
      )
    }, 0)
}

function matchColumns(matches: DashboardMatch[]) {
  const bases = matches.map(opponentLabel)
  const duplicated = new Set(
    bases.filter((label, index) => bases.indexOf(label) !== index),
  )

  return matches.map((match, index) => {
    const base = bases[index] ?? match.label
    const label = duplicated.has(base)
      ? `${base} (${match.matchday || match.match_id})`
      : base
    return { match, label }
  })
}

function opponentLabel(match: DashboardMatch) {
  const versus = match.label.match(/vs\s+(.+?)\s+\(/i)
  return versus?.[1] ?? match.label
}

function percent(total: number, part: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function formatNumber(value: number, decimal: boolean) {
  if (!decimal) return Math.round(value)
  return Math.round(value * 10) / 10
}
