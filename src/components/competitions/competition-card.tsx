import {
  CalendarDaysIcon,
  LayersIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'

import { Link } from '@tanstack/react-router'
import type { Competition } from '#/lib/types'
import { getInitials } from '#/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { cn } from '@/lib/utils'

function latestSeasonName(seasons: Competition['seasons']) {
  if (!seasons.length) return null
  return (
    [...seasons].sort((a, b) => b.name.localeCompare(a.name))[0]?.name ?? null
  )
}

export function CompetitionCard({
  competition,
  className,
}: {
  competition: Competition
  className?: string
}) {
  const hasLogo = Boolean(competition.logo?.trim())
  const seasonCount = competition.seasons.length
  const divisionCount = competition.divisions.length
  const latestSeason = latestSeasonName(competition.seasons)

  return (
    <article
      className={cn(
        'flex gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
    >
      <Avatar size="lg" className="size-14 rounded-xl after:rounded-xl">
        {hasLogo ? (
          <AvatarImage
            src={competition.logo}
            alt={competition.name}
            className="rounded-xl"
          />
        ) : null}
        <AvatarFallback className="rounded-xl text-xs font-medium">
          {getInitials(competition.name) || 'CP'}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate font-medium text-heading">
              <Link
                to="/competitions/$compId"
                params={{ compId: String(competition.id) }}
              >
                {competition.name}
              </Link>
            </h2>

            <p className="truncate text-sm text-muted-foreground">
              {competition.country?.name || 'Unknown country'}
              {competition.country?.iso_code2
                ? ` · ${competition.country.iso_code2}`
                : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Edit ${competition.name}`}
              title="Edit"
              onClick={() => {}}
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label={`Delete ${competition.name}`}
              title="Delete"
              onClick={() => {}}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <LayersIcon className="size-3.5" aria-hidden />
            {divisionCount} {divisionCount === 1 ? 'division' : 'divisions'}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDaysIcon className="size-3.5" aria-hidden />
            {seasonCount} {seasonCount === 1 ? 'season' : 'seasons'}
          </span>
          {latestSeason ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium tabular-nums text-foreground">
              {latestSeason}
            </span>
          ) : null}
        </div>

        {competition.description?.trim() ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {competition.description}
          </p>
        ) : null}
      </div>
    </article>
  )
}
