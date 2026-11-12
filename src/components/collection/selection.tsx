import { Loader2Icon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { cn } from '#/lib/utils'
import { useStore } from '#/store/store'
import { toast } from '#/components/ui/toast'
import { Button } from '#/components/ui/button'
import { rawEventsQuery } from '#/data/fixtures'
import { useSelectionControls } from '#/hooks/use-selection-controls'
import { createMatchEvent, teamLineupsQuery } from '#/data/collection'
import { Dialog, DialogContent, DialogTitle } from '#/components/ui/dialog'
import type { MatchMetric, MetricCategory, TeamLineup, Zone } from '#/lib/types'
import {
  MOMENTS,
  playerLabel,
  SCORE_METRIC_IDS,
  SUBSTITUTE_METRIC_IDS,
  type ColumnKey,
} from '#/components/collection/utils'

type SelectionModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  metrics: MatchMetric[]
  metricCategories: MetricCategory[]
  lineups: TeamLineup[]
  zones: Zone[]
  teamName: string
  teamId: number
  fixId: number
  timestamp: number
  point?: { x: number; y: number } | null
  clock?: {
    minute: number
    second: number
    moment: string
    quarter: string
  } | null
  onReturnToVideo?: () => void
}

function TagButton({
  selected,
  onClick,
  children,
  hotkey,
  column,
}: {
  selected?: boolean
  onClick: () => void
  children: string
  hotkey?: string
  column: ColumnKey
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
          ? 'border-sky-500 bg-sky-200 font-medium text-sky-950'
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

function CountField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-14 rounded-md border border-border bg-background px-2 text-xs text-foreground tabular-nums"
      />
    </label>
  )
}

function KeyMark({ children }: { children: string }) {
  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-foreground/10 px-1 text-[10px] font-medium tabular-nums">
      {children}
    </span>
  )
}

function Column({
  title,
  active,
  wide = false,
  children,
}: {
  title: string
  active?: boolean
  wide?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'flex min-h-0 shrink-0 flex-col gap-1 rounded-md p-1',
        wide ? 'min-w-0 flex-1' : 'w-40',
        active && 'bg-sky-500/10 ring-1 ring-sky-500',
      )}
    >
      <p className="px-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto">
        {children}
      </div>
    </section>
  )
}

