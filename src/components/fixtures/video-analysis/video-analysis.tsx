import { useEffect, useMemo, useRef, useState } from 'react'
import { FilterIcon } from 'lucide-react'
import type { ReactSketchCanvasRef } from 'react-sketch-canvas'

import { VideoPlayer } from '#/components/fixtures/video-analysis/video-player'
import { VideoAnalysisEventsList } from '#/components/fixtures/video-analysis/events-list'
import {
  ANNOTATE_COLORS,
  VideoAnnotateToolbar,
  type AnnotateColorId,
} from '#/components/fixtures/video-analysis/video-annotate-toolbar'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  isSecondHalfMoment,
  parseTimestampFromUrl,
  stripVideoTimestamp,
} from '#/lib/video-url'
import type { RawFixtureEvent, SimpleFixture } from '#/lib/types'

const ALL_EVENTS = 'all-events'
const ALL_PLAYERS = 'all-players'
const ALL_TEAMS = 'all-teams'

/** Fixtures after this id store `video_timestamp` in milliseconds (new app). */
const VIDEO_TIMESTAMP_MS_AFTER_FIXTURE_ID = 13495

/** Seconds before the event marker when starting the clip. */
const CLIP_BEFORE_SECONDS = 3
/** Seconds after the event marker when pausing the clip. */
const CLIP_AFTER_SECONDS = 10

type VideoAnalysisProps = {
  fixture: SimpleFixture
  events: RawFixtureEvent[]
}

type UniquePlayer = {
  id: string
  name: string
}

type UniqueEvent = {
  id: string
  name: string
}

/** Normalize event video timestamp to seconds for HTML5 / YouTube seek. */
function toSeekSeconds(videoTimestamp: number, fixtureId: number) {
  if (fixtureId > VIDEO_TIMESTAMP_MS_AFTER_FIXTURE_ID) {
    return videoTimestamp / 1000
  }
  return videoTimestamp
}

function resolveSeekSeconds(
  event: RawFixtureEvent,
  videoUrl: string,
  fixtureId: number,
) {
  if (Number.isFinite(event.video_timestamp) && event.video_timestamp > 0) {
    return toSeekSeconds(event.video_timestamp, fixtureId)
  }

  const fromUrl = parseTimestampFromUrl(videoUrl)
  if (fromUrl != null) return fromUrl

  const minute = Number.isFinite(event.minute) ? event.minute : 0
  const second = Number.isFinite(event.second) ? event.second : 0
  return minute * 60 + second
}

function resolveEventVideoUrl(
  event: RawFixtureEvent,
  fixture: SimpleFixture,
): string {
  const primary = stripVideoTimestamp(fixture.video_url)
  const secondary = stripVideoTimestamp(fixture.video_url2)

  if (isSecondHalfMoment(event.moment) && secondary) {
    return secondary
  }

  return primary || secondary
}

