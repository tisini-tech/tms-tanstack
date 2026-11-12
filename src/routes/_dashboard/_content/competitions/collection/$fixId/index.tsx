import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { useStore } from '#/store/store'
import { toast } from '#/components/ui/toast'
import type { AgentFixture } from '#/lib/types'
import { teamPlayersQuery } from '#/data/players'
import { matchMetricsQuery } from '#/data/collection'
import PitchModal from '#/components/collection/pitch'
import VideoPlayer from '#/components/collection/video-player'
import SelectionModal from '#/components/collection/selection'
import CreateLineupModal from '#/components/collection/lineups'
import MatchEventsList from '#/components/collection/events-list'
import { getFixtureTypesFn, rawEventsQuery } from '#/data/fixtures'
import {
  teamLineupsQuery,
  zonesQuery,
  metricCategoriesQuery,
  agentFixturesQuery,
} from '#/data/collection'
import {
  teamContext,
  isRugby,
  clockSport,
  parseVideoTime,
  matchClock,
  formatVideoTime,
  type TeamSide,
} from '#/components/collection/utils'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/collection/$fixId/',
)({
  loader: async ({ context, params }) => {
    const [fixtures, fixtureTypes] = await Promise.all([
      context.queryClient.ensureQueryData(agentFixturesQuery()),
      getFixtureTypesFn(),
      context.queryClient.ensureQueryData(rawEventsQuery(params.fixId)),
    ])

    const fixture =
      fixtures.find((item) => String(item.id) === params.fixId) ?? null

    await Promise.all([
      context.queryClient.ensureQueryData(
        teamPlayersQuery(fixture?.team1_id ?? 0),
      ),
      context.queryClient.ensureQueryData(
        teamPlayersQuery(fixture?.team2_id ?? 0),
      ),
      context.queryClient.ensureQueryData(
        matchMetricsQuery(fixture?.fixture_type ?? ''),
      ),
      context.queryClient.ensureQueryData(
        teamLineupsQuery(fixture?.id ?? 0, fixture?.team1_id ?? 0),
      ),
      context.queryClient.ensureQueryData(
        teamLineupsQuery(fixture?.id ?? 0, fixture?.team2_id ?? 0),
      ),
      context.queryClient.ensureQueryData(
        zonesQuery(fixture?.fixture_type as string),
      ),
      context.queryClient.ensureQueryData(
        metricCategoriesQuery(fixture?.fixture_type as string),
      ),
    ])

    return { fixture, fixtureTypes }
  },
  component: RouteComponent,
})

function MatchScoreline({ fixture }: { fixture: AgentFixture | null }) {
  if (!fixture) {
    return (
      <p className="text-sm text-foreground">You are collecting this match</p>
    )
  }

  return (
    <div className="flex min-w-0 items-center gap-3 text-sm">
      <span className="truncate font-medium text-primary">
        {fixture.team1_name?.trim() || 'Home'}
      </span>
      <span className="shrink-0 rounded-md border border-border bg-muted/30 px-2 py-0.5 font-bold tabular-nums text-foreground">
        {fixture.home_score ?? 0}
        <span className="px-1 font-normal text-muted-foreground">-</span>
        {fixture.away_score ?? 0}
      </span>
      <span className="truncate font-medium text-destructive">
        {fixture.team2_name?.trim() || 'Away'}
      </span>
    </div>
  )
}

