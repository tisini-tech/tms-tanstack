import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { useStore } from '#/store/store'
import { toast } from '#/components/ui/toast'
import { Button } from '#/components/ui/button'
import {
  storedPitchPoint,
  type PitchPoint,
} from '#/components/collection/pitch'
import {
  rawEventsQuery,
  updateFixtureEventFn,
  type UpdateFixtureEventPayload,
} from '#/data/fixtures'
import {
  OTHER_CATEGORY,
  PLAYER_KEYS,
  byOrder,
  isSubRole,
  playerLabel,
  shortcutIndex,
} from '#/components/collection/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import type {
  MatchMetric,
  MetricCategory,
  RawFixtureEvent,
  TeamLineup,
} from '#/lib/types'

const WINDOW_SECONDS = 5 * 60
/** Fixtures after this id store `video_timestamp` in milliseconds. */
const VIDEO_TIMESTAMP_MS_AFTER_FIXTURE_ID = 13495

type EditColumn = 'category' | 'metric' | 'player' | 'event'

type MatchClock = {
  minute: number
  second: number
  moment: string
  quarter: string
}

type EditCollectionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  metrics: MatchMetric[]
  metricCategories: MetricCategory[]
  lineups: TeamLineup[]
  events: RawFixtureEvent[]
  teamView: string | number
  fixId: number
  timestamp: number
  point?: PitchPoint | null
  clock: MatchClock | null
  onReturnToVideo?: () => void
  onCreateNew: () => void
}