export default function SelectionModal({
  open,
  onOpenChange,
  metrics,
  metricCategories,
  lineups,
  zones,
  teamName,
  teamId,
  fixId,
  timestamp,
  point = null,
  clock = null,
  onReturnToVideo,
}: SelectionModalProps) {
  const [moment, setMoment] = useState(clock?.moment ?? MOMENTS[0])
  const [kickLand, setKickLand] = useState('')
  const [noRuck, setNoRuck] = useState('')
  const [noLineout, setNoLineout] = useState('')
  const [meterGain, setMeterGain] = useState('')
  const [defendersBeaten, setDefendersBeaten] = useState('')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()
  const {
    categoryOptions,
    metricList,
    details,
    subDetails,
    starters,
    substitutes,
    showSubs,
    focus,
    categoryId,
    metricId,
    detailId,
    subDetailId,
    zoneId,
    playerId,
    subPlayerId,
    metric,
    detail,
    subDetail,
    player,
    subPlayer,
    hotkeyFor,
    chooseCategory,
    chooseMetric,
    chooseDetail,
    chooseSubDetail,
    chooseZone,
    chooseStarter,
    chooseBench,
    reset,
    actionsRef,
  } = useSelectionControls({
    open,
    metrics,
    metricCategories,
    lineups,
    zones,
  })

  const date = new Date().toISOString()
  const localId = `${Math.floor(Math.random() * 1000000)}#${date.split('T')[0]}#${timestamp}`

  const matchEvent = {
    metric_id: metric?.id ?? 0,
    metric_detail_id: detail?.id ?? 0,
    metric_sub_detail_id: subDetail?.id ?? 0,
    player_id: player?.player.id ?? 0,
    subplayer_id: subPlayer?.player.id ?? 0,
    team_id: teamId,
    minute: clock?.minute ?? 0,
    second: clock?.second ?? 0,
    moment,
    quarter: clock?.quarter ?? 'first',
    narration: `${metric?.name ?? ''} for ${playerLabel(player)}`,
    zone_id: zoneId ?? 0,
    xper: point ? point.x.toFixed(1) : '',
    yper: point ? point.y.toFixed(1) : '',
    video_timestamp: Math.round(timestamp * 1000),
    no_ruck: noRuck,
    no_lineout: noLineout,
    meter_gain: meterGain,
    kickfrom: '',
    kickland: kickLand ?? '',
    defender: defendersBeaten,
    localid: localId,
    app_timelog: date,
    sync_status: 0,
  }

  function resetBoard() {
    reset()
    setKickLand('')
    setNoRuck('')
    setNoLineout('')
    setMeterGain('')
    setDefendersBeaten('')
  }

  function storedEvents() {
    const current = useStore.getState().store.videoCollection
    return current?.fixtureId === fixId ? current.videoEvents : []
  }

  async function saveEvent(next: 'another' | 'video') {
    if (saving) return
    setSaving(true)
    const storedEvent = { ...matchEvent, sync_status: 0 }
    useStore.getState().updateVideoCollection({
      fixtureId: fixId,
      videoEvents: [...storedEvents(), storedEvent],
    })
    try {
      const response = await createMatchEvent({
        data: {
          fixId,
          event: storedEvent,
          is_own_goal: Boolean(metric && /^og$|own\s*goal/i.test(metric.name)),
        },
      })
      await queryClient.invalidateQueries({
        queryKey: rawEventsQuery(String(fixId)).queryKey,
      })

      if (
        metric?.id != null &&
        (SUBSTITUTE_METRIC_IDS.has(metric.id) ||
          SCORE_METRIC_IDS.has(metric.id))
      ) {
        await queryClient.invalidateQueries({
          queryKey: teamLineupsQuery(fixId, teamId).queryKey,
        })
      }

      toast.add({
        title: 'Event saved',
        description: response.message || 'Match event added.',
      })
      if (next === 'another') resetBoard()
      else {
        onOpenChange(false)
        onReturnToVideo?.()
      }
    } catch (error) {
      useStore.getState().updateVideoCollection({
        fixtureId: fixId,
        videoEvents: storedEvents().map((event) =>
          event.localid === storedEvent.localid
            ? { ...event, sync_status: 1 }
            : event,
        ),
      })
      const message =
        error instanceof Error ? error.message : 'Failed to save event'
      toast.add({ title: 'Save failed', description: message })
    } finally {
      setSaving(false)
    }
  }

  actionsRef.current.saveAnother = () => void saveEvent('another')
  actionsRef.current.saveAndTag = () => void saveEvent('video')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] w-[min(84rem,calc(100%-2rem))] max-w-none flex-col gap-3 overflow-hidden p-4 sm:max-w-none">
        <DialogTitle className="sr-only">Tag event</DialogTitle>

        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {Math.floor(Math.max(0, timestamp) / 60)}:
            {String(Math.floor(Math.max(0, timestamp)) % 60).padStart(2, '0')}
          </span>
          <span className="mx-2">·</span>
          Keys 1–9 pick the highlighted column. Player lists continue with A–Z.
          Up and down move inside it. Left and right change column. Esc closes.
          N saves another. Enter saves and returns to the video.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Team
            <select
              value="home"
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="home">{teamName || 'Home'}</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            GM
            <select
              value={moment}
              onChange={(event) => setMoment(event.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              {MOMENTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <CountField
            label="No in Lineout"
            value={noLineout}
            onChange={setNoLineout}
          />
          <CountField label="No in Ruck" value={noRuck} onChange={setNoRuck} />
          <CountField
            label="Meter Gain"
            value={meterGain}
            onChange={setMeterGain}
          />
          <CountField
            label="Defenders Beaten"
            value={defendersBeaten}
            onChange={setDefendersBeaten}
          />
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Kick Land
            <select
              value={kickLand}
              onChange={(event) => setKickLand(event.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="">Kick Land</option>
              {zones.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex min-h-0 flex-1 gap-2">
          {categoryOptions.length > 0 ? (
            <Column title="Category" active={focus === 'category'}>
              {categoryOptions.map((item, index) => (
                <TagButton
                  key={item.id}
                  column="category"
                  hotkey={hotkeyFor('category', index)}
                  selected={item.id === categoryId}
                  onClick={() => chooseCategory(item.id)}
                >
                  {item.name}
                </TagButton>
              ))}
            </Column>
          ) : null}

          <Column title="Metric" active={focus === 'metric'}>
            {categoryOptions.length > 0 && categoryId == null ? (
              <p className="px-1 py-6 text-xs text-muted-foreground">
                Choose a category.
              </p>
            ) : metricList.length === 0 ? (
              <p className="px-1 py-6 text-xs text-muted-foreground">
                No metrics for this match.
              </p>
            ) : (
              metricList.map((item, index) => (
                <TagButton
                  key={item.id}
                  column="metric"
                  hotkey={hotkeyFor('metric', index)}
                  selected={item.id === metricId}
                  onClick={() => chooseMetric(item.id)}
                >
                  {item.name}
                </TagButton>
              ))
            )}
          </Column>

          <Column title="Detail" active={focus === 'detail'}>
            {details.map((item, index) => (
              <TagButton
                key={item.id}
                column="detail"
                hotkey={hotkeyFor('detail', index)}
                selected={item.id === detailId}
                onClick={() => chooseDetail(item.id)}
              >
                {item.name}
              </TagButton>
            ))}
          </Column>

          <Column title="Sub detail" active={focus === 'subdetail'}>
            {subDetails.map((item, index) => (
              <TagButton
                key={item.id}
                column="subdetail"
                hotkey={hotkeyFor('subdetail', index)}
                selected={item.id === subDetailId}
                onClick={() => chooseSubDetail(item.id)}
              >
                {item.name}
              </TagButton>
            ))}
          </Column>

          <Column title="Zone" active={focus === 'zone'}>
            {zones.map((item, index) => (
              <TagButton
                key={item.id}
                column="zone"
                hotkey={hotkeyFor('zone', index)}
                selected={zoneId === item.id}
                onClick={() => chooseZone(item.id)}
              >
                {item.name}
              </TagButton>
            ))}
          </Column>

          <Column title="First 11" active={focus === 'player'} wide>
            {starters.length === 0 ? (
              <p className="px-2 py-6 text-xs text-muted-foreground">
                No lineup yet.
              </p>
            ) : (
              starters.map((entry, index) => (
                <TagButton
                  key={entry.id}
                  column="player"
                  hotkey={hotkeyFor('player', index)}
                  selected={entry.id === playerId}
                  onClick={() => chooseStarter(entry, true)}
                >
                  {playerLabel(entry)}
                </TagButton>
              ))
            )}
          </Column>

          {showSubs ? (
            <Column title="Subs" active={focus === 'bench'}>
              {substitutes.length === 0 ? (
                <p className="px-2 py-6 text-xs text-muted-foreground">
                  No substitutes.
                </p>
              ) : (
                substitutes.map((entry, index) => (
                  <TagButton
                    key={entry.id}
                    column="bench"
                    hotkey={hotkeyFor('bench', index)}
                    selected={entry.id === subPlayerId}
                    onClick={() => chooseBench(entry)}
                  >
                    {playerLabel(entry)}
                  </TagButton>
                ))
              )}
            </Column>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            <KeyMark>Esc</KeyMark>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => void saveEvent('another')}
          >
            {saving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <KeyMark>N</KeyMark>
            )}
            Save and save another
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void saveEvent('video')}
          >
            {saving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <KeyMark>Enter</KeyMark>
            )}
            Save and tag more
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