function RouteComponent() {
  const { fixId } = Route.useParams()
  const { fixtureTypes } = Route.useLoaderData()

  const { data: fixtures } = useSuspenseQuery(agentFixturesQuery())

  const fixture = fixtures.find((item) => String(item.id) === fixId) ?? null

  const { data: matchEvents } = useSuspenseQuery(rawEventsQuery(fixId))
  const { data: homePlayers } = useSuspenseQuery(
    teamPlayersQuery(fixture?.team1_id ?? 0),
  )
  const { data: awayPlayers } = useSuspenseQuery(
    teamPlayersQuery(fixture?.team2_id ?? 0),
  )
  const { data: matchMetrics } = useSuspenseQuery(
    matchMetricsQuery(fixture?.fixture_type ?? ''),
  )
  const { data: homeLineups } = useSuspenseQuery(
    teamLineupsQuery(fixture?.id ?? 0, fixture?.team1_id ?? 0),
  )
  const { data: awayLineups } = useSuspenseQuery(
    teamLineupsQuery(fixture?.id ?? 0, fixture?.team2_id ?? 0),
  )
  const { data: zones } = useSuspenseQuery(
    zonesQuery(fixture?.fixture_type as string),
  )
  const { data: metricCategories } = useSuspenseQuery(
    metricCategoriesQuery(fixture?.fixture_type as string),
  )

  const matchType = fixtureTypes.find(
    (type) => type.type_code === fixture?.fixture_type,
  )

  const [activeId, setActiveId] = useState<number | null>(null)
  const [seekTo, setSeekTo] = useState<number | null>(null)
  const [seekKey, setSeekKey] = useState(0)
  const [tagOpen, setTagOpen] = useState(false)
  const [tagAt, setTagAt] = useState(0)
  const [tagKey, setTagKey] = useState(0)
  const [side, setSide] = useState<TeamSide>('home')
  const [locate, setLocate] = useState(false)
  const [pitchOpen, setPitchOpen] = useState(false)
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const [videoFocusKey, setVideoFocusKey] = useState(0)
  const [videoTime, setVideoTime] = useState(0)
  const fixtureNumber = Number(fixId)
  const videoCollection = useStore((state) =>
    state.store.videoCollection?.fixtureId === fixtureNumber
      ? state.store.videoCollection
      : null,
  )
  const updateVideoCollection = useStore((state) => state.updateVideoCollection)
  const firstHalf = videoCollection?.firstHalfTimestamp ?? ''
  const secondHalf = videoCollection?.secondHalfTimestamp ?? ''
  const context = teamContext(fixture, side)
  const contextLineups = side === 'away' ? awayLineups : homeLineups
  const sportCode = matchType?.type_code ?? fixture?.fixture_type
  const rugby = isRugby(sportCode, matchType?.type_name)
  const sport = clockSport(sportCode, matchType?.type_name)
  const firstHalfSeconds = parseVideoTime(firstHalf)
  const secondHalfSeconds = parseVideoTime(secondHalf)
  const clock = matchClock(
    videoTime,
    firstHalfSeconds,
    secondHalfSeconds,
    sport,
  )

  function commitHalf(
    field: 'firstHalfTimestamp' | 'secondHalfTimestamp',
    typed: string,
  ) {
    const trimmed = typed.trim()
    const parsed = parseVideoTime(trimmed)
    const value =
      parsed != null
        ? formatVideoTime(parsed)
        : trimmed
          ? trimmed
          : formatVideoTime(videoTime)
    updateVideoCollection({ fixtureId: fixtureNumber, [field]: value })
  }

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[28rem] flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <MatchScoreline fixture={fixture} />

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="min-w-28 text-sm font-medium tabular-nums text-foreground">
            {clock
              ? `${clock.minute}:${String(clock.second).padStart(2, '0')}`
              : '—'}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              {clock ? `${clock.moment} · ${clock.quarter}` : 'Match clock'}
            </span>
          </span>

          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            1st
            <input
              aria-label="First half start"
              value={firstHalf}
              placeholder="0:00"
              onChange={(event) =>
                updateVideoCollection({
                  fixtureId: fixtureNumber,
                  firstHalfTimestamp: event.target.value,
                })
              }
              className="h-8 w-16 rounded-md border border-border bg-background px-2 text-xs text-foreground tabular-nums"
            />
            <button
              type="button"
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
              onClick={() => commitHalf('firstHalfTimestamp', firstHalf)}
            >
              Set
            </button>
          </label>

          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            2nd
            <input
              aria-label="Second half start"
              value={secondHalf}
              placeholder="0:00"
              onChange={(event) =>
                updateVideoCollection({
                  fixtureId: fixtureNumber,
                  secondHalfTimestamp: event.target.value,
                })
              }
              className="h-8 w-16 rounded-md border border-border bg-background px-2 text-xs text-foreground tabular-nums"
            />
            <button
              type="button"
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
              onClick={() => commitHalf('secondHalfTimestamp', secondHalf)}
            >
              Set
            </button>
          </label>

          <select
            aria-label="Team"
            value={side}
            onChange={(event) => setSide(event.target.value as TeamSide)}
            className="h-8 max-w-52 rounded-md border border-border bg-background px-2 text-xs text-foreground"
          >
            <option value="home">
              {fixture?.team1_name?.trim() || 'Home'}
            </option>
            <option value="away">
              {fixture?.team2_name?.trim() || 'Away'}
            </option>
          </select>

          <button
            type="button"
            aria-pressed={locate}
            onClick={() => setLocate((on) => !on)}
            className={`h-8 rounded-md border px-2.5 text-xs ${
              locate
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground'
            }`}
          >
            Location
          </button>
          {homeLineups.length <= 0 && (
            <CreateLineupModal
              title="Home Lineup"
              players={homePlayers ?? []}
              matchType={matchType}
              fixId={Number(fixId)}
            />
          )}

          {awayLineups.length <= 0 && (
            <CreateLineupModal
              title="Away Lineup"
              players={awayPlayers ?? []}
              matchType={matchType}
              fixId={Number(fixId)}
            />
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <VideoPlayer
          seekTo={seekTo}
          seekKey={seekKey}
          suspended={tagOpen || pitchOpen}
          focusKey={videoFocusKey}
          onTime={setVideoTime}
          canTag={firstHalfSeconds != null}
          onTagBlocked={() =>
            toast.add({
              title: 'Set the 1st half',
              description: 'Add a first-half start time before tagging.',
            })
          }
          onTag={(timestamp) => {
            setTagAt(timestamp)
            setTagKey((key) => key + 1)
            setPoint(null)
            if (locate) setPitchOpen(true)
            else setTagOpen(true)
          }}
        />

        <PitchModal
          key={tagKey}
          open={pitchOpen}
          sport={rugby ? 'rugby' : 'football'}
          onOpenChange={setPitchOpen}
          onMark={(next) => {
            setPoint(next)
            setPitchOpen(false)
            setTagOpen(true)
          }}
        />

        <SelectionModal
          key={`selection-${tagKey}`}
          open={tagOpen}
          onOpenChange={setTagOpen}
          metrics={matchMetrics ?? []}
          metricCategories={metricCategories ?? []}
          lineups={contextLineups ?? []}
          zones={zones ?? []}
          teamName={context.name}
          teamId={context.id}
          fixId={Number(fixId)}
          timestamp={tagAt}
          point={point}
          clock={clock}
          onReturnToVideo={() => setVideoFocusKey((key) => key + 1)}
        />

        <MatchEventsList
          fixId={fixtureNumber}
          matchEvents={matchEvents ?? []}
          activeId={activeId}
          onSelect={(event) => {
            setActiveId(event.id)
            setSeekTo(event.video_timestamp ?? 0)
            setSeekKey((key) => key + 1)
          }}
        />
      </div>
    </div>
  )
}