export default function EditCollectionModal({
  open,
  onOpenChange,
  metrics,
  metricCategories,
  lineups,
  events,
  teamView,
  fixId,
  timestamp,
  point = null,
  clock,
  onReturnToVideo,
  onCreateNew,
}: EditCollectionModalProps) {
  const queryClient = useQueryClient()
  const showPlayers = Number(teamView) === 0
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [metricId, setMetricId] = useState<number | null>(null)
  const [playerId, setPlayerId] = useState<number | null>(null)
  const [eventId, setEventId] = useState<number | null>(null)
  const [focusColumn, setFocusColumn] = useState<EditColumn>('category')

  const categories = useMemo(
    () =>
      [...metricCategories]
        .filter((category) => category.status !== 0)
        .sort(
          (left, right) =>
            left.ranker - right.ranker || left.name.localeCompare(right.name),
        ),
    [metricCategories],
  )
  const activeMetrics = useMemo(
    () => byOrder(metrics.filter((metric) => metric.is_active !== 0)),
    [metrics],
  )
  const categoryOptions = useMemo(() => {
    const options = categories.map((category) => ({
      id: category.id,
      name: category.name,
    }))
    if (options.length === 0) return options
    const known = new Set(options.map((category) => category.id))
    if (activeMetrics.some((metric) => !known.has(metric.metric_category))) {
      options.push({ id: OTHER_CATEGORY, name: 'Other' })
    }
    return options
  }, [activeMetrics, categories])
  const metricList = useMemo(() => {
    if (categoryOptions.length === 0) return activeMetrics
    if (categoryId == null) return []
    if (categoryId === OTHER_CATEGORY) {
      const known = new Set(categories.map((category) => category.id))
      return activeMetrics.filter(
        (metric) => !known.has(metric.metric_category),
      )
    }
    return activeMetrics.filter(
      (metric) => metric.metric_category === categoryId,
    )
  }, [activeMetrics, categories, categoryId, categoryOptions.length])
  const squad = useMemo(() => {
    const sorted = [...(lineups ?? [])].sort((left, right) => {
      const leftSub = isSubRole(left.role) ? 1 : 0
      const rightSub = isSubRole(right.role) ? 1 : 0
      if (leftSub !== rightSub) return leftSub - rightSub
      return left.lineup_position - right.lineup_position
    })
    const seen = new Set<number>()
    return sorted.filter((entry) => {
      const id = entry.player?.id
      if (id == null || seen.has(id)) return false
      seen.add(id)
      return true
    })
  }, [lineups])
  const metric =
    metricList.find((item) => item.id === metricId) ??
    activeMetrics.find((item) => item.id === metricId)
  const player = squad.find((entry) => entry.player.id === playerId)
  const columns = useMemo(() => {
    const next: EditColumn[] = []
    if (categoryOptions.length > 0) next.push('category')
    next.push('metric')
    if (showPlayers && squad.length > 0) next.push('player')
    next.push('event')
    return next
  }, [categoryOptions.length, showPlayers, squad.length])
  const focus = columns.includes(focusColumn)
    ? focusColumn
    : (columns[0] ?? 'metric')
  const target = clock ? clock.minute * 60 + clock.second : null
  const matches = useMemo(() => {
    if (metric == null || target == null) return []
    return events
      .filter((event) => event.metric?.id === metric.id)
      .filter((event) =>
        showPlayers && player != null
          ? event.player?.id === player.player.id
          : true,
      )
      .map((event) => ({
        event,
        offset: event.minute * 60 + event.second - target,
      }))
      .filter((item) => Math.abs(item.offset) <= WINDOW_SECONDS)
      .sort(
        (left, right) =>
          Math.abs(left.offset) - Math.abs(right.offset) ||
          left.event.id - right.event.id,
      )
  }, [events, metric, player, showPlayers, target])

  function listLength(column: EditColumn) {
    if (column === 'category') return categoryOptions.length
    if (column === 'metric') return metricList.length
    if (column === 'player') return squad.length + 1
    return matches.length
  }

  function selectedIndex(column: EditColumn) {
    if (column === 'category') {
      return categoryOptions.findIndex((item) => item.id === categoryId)
    }
    if (column === 'metric') {
      return metricList.findIndex((item) => item.id === metricId)
    }
    if (column === 'player') {
      if (playerId == null) return 0
      const index = squad.findIndex((entry) => entry.player.id === playerId)
      return index < 0 ? 0 : index + 1
    }
    return matches.findIndex((item) => item.event.id === eventId)
  }

  function hotkeyFor(column: EditColumn, index: number) {
    if (focus !== column) return undefined
    const letters = column !== 'category'
    const key = letters
      ? PLAYER_KEYS[index]
      : index < 9
        ? String(index + 1)
        : ''
    if (!key || key.toLowerCase() === 'n') return undefined
    return key.toUpperCase()
  }

  function chooseCategory(id: number) {
    setCategoryId(id)
    setMetricId(null)
    setPlayerId(null)
    setEventId(null)
    setFocusColumn('metric')
  }

  function chooseMetric(id: number) {
    setMetricId(id)
    setPlayerId(null)
    setEventId(null)
    setFocusColumn(showPlayers && squad.length > 0 ? 'player' : 'metric')
  }

  function choosePlayer(id: number) {
    setPlayerId((current) => (current === id ? null : id))
    setEventId(null)
  }

  function pick(index: number) {
    if (focus === 'category') {
      const category = categoryOptions[index]
      if (category) chooseCategory(category.id)
      return
    }
    if (focus === 'metric') {
      const item = metricList[index]
      if (item) chooseMetric(item.id)
      return
    }
    if (focus === 'player') {
      if (index === 0) {
        setPlayerId(null)
        setEventId(null)
        return
      }
      const entry = squad[index - 1]
      if (entry) choosePlayer(entry.player.id)
      return
    }
    const match = matches[index]
    if (match) setEventId(match.event.id)
  }

  function move(direction: 1 | -1) {
    const current = Math.max(0, columns.indexOf(focus))
    const next = columns[current + direction]
    if (next) setFocusColumn(next)
  }

  function step(direction: 1 | -1) {
    const length = listLength(focus)
    if (length === 0) return
    const current = selectedIndex(focus)
    const next =
      current < 0 ? (direction > 0 ? 0 : length - 1) : current + direction
    if (next < 0 || next >= length) return
    if (focus === 'category') {
      const category = categoryOptions[next]
      if (!category) return
      setCategoryId(category.id)
      setMetricId(null)
      setPlayerId(null)
      setEventId(null)
      return
    }
    if (focus === 'metric') {
      const item = metricList[next]
      if (!item) return
      setMetricId(item.id)
      setPlayerId(null)
      setEventId(null)
      return
    }
    if (focus === 'player') {
      if (next === 0) {
        setPlayerId(null)
        setEventId(null)
        return
      }
      const entry = squad[next - 1]
      if (entry) {
        setPlayerId(entry.player.id)
        setEventId(null)
      }
      return
    }
    const match = matches[next]
    if (match) setEventId(match.event.id)
  }

  function tryKey(key: string) {
    const index = shortcutIndex(key, focus !== 'category')
    if (index == null || index >= listLength(focus)) return false
    pick(index)
    return true
  }

  const selected =
    matches.find((item) => item.event.id === eventId)?.event ?? null

  async function saveOnEvent() {
    if (selected == null) return
    const savedId = selected.id
    const stored = point ? storedPitchPoint(point, selected.moment) : null
    const body: UpdateFixtureEventPayload = {
      metric_id: selected.metric?.id ?? 0,
      metric_detail_id: selected.metric_detail?.id ?? 0,
      metric_sub_detail_id: selected.metric_sub_detail?.id ?? 0,
      player_id: selected.player?.id ?? 0,
      subplayer_id: selected.subplayer?.id ?? 0,
      team_id: selected.team,
      minute: selected.minute,
      second: selected.second,
      moment: selected.moment,
      quarter: selected.quarter,
      narration: selected.narration,
      zone_id: selected.zone_id,
      xper: stored ? stored.x.toFixed(1) : (selected.xper ?? ''),
      yper: stored ? stored.y.toFixed(1) : (selected.yper ?? ''),
      video_timestamp: Math.round(timestamp * 1000),
      no_ruck: selected.no_ruck,
      no_lineout: selected.no_lineout,
      meter_gain: selected.meter_gain,
      kickfrom: selected.kickfrom,
      kickland: selected.kickland,
      defender: selected.defender,
      localid: selected.localid,
      app_timelog: new Date().toISOString(),
      sync_status: 0,
    }
    const current = useStore.getState().store.videoCollection
    const previous =
      current?.fixtureId === fixId ? (current.editedEvents ?? []) : []
    useStore.getState().updateVideoCollection({
      fixtureId: fixId,
      editedEvents: [
        ...previous.filter((item) => item.eventId !== savedId),
        { eventId: savedId, body },
      ],
    })
    onOpenChange(false)
    onReturnToVideo?.()
    try {
      await updateFixtureEventFn({
        data: {
          fixtureId: String(fixId),
          eventId: savedId,
          body,
        },
      })
      await queryClient.invalidateQueries({
        queryKey: rawEventsQuery(String(fixId)).queryKey,
      })
      toast.add({
        title: 'Event updated',
        description: stored
          ? 'Video time and location saved.'
          : 'Video time saved.',
      })
    } catch (error) {
      const latest = useStore.getState().store.videoCollection
      const edits =
        latest?.fixtureId === fixId ? (latest.editedEvents ?? []) : []
      useStore.getState().updateVideoCollection({
        fixtureId: fixId,
        editedEvents: edits.map((item) =>
          item.eventId === savedId
            ? { ...item, body: { ...item.body, sync_status: 1 } }
            : item,
        ),
      })
      const message =
        error instanceof Error ? error.message : 'Failed to update event'
      toast.add({ title: 'Update failed', description: message })
    }
  }

  function createNew() {
    onCreateNew()
  }

  const actionsRef = useRef({
    move: (_direction: 1 | -1) => {},
    step: (_direction: 1 | -1) => {},
    tryKey: (_key: string): boolean => false,
    save: () => {},
    createNew: () => {},
  })
  actionsRef.current.move = move
  actionsRef.current.step = step
  actionsRef.current.tryKey = tryKey
  actionsRef.current.save = () => void saveOnEvent()
  actionsRef.current.createNew = createNew

  useEffect(() => {
    if (!open) return
    setCategoryId(null)
    setMetricId(null)
    setPlayerId(null)
    setEventId(null)
    setFocusColumn(categoryOptions.length > 0 ? 'category' : 'metric')
  }, [open, categoryOptions.length])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, [contenteditable="true"]')
      ) {
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        actionsRef.current.move(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        actionsRef.current.move(-1)
        return
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        actionsRef.current.step(event.key === 'ArrowDown' ? 1 : -1)
        return
      }
      if (
        (event.key === 'n' || event.key === 'N') &&
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        event.stopPropagation()
        actionsRef.current.createNew()
        return
      }
      if (
        !event.repeat &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        actionsRef.current.tryKey(event.key)
      ) {
        event.preventDefault()
        return
      }
      if (
        (event.key === 'Enter' || event.key === 'NumpadEnter') &&
        !event.repeat &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault()
        event.stopPropagation()
        actionsRef.current.save()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const selected = document.querySelector<HTMLElement>(
      `[data-slot="dialog-content"] [data-column="${focus}"][data-selected="true"]`,
    )
    selected?.scrollIntoView({ block: 'nearest' })
  }, [open, focus, categoryId, metricId, playerId, eventId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] w-[min(72rem,calc(100%-2rem))] max-w-none flex-col gap-3 overflow-hidden p-4 sm:max-w-none">
        <DialogHeader className="gap-1 pr-8">
          <DialogTitle>Match an existing event</DialogTitle>
          <DialogDescription>
            {clock
              ? `Match time ${formatClock(target ?? 0)} · ${clock.moment} · events within 5 minutes`
              : 'Set the 1st half so the match time can be calculated.'}
            <span className="mx-2">·</span>
            Video {formatClock(Math.floor(Math.max(0, timestamp)))}
            <span className="mx-2">·</span>
            Keys 1–9 pick the highlighted section. Longer lists continue with
            A–Z. Up and down move inside it. Left and right change section.
            Enter saves the selected event. N starts a new one.
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'grid min-h-0 flex-1 grid-cols-1 gap-2',
            showPlayers ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
          )}
        >
          {categoryOptions.length > 0 ? (
            <PickerColumn title="Category" active={focus === 'category'}>
              {categoryOptions.map((item, index) => (
                <PickButton
                  key={item.id}
                  column="category"
                  selected={item.id === categoryId}
                  hotkey={hotkeyFor('category', index)}
                  onClick={() => chooseCategory(item.id)}
                >
                  {item.name}
                </PickButton>
              ))}
            </PickerColumn>
          ) : null}

          <PickerColumn title="Metric" active={focus === 'metric'}>
            {categoryOptions.length > 0 && categoryId == null ? (
              <EmptyNote>Select a category.</EmptyNote>
            ) : metricList.length === 0 ? (
              <EmptyNote>No metrics in this category.</EmptyNote>
            ) : (
              metricList.map((item, index) => (
                <PickButton
                  key={item.id}
                  column="metric"
                  selected={item.id === metricId}
                  hotkey={hotkeyFor('metric', index)}
                  onClick={() => chooseMetric(item.id)}
                >
                  {item.name}
                </PickButton>
              ))
            )}
          </PickerColumn>

          {showPlayers ? (
            <PickerColumn title="Player" active={focus === 'player'}>
              {squad.length === 0 ? (
                <EmptyNote>No lineup for this team.</EmptyNote>
              ) : (
                <>
                  <PickButton
                    column="player"
                    selected={playerId == null}
                    hotkey={hotkeyFor('player', 0)}
                    onClick={() => {
                      setPlayerId(null)
                      setEventId(null)
                    }}
                  >
                    All players
                  </PickButton>
                  {squad.map((entry, index) => (
                    <PickButton
                      key={entry.id}
                      column="player"
                      selected={entry.player.id === playerId}
                      hotkey={hotkeyFor('player', index + 1)}
                      onClick={() => choosePlayer(entry.player.id)}
                    >
                      {playerLabel(entry)}
                    </PickButton>
                  ))}
                </>
              )}
            </PickerColumn>
          ) : null}
        </div>

        <section
          className={cn(
            'flex min-h-36 flex-col gap-1 rounded-md p-1',
            focus === 'event' && 'bg-primary/5 ring-1 ring-primary/40',
          )}
        >
          <p className="px-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {metric == null ? 'Events' : `${matches.length} within 5 minutes`}
          </p>
          <div className="scrollbar-thin flex max-h-44 flex-col gap-1 overflow-y-auto">
            {matches.length > 0 ? (
              <div className="sticky top-0 z-10 flex items-center gap-3 border border-transparent bg-popover px-2 text-[10px] tracking-wide text-muted-foreground uppercase">
                <span className="w-4 shrink-0" />
                <span className="w-12 shrink-0">Time</span>
                <span className="w-14 shrink-0">Offset</span>
                <span className="min-w-0 flex-1">Event</span>
                <span className="w-36 shrink-0">Player</span>
                <span className="w-16 shrink-0">X</span>
                <span className="w-16 shrink-0">Y</span>
                <span className="w-16 shrink-0 text-right">Video</span>
              </div>
            ) : null}
            {metric == null ? (
              <EmptyNote>Select a metric to see nearby events.</EmptyNote>
            ) : clock == null ? (
              <EmptyNote>
                The match clock is not available for this video time.
              </EmptyNote>
            ) : matches.length === 0 ? (
              <EmptyNote>
                No {metric.name}
                {player ? ` for ${player.player.name}` : ''} events between{' '}
                {formatClock((target ?? 0) - WINDOW_SECONDS)} and{' '}
                {formatClock((target ?? 0) + WINDOW_SECONDS)}.
              </EmptyNote>
            ) : (
              matches.map(({ event, offset }, index) => {
                const hotkey = hotkeyFor('event', index)
                const x = coord(event.xper)
                const y = coord(event.yper)
                const video = videoClock(event.video_timestamp, fixId)
                return (
                  <button
                    key={event.id}
                    type="button"
                    data-column="event"
                    data-selected={event.id === eventId ? 'true' : undefined}
                    onClick={() => {
                      setEventId(event.id)
                      setFocusColumn('event')
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md border px-2 py-1.5 text-left text-xs',
                      event.id === eventId
                        ? 'border-primary/70 bg-primary/15 font-medium text-foreground'
                        : 'border-border bg-background hover:bg-muted',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground uppercase tabular-nums',
                        hotkey == null && 'invisible',
                      )}
                    >
                      {hotkey ?? ''}
                    </span>
                    <span className="w-12 shrink-0 tabular-nums">
                      {formatClock(event.minute * 60 + event.second)}
                    </span>
                    <span className="w-14 shrink-0 text-muted-foreground tabular-nums">
                      {offset === 0
                        ? '0:00'
                        : `${offset > 0 ? '+' : '-'}${formatClock(Math.abs(offset))}`}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {chainLabel(
                        event.metric?.name,
                        event.metric_detail?.name,
                        event.metric_sub_detail?.name,
                      )}
                    </span>
                    <span className="w-36 shrink-0 truncate text-muted-foreground">
                      {event.player?.name || '—'}
                    </span>
                    <span className="w-16 shrink-0 text-muted-foreground tabular-nums">
                      {x ?? '—'}
                    </span>
                    <span className="w-16 shrink-0 text-muted-foreground tabular-nums">
                      {y ?? '—'}
                    </span>
                    <span
                      className={cn(
                        'w-16 shrink-0 text-right tabular-nums',
                        video ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {video ?? '—'}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {point ? 'Location marked' : 'No location marked'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={createNew}>
              <KeyMark>N</KeyMark>
              New event
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={selected == null}
              onClick={() => void saveOnEvent()}
            >
              <KeyMark>Enter</KeyMark>
              {point ? 'Save time and location' : 'Save time'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PickerColumn({
  title,
  active,
  children,
}: {
  title: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col gap-1 rounded-md p-1',
        active && 'bg-primary/5 ring-1 ring-primary/40',
      )}
    >
      <p className="px-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {children}
      </div>
    </section>
  )
}

function PickButton({
  column,
  selected,
  hotkey,
  onClick,
  children,
}: {
  column: EditColumn
  selected: boolean
  hotkey?: string
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      data-column={column}
      data-selected={selected ? 'true' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs leading-4',
        selected
          ? 'border-primary/70 bg-primary/15 font-medium text-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted',
      )}
    >
      {hotkey != null ? (
        <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded bg-muted px-0.5 text-[10px] font-medium text-muted-foreground uppercase tabular-nums">
          {hotkey}
        </span>
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  )
}

function KeyMark({ children }: { children: string }) {
  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-foreground/10 px-1 text-[10px] font-medium tabular-nums">
      {children}
    </span>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-2 py-3 text-xs text-muted-foreground">{children}</p>
}

function chainLabel(
  metric?: string | null,
  detail?: string | null,
  subDetail?: string | null,
) {
  return [metric, detail, subDetail]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' · ')
}

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minute = Math.floor(safe / 60)
  const second = safe % 60
  return `${minute}:${String(second).padStart(2, '0')}`
}

function coord(value: string | null | undefined) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) return null
  const number = Number(trimmed)
  if (!Number.isFinite(number)) return trimmed
  return number.toFixed(1)
}

function videoClock(value: number, fixtureId: number) {
  if (!Number.isFinite(value) || value <= 0) return null
  const seconds =
    fixtureId > VIDEO_TIMESTAMP_MS_AFTER_FIXTURE_ID ? value / 1000 : value
  return formatClock(seconds)
}