export function VideoAnalysis({ fixture, events }: VideoAnalysisProps) {
  const [selectedTeam, setSelectedTeam] = useState(ALL_TEAMS)
  const [selectedEvent, setSelectedEvent] = useState(ALL_EVENTS)
  const [selectedPlayer, setSelectedPlayer] = useState(ALL_PLAYERS)
  const [activeEventId, setActiveEventId] = useState<number | null>(null)
  const [videoUrl, setVideoUrl] = useState(() =>
    stripVideoTimestamp(fixture.video_url || fixture.video_url2 || ''),
  )
  const [currentTime, setCurrentTime] = useState(0)
  const [clipEnd, setClipEnd] = useState<number | null>(null)
  const [playbackKey, setPlaybackKey] = useState(0)
  const [autoplay, setAutoplay] = useState(false)
  const [annotating, setAnnotating] = useState(false)
  const [annotateColorId, setAnnotateColorId] =
    useState<AnnotateColorId>('yellow')
  const [erasing, setErasing] = useState(false)
  const annotateCanvasRef = useRef<ReactSketchCanvasRef>(null)

  const annotateStrokeColor =
    ANNOTATE_COLORS.find((color) => color.id === annotateColorId)?.value ??
    ANNOTATE_COLORS[0].value

  useEffect(() => {
    annotateCanvasRef.current?.eraseMode(erasing)
  }, [erasing])

  const teamItems = useMemo(
    () => [
      { value: ALL_TEAMS, label: 'All teams' },
      {
        value: String(fixture.home_team_id),
        label: fixture.home_team,
      },
      {
        value: String(fixture.away_team_id),
        label: fixture.away_team,
      },
    ],
    [fixture],
  )

  const { filteredEvents, uniquePlayers, eventItems, playerItems } =
    useMemo(() => {
      const eventsMap = new Map<string, UniqueEvent>()
      const playersMap = new Map<string, UniquePlayer>()

      const teamScoped = events.filter((event) => {
        if (selectedTeam === ALL_TEAMS) return true
        return String(event.team) === selectedTeam
      })

      const filtered = teamScoped.filter((event) => {
        const eventId = String(event.metric?.id ?? '')
        const playerId = event.player ? String(event.player.id) : ''

        const eventMatch =
          selectedEvent === ALL_EVENTS || eventId === selectedEvent
        const playerMatch =
          selectedPlayer === ALL_PLAYERS || playerId === selectedPlayer

        return eventMatch && playerMatch
      })

      for (const event of teamScoped) {
        const eventId = String(event.metric?.id ?? '')
        if (eventId && !eventsMap.has(eventId)) {
          eventsMap.set(eventId, {
            id: eventId,
            name: event.metric?.name || `Event ${eventId}`,
          })
        }

        if (
          selectedEvent === ALL_EVENTS ||
          String(event.metric?.id ?? '') === selectedEvent
        ) {
          if (event.player) {
            const playerId = String(event.player.id)
            if (!playersMap.has(playerId)) {
              playersMap.set(playerId, {
                id: playerId,
                name: event.player.name,
              })
            }
          }
        }
      }

      const uniqueEventsList = Array.from(eventsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      )
      const uniquePlayersList = Array.from(playersMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      )

      return {
        filteredEvents: filtered,
        uniquePlayers: uniquePlayersList,
        eventItems: [
          { value: ALL_EVENTS, label: 'All events' },
          ...uniqueEventsList.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        ],
        playerItems: [
          { value: ALL_PLAYERS, label: 'All players' },
          ...uniquePlayersList.map((player) => ({
            value: player.id,
            label: player.name,
          })),
        ],
      }
    }, [events, selectedTeam, selectedEvent, selectedPlayer])

  useEffect(() => {
    if (selectedPlayer === ALL_PLAYERS) return
    const stillAvailable = uniquePlayers.some(
      (player) => player.id === selectedPlayer,
    )
    if (!stillAvailable) {
      setSelectedPlayer(ALL_PLAYERS)
    }
  }, [uniquePlayers, selectedPlayer])

  function resetFilters() {
    setSelectedTeam(ALL_TEAMS)
    setSelectedEvent(ALL_EVENTS)
    setSelectedPlayer(ALL_PLAYERS)
    setActiveEventId(null)
    setCurrentTime(0)
    setClipEnd(null)
    setAutoplay(false)
    setVideoUrl(
      stripVideoTimestamp(fixture.video_url || fixture.video_url2 || ''),
    )
  }

  function handleEventClick(event: RawFixtureEvent) {
    const nextUrl = resolveEventVideoUrl(event, fixture)
    const eventAt = resolveSeekSeconds(event, nextUrl, fixture.id)
    const seekAt = Math.max(0, eventAt - CLIP_BEFORE_SECONDS)
    const endAt = eventAt + CLIP_AFTER_SECONDS

    setActiveEventId(event.id)
    setVideoUrl(nextUrl)
    setCurrentTime(seekAt)
    setClipEnd(endAt)
    setAutoplay(true)
    setPlaybackKey((key) => key + 1)
  }

  if (!events.length) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
        No match events available for video analysis.
      </div>
    )
  }

  if (!fixture.video_url?.trim() && !fixture.video_url2?.trim()) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
        This fixture has no video URL yet.
      </div>
    )
  }

  return (
    <div className="grid h-[min(calc(100svh-11rem),56rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden bg-muted/20 p-2 sm:p-3">
        <div className="shrink-0">
          <VideoAnnotateToolbar
            enabled={annotating}
            onEnabledChange={(enabled) => {
              setAnnotating(enabled)
              if (!enabled) setErasing(false)
            }}
            colorId={annotateColorId}
            onColorChange={setAnnotateColorId}
            erasing={erasing}
            onErasingChange={setErasing}
            onUndo={() => annotateCanvasRef.current?.undo()}
            onClear={() => annotateCanvasRef.current?.clearCanvas()}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 items-start justify-center overflow-hidden">
          <VideoPlayer
            url={videoUrl}
            currentTime={currentTime}
            clipEnd={clipEnd}
            playbackKey={playbackKey}
            autoplay={autoplay}
            annotating={annotating}
            annotateStrokeColor={annotateStrokeColor}
            annotateResetKey={playbackKey}
            annotateCanvasRef={annotateCanvasRef}
            className="max-h-full w-full"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden border-t border-border lg:border-t-0 lg:border-l">
        <div className="shrink-0 space-y-3 border-b border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Video analysis
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              aria-label="Reset filters"
            >
              <FilterIcon className="size-4" data-icon="inline-start" />
              Reset
            </Button>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="video-team-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Team
            </label>
            <Select
              value={selectedTeam}
              items={teamItems}
              onValueChange={(value) => {
                if (value == null) return
                setSelectedTeam(value)
                setSelectedEvent(ALL_EVENTS)
                setSelectedPlayer(ALL_PLAYERS)
              }}
            >
              <SelectTrigger id="video-team-filter" className="w-full">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                {teamItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="video-event-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Event type
            </label>
            <Select
              value={selectedEvent}
              items={eventItems}
              onValueChange={(value) => {
                if (value == null) return
                setSelectedEvent(value)
              }}
            >
              <SelectTrigger id="video-event-filter" className="w-full">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                {eventItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="video-player-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Player
            </label>
            <Select
              value={selectedPlayer}
              items={playerItems}
              onValueChange={(value) => {
                if (value == null) return
                setSelectedPlayer(value)
              }}
            >
              <SelectTrigger id="video-player-filter" className="w-full">
                <SelectValue placeholder="All players" />
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

        <Separator className="shrink-0" />

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {filteredEvents.length > 0 ? (
            <VideoAnalysisEventsList
              events={filteredEvents}
              onEventClick={handleEventClick}
              activeEventId={activeEventId}
              homeTeamId={fixture.home_team_id}
              homeTeamName={fixture.home_team}
              awayTeamName={fixture.away_team}
            />
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No events match your filters
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
