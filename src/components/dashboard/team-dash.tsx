import { useState, type ReactNode } from 'react'

import type {
  DashboardMatch,
  DashboardSequences,
  DashboardTeamStats,
  MatchSequence,
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

type SeqSlice = Pick<
  MatchSequence,
  'below3' | 'btwn4to6' | 'btwn7to9' | 'over10' | 'total' | 'average'
>

type MatchRow = {
  id: number
  label: string
  sequence?: SeqSlice
  shotOn: number
  shotTotal: number
  facedOn: number
  facedTotal: number
  fouls: number
  foulThrows: number
  seqPoints: number
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

  const matchRows: MatchRow[] = columns.map((column) => {
    const matchId = column.match.match_id
    const sequence = sequenceByMatch.get(matchId)
    return {
      id: matchId,
      label: `vs ${column.label}`,
      sequence,
      shotOn: subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS, matchId),
      shotTotal: eventTotal(teamStats, SHOT, matchId),
      facedOn: subTotal(opponents, SHOT, ON_TARGET_SUB_IDS, matchId),
      facedTotal: eventTotal(opponents, SHOT, matchId),
      fouls: eventTotal(teamStats, FOUL, matchId),
      foulThrows: subTotal(
        teamStats,
        THROW_IN,
        new Set([FOUL_THROW_SUB]),
        matchId,
      ),
      seqPoints: seqPoints(sequence),
    }
  })

  const totalSeqPoints = matchRows.reduce((sum, row) => sum + row.seqPoints, 0)
  const avgSeqPoints =
    matchRows.length > 0 ? totalSeqPoints / matchRows.length : 0

  const [selectedId, setSelectedId] = useState<number | null>(null)

  const seasonSeq: SeqSlice | undefined = sequences
    ? {
        below3: sequences.below3,
        btwn4to6: sequences.btwn4to6,
        btwn7to9: sequences.btwn7to9,
        over10: sequences.over10,
        total: sequences.total,
        average: sequences.average,
      }
    : undefined

  const seasonRow: MatchRow = {
    id: -1,
    label: 'Season',
    sequence: seasonSeq,
    shotOn: subTotal(teamStats, SHOT, ON_TARGET_SUB_IDS),
    shotTotal: eventTotal(teamStats, SHOT),
    facedOn: subTotal(opponents, SHOT, ON_TARGET_SUB_IDS),
    facedTotal: eventTotal(opponents, SHOT),
    fouls: eventTotal(teamStats, FOUL),
    foulThrows: subTotal(teamStats, THROW_IN, new Set([FOUL_THROW_SUB])),
    seqPoints: avgSeqPoints,
  }

  const selected = matchRows.find((row) => row.id === selectedId) ?? null
  const focus = selected ?? seasonRow
  const isSeason = selected == null

  function selectMatch(id: number) {
    setSelectedId((current) => (current === id ? null : id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="shrink-0 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            label="Games"
            value={String(gameCount)}
            hint="In this view"
          />
          <KpiCard
            label="Seq. average"
            value={formatNumber(seasonSeq?.average ?? 0, true)}
            hint={`${seasonSeq?.total ?? 0} sequences`}
          />
          <KpiCard
            label="Seq. points"
            value={String(totalSeqPoints)}
            hint={`avg ${formatNumber(avgSeqPoints, true)} / game`}
          />
          <KpiCard
            label="Shot on target"
            value={`${percent(seasonRow.shotTotal, seasonRow.shotOn)}%`}
            hint={`${seasonRow.shotOn}/${seasonRow.shotTotal}`}
          />
          <KpiCard
            label="Fouls"
            value={String(seasonRow.fouls)}
            hint={`avg ${Math.round(seasonRow.fouls / gameCount)} / game`}
          />
        </div>

        <Section
          title={isSeason ? 'Season overview' : focus.label}
          subtitle={
            isSeason
              ? 'Totals across all matches — select a row below to filter'
              : 'Filtered to this match — click again or Season to clear'
          }
          action={
            !isSeason ? (
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Show season
              </button>
            ) : null
          }
        >
          <OverviewPanel
            row={focus}
            isSeason={isSeason}
            gameCount={gameCount}
          />
        </Section>
      </div>

      <Section
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        title="Match board"
        subtitle="Compare every game — select a match to filter the overview"
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[52rem]">
            <MatchBoardHeader />
            {matchRows.map((row) => (
              <MatchBoardRow
                key={row.id}
                row={row}
                selected={row.id === selectedId}
                onSelect={() => selectMatch(row.id)}
              />
            ))}
            <MatchBoardRow
              row={seasonRow}
              selected={isSeason}
              onSelect={() => setSelectedId(null)}
              emphasize
              isSeason
            />
          </div>
        </div>
      </Section>
    </div>
  )
}

const BOARD_COLS =
  'grid-cols-[minmax(9rem,1.5fr)_repeat(4,minmax(2.75rem,0.55fr))_minmax(6rem,0.95fr)_minmax(6.5rem,1fr)_minmax(6.5rem,1fr)_minmax(2.75rem,0.5fr)_minmax(3rem,0.55fr)]'

function MatchBoardHeader() {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 grid gap-2 border-b border-border bg-card px-2 py-2 text-[10px] tracking-wide text-muted-foreground uppercase',
        BOARD_COLS,
      )}
    >
      <span>Opponent</span>
      <span className="text-center">Below 3</span>
      <span className="text-center">4–6</span>
      <span className="text-center">7–9</span>
      <span className="text-center">10+</span>
      <span className="text-center">Seq</span>
      <span className="text-center">Attempts</span>
      <span className="text-center">Faced</span>
      <span className="text-center">Fouls</span>
      <span className="text-center">Throw-in</span>
    </div>
  )
}

