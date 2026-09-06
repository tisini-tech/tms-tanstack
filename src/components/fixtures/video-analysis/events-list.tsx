import type { RawFixtureEvent } from '#/lib/types'
import { cn } from '#/lib/utils'

type VideoAnalysisEventsListProps = {
  events: RawFixtureEvent[]
  onEventClick: (event: RawFixtureEvent) => void
  activeEventId?: number | null
  homeTeamId: number
  homeTeamName: string
  awayTeamName: string
}

function formatClock(minute: number, second: number) {
  const m = Number.isFinite(minute) ? minute : 0
  const s = Number.isFinite(second) ? second : 0
  return `${m}'${String(s).padStart(2, '0')}`
}

export function VideoAnalysisEventsList({
  events,
  onEventClick,
  activeEventId,
  homeTeamId,
  homeTeamName,
  awayTeamName,
}: VideoAnalysisEventsListProps) {
  return (
    <ul className="divide-y divide-border">
      {events.map((event) => {
        const isHome = event.team === homeTeamId
        const teamName = isHome ? homeTeamName : awayTeamName
        const eventName =
          event.metric_detail?.name || event.metric?.name || 'Event'
        const subName = event.metric_sub_detail?.name
        const playerName = event.player?.name || 'Unknown player'
        const isActive = activeEventId === event.id

        return (
          <li key={event.id}>
            <button
              type="button"
              onClick={() => onEventClick(event)}
              className={cn(
                'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors',
                isActive
                  ? 'bg-primary/10'
                  : 'hover:bg-muted/50',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  {eventName}
                  {subName ? (
                    <span className="font-normal text-muted-foreground">
                      {' '}
                      · {subName}
                    </span>
                  ) : null}
                </p>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatClock(event.minute, event.second)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {playerName}
                <span className="text-muted-foreground/70"> · {teamName}</span>
              </p>
              {event.narration?.trim() ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {event.narration}
                </p>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
