import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { TeamStats } from '#/lib/types'
import { cn } from '#/lib/utils'

type Props = {
  event: TeamStats
}

const EventCardReview = ({ event }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const subEvents = event.sub_events.filter(
    (subEvent) => subEvent.home_count !== 0 || subEvent.away_count !== 0,
  )
  const hasSubEvents = subEvents.length > 0

  return (
    <div className="mb-4">
      <div
        className={cn(
          'flex items-center justify-between overflow-hidden rounded-lg border border-border bg-card',
          hasSubEvents && 'cursor-pointer transition-colors hover:bg-muted/50',
        )}
        onClick={() => hasSubEvents && setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 p-3 text-center">
          <div className="text-2xl font-bold text-primary">
            {event.home_count}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center gap-2 border-x border-border p-3 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {event.event_name}
          </h3>
          {hasSubEvents && (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          )}
        </div>

        <div className="flex-1 p-3 text-center">
          <div className="text-2xl font-bold text-destructive">
            {event.away_count}
          </div>
        </div>
      </div>

      {hasSubEvents && isExpanded && (
        <div className="mt-2 space-y-1">
          {subEvents.map((subEvent) => (
            <div
              key={subEvent.subevent_id}
              className="flex items-center justify-between overflow-hidden rounded-lg border border-border bg-muted/30"
            >
              <div className="flex-1 p-2 text-center">
                <span className="text-sm font-medium text-primary">
                  {subEvent.home_count || '-'}
                </span>
              </div>

              <div className="flex-1 border-x border-border p-2 text-center">
                <span className="text-sm text-muted-foreground">
                  {subEvent.subevent_name}
                </span>
              </div>

              <div className="flex-1 p-2 text-center">
                <span className="text-sm font-medium text-destructive">
                  {subEvent.away_count || '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventCardReview
