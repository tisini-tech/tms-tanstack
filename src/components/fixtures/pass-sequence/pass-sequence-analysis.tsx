import { useMemo, useState } from 'react'

import {
  Select,
  SelectContent,
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
import { getPassSeqs, cn } from '#/lib/utils'
import type { EventSequence, FixtureTeamStats } from '#/lib/types'
import type { ReactNode } from 'react'

const ALL = 'all'

const EVENT_KEYWORDS = [
  'shot',
  'cross',
  'ball',
  'aerial',
  'chance',
  'foul',
  'tackle',
  'pass',
  'box',
] as const

type PassSequenceAnalysisProps = {
  teamStats: FixtureTeamStats
}

function MetricCard({
  title,
  value,
  hint,
  children,
}: {
  title: string
  value?: string | number
  hint?: string
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {children ?? (
        <>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </>
      )}
    </div>
  )
}

function AccuracyBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

function outcomeClass(outcome: string) {
  const normalized = outcome.trim().toLowerCase()
  if (normalized === 'positive') {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
  }
  if (normalized === 'negative') {
    return 'bg-destructive/15 text-destructive'
  }
  return 'bg-amber-500/15 text-amber-800 dark:text-amber-400'
}

function formatClock(minute: number, second: number) {
  return `${minute}'${String(second).padStart(2, '0')}`
}

export function PassSequenceAnalysis({ teamStats }: PassSequenceAnalysisProps) {
  const { fixture, sequences } = teamStats
  const [side, setSide] = useState<'home' | 'away'>('home')
  const [selectedKeyword, setSelectedKeyword] = useState(ALL)
  const [selectedPlayer, setSelectedPlayer] = useState(ALL)

  const teamSequences = side === 'home' ? sequences.home : sequences.away
  const teamName = side === 'home' ? fixture.home_team : fixture.away_team

  const lengthBuckets = getPassSeqs(teamSequences)
  const totalPassCount = teamSequences.reduce(
    (sum, item) => sum + item.pass_count,
    0,
  )
  const averagePassSequence =
    teamSequences.length > 0 ? totalPassCount / teamSequences.length : 0

  const shots = teamSequences.filter((seq) =>
    seq.next_event.toLowerCase().includes('shot'),
  )
  const shotsOnTarget = shots.filter(
    (seq) => seq.outcome.toLowerCase() === 'positive',
  ).length
  const shotAccuracy = shots.length > 0 ? (shotsOnTarget / shots.length) * 100 : 0

  const crosses = teamSequences.filter((seq) =>
    seq.next_event.toLowerCase().includes('cross'),
  )
  const crossComplete = crosses.filter(
    (seq) => seq.outcome.toLowerCase() === 'positive',
  ).length
  const crossAccuracy =
    crosses.length > 0 ? (crossComplete / crosses.length) * 100 : 0

  const filteredPlayers = useMemo(() => {
    const players = new Set<string>()

    for (const seq of teamSequences) {
      const matchesKeyword =
        selectedKeyword === ALL ||
        seq.next_event.toLowerCase().includes(selectedKeyword.toLowerCase())

      if (matchesKeyword && seq.player?.trim()) {
        players.add(seq.player.trim())
      }
    }

    return Array.from(players).sort((a, b) => a.localeCompare(b))
  }, [teamSequences, selectedKeyword])

  const filteredSequences = useMemo(() => {
    return teamSequences.filter((seq) => {
      const keywordMatch =
        selectedKeyword === ALL ||
        seq.next_event.toLowerCase().includes(selectedKeyword.toLowerCase())
      const playerMatch =
        selectedPlayer === ALL || seq.player === selectedPlayer
      return keywordMatch && playerMatch
    })
  }, [teamSequences, selectedKeyword, selectedPlayer])

  const { totalSelected, positiveSelected, positivePercentage } = useMemo(() => {
    const total = filteredSequences.length
    const positive = filteredSequences.filter(
      (seq) => seq.outcome.toLowerCase() === 'positive',
    ).length
    const percentage = total > 0 ? ((positive / total) * 100).toFixed(1) : '0'

    return {
      totalSelected: total,
      positiveSelected: positive,
      positivePercentage: percentage,
    }
  }, [filteredSequences])

  const sideItems = [
    { value: 'home', label: fixture.home_team },
    { value: 'away', label: fixture.away_team },
  ]
  const keywordItems = [
    { value: ALL, label: 'All events' },
    ...EVENT_KEYWORDS.map((keyword) => ({
      value: keyword,
      label: keyword.charAt(0).toUpperCase() + keyword.slice(1),
    })),
  ]
  const playerItems = [
    { value: ALL, label: 'All players' },
    ...filteredPlayers.map((player) => ({ value: player, label: player })),
  ]

  function handleKeywordChange(value: string | null) {
    if (value == null) return
    setSelectedKeyword(value)
    setSelectedPlayer(ALL)
  }

  function handleSideChange(value: string | null) {
    if (value !== 'home' && value !== 'away') return
    setSide(value)
    setSelectedKeyword(ALL)
    setSelectedPlayer(ALL)
  }

  if (!teamSequences.length) {
    return (
      <div className="space-y-4">
        <TeamSideSelect
          value={side}
          items={sideItems}
          onValueChange={handleSideChange}
        />
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
          No pass sequences for {teamName}.
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-heading">
            Pass sequence analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre-processed sequences for {teamName}.
          </p>
        </div>
        <TeamSideSelect
          value={side}
          items={sideItems}
          onValueChange={handleSideChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="Total sequences"
          value={lengthBuckets.total}
          hint={`${totalPassCount} total passes`}
        />
        <MetricCard
          title="Avg pass sequence"
          value={averagePassSequence.toFixed(1)}
          hint="passes per sequence"
        />
        <MetricCard title="Sequence length">
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { label: '10+', value: lengthBuckets.over10 },
              { label: '7-9', value: lengthBuckets.btwn7to9 },
              { label: '4-6', value: lengthBuckets.btwn4to6 },
              { label: '1-3', value: lengthBuckets.below3 },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </MetricCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Sequence ending in shot
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total shots</p>
              <p className="text-2xl font-bold tabular-nums">{shots.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On target</p>
              <p className="text-2xl font-bold tabular-nums">{shotsOnTarget}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Accuracy: {shotAccuracy.toFixed(1)}%
            </p>
            <AccuracyBar value={shotAccuracy} />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Sequence ending in cross
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total crosses</p>
              <p className="text-2xl font-bold tabular-nums">{crosses.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold tabular-nums">{crossComplete}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Accuracy: {crossAccuracy.toFixed(1)}%
            </p>
            <AccuracyBar value={crossAccuracy} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="grid gap-4 border-b border-border p-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="pass-seq-event-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Filter by event type
            </label>
            <Select
              value={selectedKeyword}
              items={keywordItems}
              onValueChange={handleKeywordChange}
            >
              <SelectTrigger id="pass-seq-event-filter" className="w-full">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {keywordItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="pass-seq-player-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Filter by player
            </label>
            <Select
              value={selectedPlayer}
              items={playerItems}
              onValueChange={(value) => {
                if (value == null) return
                setSelectedPlayer(value)
              }}
              disabled={filteredPlayers.length === 0}
            >
              <SelectTrigger id="pass-seq-player-filter" className="w-full">
                <SelectValue
                  placeholder={
                    filteredPlayers.length === 0
                      ? 'No players found'
                      : 'Select player'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {playerItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedKeyword !== ALL ? (
          <div className="grid grid-cols-3 gap-4 border-b border-border bg-muted/30 p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total sequences</p>
              <p className="text-xl font-semibold tabular-nums">
                {totalSelected}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Positive outcomes</p>
              <p className="text-xl font-semibold tabular-nums">
                {positiveSelected}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success rate</p>
              <p className="text-xl font-semibold tabular-nums">
                {positivePercentage}%
              </p>
            </div>
          </div>
        ) : null}

        {filteredSequences.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No sequences match your filters.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passes</TableHead>
                <TableHead>Ended with</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSequences.map((item, index) => (
                <SequenceRow key={`${item.player}-${item.minute}-${item.second}-${index}`} item={item} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  )
}

function SequenceRow({ item }: { item: EventSequence }) {
  return (
    <TableRow>
      <TableCell>
        <span className="inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
          {item.pass_count}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{item.next_event}</TableCell>
      <TableCell>{item.player || 'Unknown'}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {item.quarter} {formatClock(item.minute, item.second)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
            outcomeClass(item.outcome),
          )}
        >
          {item.outcome}
        </span>
      </TableCell>
    </TableRow>
  )
}

function TeamSideSelect({
  value,
  items,
  onValueChange,
}: {
  value: 'home' | 'away'
  items: Array<{ value: string; label: string }>
  onValueChange: (value: string | null) => void
}) {
  return (
    <Select value={value} items={items} onValueChange={onValueChange}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