function MatchBoardRow({
  row,
  selected,
  onSelect,
  emphasize = false,
  isSeason = false,
}: {
  row: MatchRow
  selected: boolean
  onSelect?: () => void
  emphasize?: boolean
  isSeason?: boolean
}) {
  const shotPct = percent(row.shotTotal, row.shotOn)
  const facedPct = percent(row.facedTotal, row.facedOn)
  const interactive = Boolean(onSelect)
  const seqPtsLabel = isSeason
    ? `${formatNumber(row.seqPoints, true)} pts`
    : `${row.seqPoints} pts`

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onSelect}
      className={cn(
        'grid w-full gap-2 px-2 py-2 text-left transition-colors',
        BOARD_COLS,
        'items-center',
        interactive && 'hover:bg-muted/50',
        selected && 'bg-muted/60 ring-1 ring-border',
        emphasize && !selected && 'bg-muted/30',
      )}
    >
      <div className="truncate text-sm font-medium">{row.label}</div>
      <div className="text-center text-sm tabular-nums">
        {row.sequence?.below3 ?? 0}
      </div>
      <div className="text-center text-sm tabular-nums">
        {row.sequence?.btwn4to6 ?? 0}
      </div>
      <div className="text-center text-sm tabular-nums">
        {row.sequence?.btwn7to9 ?? 0}
      </div>
      <div className="text-center text-sm tabular-nums">
        {row.sequence?.over10 ?? 0}
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold tabular-nums">{seqPtsLabel}</div>
        <div className="text-[11px] tabular-nums text-muted-foreground">
          {row.sequence?.total ?? 0} tot · avg{' '}
          {formatNumber(row.sequence?.average ?? 0, true)}
        </div>
      </div>
      <div className="text-center text-sm tabular-nums">
        {row.shotOn}/{row.shotTotal}{' '}
        <span className="text-muted-foreground">({shotPct}%)</span>
      </div>
      <div className="text-center text-sm tabular-nums">
        {row.facedOn}/{row.facedTotal}{' '}
        <span className="text-muted-foreground">({facedPct}%)</span>
      </div>
      <div className="text-center text-sm tabular-nums">{row.fouls}</div>
      <div className="text-center text-sm tabular-nums text-muted-foreground">
        {row.foulThrows}
      </div>
    </button>
  )
}

function OverviewPanel({
  row,
  isSeason,
  gameCount,
}: {
  row: MatchRow
  isSeason: boolean
  gameCount: number
}) {
  const shotPct = percent(row.shotTotal, row.shotOn)
  const facedPct = percent(row.facedTotal, row.facedOn)
  const seqMax = Math.max(
    row.sequence?.below3 ?? 0,
    row.sequence?.btwn4to6 ?? 0,
    row.sequence?.btwn7to9 ?? 0,
    row.sequence?.over10 ?? 0,
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
            {row.sequence?.total ?? 0} sequences · avg{' '}
            {formatNumber(row.sequence?.average ?? 0, true)} · seq pts{' '}
            <span className="font-medium text-foreground">
              {isSeason ? formatNumber(row.seqPoints, true) : row.seqPoints}
            </span>
          </div>
        </div>
        <div className="space-y-2 rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
          {SEQ_SEGMENTS.map((segment) => {
            const value = row.sequence?.[segment.key] ?? 0
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
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
            <OnTargetBar
              label="Attempts"
              onTarget={row.shotOn}
              total={row.shotTotal}
              pct={shotPct}
            />
          </div>
          <div className="rounded-lg border border-border/70 bg-background/40 px-3 py-2.5">
            <OnTargetBar
              label="Attempts faced"
              onTarget={row.facedOn}
              total={row.facedTotal}
              pct={facedPct}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StatTile
            label="Seq points"
            value={isSeason ? formatNumber(row.seqPoints, true) : row.seqPoints}
            hint={isSeason ? 'Avg earned / match' : 'Earned this match'}
          />
          <StatTile
            label="Fouls committed"
            value={row.fouls}
            hint={
              isSeason
                ? `avg ${Math.round(row.fouls / gameCount)} / game`
                : 'This match'
            }
          />
          <StatTile
            label="Foul throw-in"
            value={row.foulThrows}
            hint={
              isSeason
                ? `avg ${Math.round(row.foulThrows / gameCount)} / game`
                : 'This match'
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

function Section({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string
  subtitle: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn('rounded-xl border border-border bg-card p-4', className)}
    >
      <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
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

/** Presence rule: ≥1 in 4–6 → +1, ≥1 in 7–9 → +2, ≥1 over 10 → +1 (max 4). */
function seqPoints(sequence?: SeqSlice | null) {
  if (!sequence) return 0
  return (
    ((sequence.btwn4to6 ?? 0) > 0 ? 1 : 0) +
    ((sequence.btwn7to9 ?? 0) > 0 ? 2 : 0) +
    ((sequence.over10 ?? 0) > 0 ? 1 : 0)
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

  return matches
    .map((match, index) => {
      const base = bases[index] ?? match.label
      const label = duplicated.has(base)
        ? `${base} (${match.matchday || match.match_id})`
        : base
      return { match, label }
    })
    .sort(
      (a, b) =>
        new Date(b.match.match_date).getTime() -
        new Date(a.match.match_date).getTime(),
    )
}

function opponentLabel(match: DashboardMatch) {
  const versus = match.label.match(/vs\s+(.+?)\s+\(/i)
  return versus?.[1] ?? match.label
}

function percent(total: number, part: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function formatNumber(value: number, decimal: boolean) {
  if (!decimal) return String(Math.round(value))
  return String(Math.round(value * 10) / 10)
}
