import { ChevronDownIcon } from 'lucide-react'

import { Checkbox } from '#/components/ui/checkbox'
import type { MatrixDashboard, SimpleFixture } from '#/lib/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export function FixtureMenu({
  matches,
  teamName,
  selectedIds,
  onToggle,
  onSetAll,
}: {
  matches: MatrixDashboard[]
  teamName: string
  selectedIds: Set<number>
  onToggle: (id: number) => void
  onSetAll: (on: boolean) => void
}) {
  const all = selectedIds.size === matches.length
  const only = matches.find((match) => selectedIds.has(match.fixture.id))
  const label =
    selectedIds.size === 0
      ? 'No fixtures'
      : all
        ? 'All fixtures'
        : selectedIds.size === 1 && only
          ? fixtureLabel(only.fixture, teamName).title
          : `${selectedIds.size} fixtures`

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full min-w-0 items-center justify-between gap-1.5 rounded-2xl border border-transparent bg-input/50 px-3 text-sm whitespace-nowrap outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:w-auto sm:min-w-52 sm:max-w-72"
          />
        }
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {selectedIds.size} of {matches.length}
          </p>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onSetAll(!all)}
          >
            {all ? 'Clear' : 'All'}
          </button>
        </div>
        <div className="scrollbar-thin max-h-72 overflow-y-auto p-1">
          {matches.map((match) => {
            const id = match.fixture.id
            const label = fixtureLabel(match.fixture, teamName)
            return (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60"
              >
                <Checkbox
                  checked={selectedIds.has(id)}
                  onCheckedChange={() => onToggle(id)}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{label.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {label.meta}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function fixtureLabel(fixture: SimpleFixture, teamName: string) {
  const date = fixture.match_date
    ? new Date(fixture.match_date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : ''
  const score = `${fixture.home_score}-${fixture.away_score}`
  const side =
    fixture.home_team === teamName
      ? 'home'
      : fixture.away_team === teamName
        ? 'away'
        : null
  const title =
    side === 'home'
      ? `vs ${fixture.away_team}`
      : side === 'away'
        ? `vs ${fixture.home_team}`
        : `${fixture.home_team} vs ${fixture.away_team}`
  return {
    title,
    meta: [date, fixture.matchday, score].filter(Boolean).join(' · '),
  }
}
