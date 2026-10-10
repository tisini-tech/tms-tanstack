import type { SimpleFixture, TimelineEvent } from '#/lib/types'
import { cn } from '#/lib/utils'

/** Substitute metrics: football, rugby7, rugby15, rugby10, basketball, rugby, hockey, handball. */
const SUBSTITUTE_EVENT_IDS = new Set([17, 39, 52, 110, 226, 252, 284, 285])

type HighlightsProps = {
  timeline: TimelineEvent[]
  fixture: SimpleFixture
}

function substitutionPair(event: TimelineEvent) {
  if (!SUBSTITUTE_EVENT_IDS.has(event.event_id)) return null

  return {
    playerIn: event.subplayer_name || '',
    playerOut: event.player_name || '',
  }
}

function eventTone(event: TimelineEvent) {
  const label = `${event.event_name} ${event.subevent_name}`.toLowerCase()
  if (label.includes('goal') || label.includes('score')) return 'text-emerald-500'
  if (label.includes('red')) return 'text-red-500'
  if (label.includes('yellow')) return 'text-yellow-500'
  return 'text-foreground'
}

function EventCard({
  event,
  align,
  substitution,
}: {
  event: TimelineEvent
  align: 'left' | 'right'
  substitution: { playerIn: string; playerOut: string } | null
}) {
  const detail =
    event.subevent_name &&
    event.subevent_name.toLowerCase() !== event.event_name.toLowerCase()
      ? event.subevent_name
      : null

  return (
    <div
      className={cn(
        'max-w-sm rounded-lg border border-border bg-muted/20 px-3 py-2',
        align === 'left' ? 'text-right' : 'text-left',
      )}
    >
      <p className={cn('text-sm font-medium', eventTone(event))}>
        {event.event_name}
      </p>
      {detail ? (
        <p className="text-xs text-muted-foreground">{detail}</p>
      ) : null}
      {substitution ? (
        <div className="mt-1 space-y-0.5 text-sm">
          <p>
            <span className="text-muted-foreground">In </span>
            {substitution.playerIn || '—'}
          </p>
          <p>
            <span className="text-muted-foreground">Out </span>
            {substitution.playerOut || '—'}
          </p>
        </div>
      ) : event.player_name ? (
        <p className="text-sm text-foreground">{event.player_name}</p>
      ) : null}
    </div>
  )
}

export default function Highlights({ timeline, fixture }: HighlightsProps) {
  const rows = [...timeline]
    .sort((a, b) => a.game_minute - b.game_minute)
    .map((event) => ({
      event,
      substitution: substitutionPair(event),
    }))

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No timeline events for this match.
        </p>
      ) : (
        <ol>
          {rows.map(({ event, substitution }, index) => {
            const isHome = event.team === fixture.home_team_id
            const isAway = event.team === fixture.away_team_id

            return (
              <li
                key={`${event.event_id}-${event.game_minute}-${event.player_name}-${index}`}
                className="grid grid-cols-[1fr_4.5rem_1fr]"
              >
                <div className="flex justify-end px-3 py-2">
                  {isHome ? (
                    <EventCard
                      event={event}
                      align="left"
                      substitution={substitution}
                    />
                  ) : null}
                </div>
                <div className="relative flex justify-center">
                  <div className="absolute inset-y-0 w-px bg-border" />
                  <span className="relative z-10 mt-3 h-fit rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                    {event.game_minute}&apos;
                  </span>
                </div>
                <div className="flex justify-start px-3 py-2">
                  {isAway ? (
                    <EventCard
                      event={event}
                      align="right"
                      substitution={substitution}
                    />
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
