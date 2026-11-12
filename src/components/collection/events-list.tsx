import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { cn } from '#/lib/utils'
import { useStore } from '#/store/store'
import { toast } from '#/components/ui/toast'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { rawEventsQuery } from '#/data/fixtures'
import { createMatchEvent } from '#/data/collection'
import { MOMENTS } from '#/components/collection/utils'
import type { CreateMatchEventPayload } from '#/lib/payloads'
import type { RawFixtureEvent, TypeObject } from '#/lib/types'

const EMPTY_EVENTS: CreateMatchEventPayload[] = []

type MatchEventsListProps = {
  fixId: number
  matchEvents: RawFixtureEvent[]
  activeId?: number | null
  onSelect?: (event: RawFixtureEvent) => void
}

const MOMENT_LABELS: Record<string, string> = {
  firsthalf: 'First half',
  secondhalf: 'Second half',
  extrafirst: 'Extra time 1',
  extrasecond: 'Extra time 2',
}

function nameOf(value: TypeObject | null | undefined) {
  return value?.name?.trim() ?? ''
}

function joined(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' - ')
}

function momentLabel(value: string) {
  return MOMENT_LABELS[value] ?? value
}

function eventText(event: RawFixtureEvent) {
  return [
    event.minute,
    event.second,
    event.moment,
    momentLabel(event.moment),
    event.quarter,
    event.narration,
    nameOf(event.metric),
    nameOf(event.metric_detail),
    nameOf(event.metric_sub_detail),
    nameOf(event.player),
    nameOf(event.subplayer),
  ]
    .join(' ')
    .toLowerCase()
}

export default function MatchEventsList({
  fixId,
  matchEvents,
  activeId,
  onSelect,
}: MatchEventsListProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [moment, setMoment] = useState('')
  const [syncing, setSyncing] = useState(false)
  const videoEvents = useStore((state) =>
    state.store.videoCollection?.fixtureId === fixId
      ? state.store.videoCollection.videoEvents
      : EMPTY_EVENTS,
  )
  const total = videoEvents.length
  const sent = videoEvents.filter((event) => event.sync_status === 0).length
  const query = search.trim().toLowerCase()
  const moments = [
    ...MOMENTS.filter((value) =>
      matchEvents.some((event) => event.moment === value),
    ),
    ...matchEvents
      .map((event) => event.moment)
      .filter(
        (value, index, all) =>
          Boolean(value) &&
          !MOMENTS.includes(value) &&
          all.indexOf(value) === index,
      ),
  ]
  const events = [...matchEvents]
    .sort((a, b) => b.id - a.id)
    .filter((event) => (moment ? event.moment === moment : true))
    .filter((event) => (query ? eventText(event).includes(query) : true))

  async function syncFailed() {
    if (syncing) return
    const pending = videoEvents.filter((event) => event.sync_status === 1)
    if (pending.length === 0) return
    setSyncing(true)
    let synced = 0
    let failed = 0
    let lastError = 'Failed to sync events'
    try {
      for (const event of pending) {
        try {
          await createMatchEvent({
            data: {
              fixId,
              event,
              is_own_goal: false,
            },
          })
          synced += 1
          const current = useStore.getState().store.videoCollection
          const stored =
            current?.fixtureId === fixId ? current.videoEvents : []
          useStore.getState().updateVideoCollection({
            fixtureId: fixId,
            videoEvents: stored.map((item) =>
              item.localid === event.localid
                ? { ...item, sync_status: 0 }
                : item,
            ),
          })
        } catch (error) {
          failed += 1
          lastError = error instanceof Error ? error.message : lastError
        }
      }
      if (synced > 0) {
        await queryClient.invalidateQueries({
          queryKey: rawEventsQuery(String(fixId)).queryKey,
        })
      }
      if (failed === 0) {
        toast.add({
          title: 'Events synced',
          description: `${synced} sent to the server.`,
        })
      } else if (synced === 0) {
        toast.add({ title: 'Sync failed', description: lastError })
      } else {
        toast.add({
          title: 'Sync incomplete',
          description: `${synced} sent. ${failed} still waiting.`,
        })
      }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-2.5 py-2">
        <p
          className="text-xs font-medium tabular-nums text-foreground"
          title={`${sent} sent of ${total} collected`}
        >
          {sent} / {total}
        </p>
        {sent !== total ? (
          <Button
            type="button"
            size="xs"
            disabled={syncing}
            onClick={() => void syncFailed()}
          >
            {syncing ? <Loader2Icon className="animate-spin" /> : null}
            Sync
          </Button>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-1.5 border-b border-border px-2 py-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search events"
          aria-label="Search events"
          className="h-7 min-w-0 flex-1 rounded-md px-2 text-xs"
        />
        <select
          aria-label="Filter by moment"
          value={moment}
          onChange={(event) => setMoment(event.target.value)}
          className="h-7 max-w-32 rounded-md border border-border bg-background px-2 text-xs text-foreground"
        >
          <option value="">All moments</option>
          {moments.map((value) => (
            <option key={value} value={value}>
              {momentLabel(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2">
        {matchEvents.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            No events collected yet.
          </p>
        ) : events.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-muted-foreground">
            No events match.
          </p>
        ) : (
          <ul className="space-y-1">
            {events.map((event) => {
              const selected = event.id === activeId
              const period = joined([
                momentLabel(event.moment),
                event.quarter,
              ])
              const metric = joined([
                nameOf(event.metric),
                nameOf(event.metric_detail),
                nameOf(event.metric_sub_detail),
              ])
              const player = nameOf(event.player)
              const subplayer = nameOf(event.subplayer)
              const people = subplayer ? joined([player, subplayer]) : player

              return (
                <li key={event.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect?.(event)}
                    className={cn(
                      'w-full rounded-md border px-2.5 py-1.5 text-left text-xs leading-4',
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:bg-muted/50',
                    )}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="shrink-0 font-medium tabular-nums">
                        {event.minute}&apos; {event.second}
                      </span>
                      {period ? (
                        <span
                          className="min-w-0 truncate text-muted-foreground"
                          title={period}
                        >
                          {period}
                        </span>
                      ) : null}
                    </span>
                    {metric ? (
                      <span className="mt-0.5 block truncate" title={metric}>
                        {metric}
                      </span>
                    ) : null}
                    {people ? (
                      <span
                        className="mt-0.5 block truncate text-muted-foreground"
                        title={people}
                      >
                        {people}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
