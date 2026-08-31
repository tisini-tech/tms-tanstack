import { useEffect } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Combobox } from '@base-ui/react/combobox'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import type { Competition } from '#/lib/types'
import { competitionQueryOptions } from '#/data/competitions'
import {
  competitionFiltersSearch,
  isCompetitionModulePath,
  parseCompIdFromPath,
  rememberCompetitionFilters,
  rememberCompetitionId,
  resolveCompetition,
  resolveCompetitionFilters,
  type CompetitionFilters,
} from '#/lib/competition-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export function CompetitionContextSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.search }) as CompetitionFilters
  const navigate = useNavigate()
  const { data: competitions = [], isLoading } = useQuery(competitionQueryOptions)

  const inModule = isCompetitionModulePath(pathname)
  const pathCompId = parseCompIdFromPath(pathname)
  const onOverview = inModule && !pathCompId
  const competition = inModule
    ? resolveCompetition(competitions, pathname)
    : null

  const filters = competition
    ? resolveCompetitionFilters(competition, search)
    : {}

  useEffect(() => {
    if (!competition) return
    rememberCompetitionId(competition.id)
    rememberCompetitionFilters(competition.id, filters)
  }, [competition, filters.seasonId, filters.divisionId, filters.categoryId])

  if (!inModule) return null

  const seasonItems =
    competition?.seasons.map((entry) => ({
      value: String(entry.id),
      label: entry.name,
    })) ?? []
  const divisionItems =
    competition?.divisions.map((entry) => ({
      value: String(entry.id),
      label: entry.name,
    })) ?? []
  const categoryItems =
    (competition?.categories ?? []).map((entry) => ({
      value: String(entry.id),
      label: entry.name,
    })) ?? []

  const season =
    competition?.seasons.find((entry) => entry.id === filters.seasonId) ?? null
  const division =
    competition?.divisions.find((entry) => entry.id === filters.divisionId) ??
    null
  const category =
    (competition?.categories ?? []).find(
      (entry) => entry.id === filters.categoryId,
    ) ?? null

  const applyFilters = (next: CompetitionFilters) => {
    if (!competition) return
    const merged = resolveCompetitionFilters(competition, {
      ...filters,
      ...next,
    })
    rememberCompetitionFilters(competition.id, merged)
    const searchPatch = competitionFiltersSearch(merged)

    if (onOverview) {
      void navigate({
        to: '/competitions/$compId/teams',
        params: { compId: String(competition.id) },
        search: searchPatch,
      })
      return
    }

    void navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        ...searchPatch,
      }),
      replace: true,
    })
  }

  const goToCompetition = (next: Competition | null) => {
    if (!next) return
    rememberCompetitionId(next.id)
    const nextFilters = resolveCompetitionFilters(next, {})
    rememberCompetitionFilters(next.id, nextFilters)
    const searchPatch = competitionFiltersSearch(nextFilters)

    if (onOverview) {
      void navigate({
        to: '/competitions/$compId/teams',
        params: { compId: String(next.id) },
        search: searchPatch,
      })
      return
    }

    void navigate({
      to: '.',
      params: { compId: String(next.id) },
      search: (prev) => ({
        ...prev,
        ...searchPatch,
      }),
      replace: true,
    })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <Combobox.Root
        value={competition}
        onValueChange={goToCompetition}
        items={competitions}
        itemToStringLabel={(item) => item?.name ?? ''}
        isItemEqualToValue={(a, b) => a?.id === b?.id}
      >
        <Combobox.Trigger
          aria-label="Competition"
          disabled={isLoading}
          className={cn(
            'flex h-8 w-full min-w-0 items-center justify-between gap-1.5 rounded-2xl border border-transparent bg-input/50 px-3 py-2 text-sm transition-[color,box-shadow] outline-none sm:w-[200px]',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
            'data-placeholder:text-muted-foreground',
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            <Combobox.Value placeholder="Select a competition" />
          </span>
          <Combobox.Icon
            render={
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
            }
          />
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner
            className="isolate z-50"
            sideOffset={4}
            align="end"
          >
            <Combobox.Popup
              className={cn(
                'flex max-h-(--available-height) w-(--anchor-width) max-w-[calc(100vw-1.5rem)] min-w-0 flex-col origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5 sm:min-w-[280px]',
                'dark:ring-foreground/10',
                'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
                'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              )}
            >
              <div className="border-b border-border/60 p-2">
                <Combobox.Input
                  placeholder="Search competitions..."
                  className={cn(
                    'h-8 w-full rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                    'placeholder:text-muted-foreground',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                  )}
                />
              </div>

              <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                No competitions found
              </Combobox.Empty>

              <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                {(item: Competition) => (
                  <Combobox.Item
                    key={item.id}
                    value={item}
                    className={cn(
                      'relative flex min-h-7 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
                      'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
                      'data-disabled:pointer-events-none data-disabled:opacity-50',
                    )}
                  >
                    <Combobox.ItemIndicator
                      render={
                        <span className="absolute right-2 flex size-4 items-center justify-center" />
                      }
                    >
                      <CheckIcon className="size-4" />
                    </Combobox.ItemIndicator>
                    <span className="truncate">{item.name}</span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      {competition &&
      (seasonItems.length > 0 ||
        divisionItems.length > 0 ||
        categoryItems.length > 0) ? (
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          {seasonItems.length > 0 ? (
            <Select
              value={season ? String(season.id) : null}
              items={seasonItems}
              onValueChange={(value) => {
                if (value == null) return
                applyFilters({ seasonId: Number(value) })
              }}
            >
              <SelectTrigger className="min-w-0 w-full sm:w-auto sm:min-w-28">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                {seasonItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {divisionItems.length > 0 ? (
            <Select
              value={division ? String(division.id) : null}
              items={divisionItems}
              onValueChange={(value) => {
                if (value == null) return
                applyFilters({ divisionId: Number(value) })
              }}
            >
              <SelectTrigger className="min-w-0 w-full sm:w-auto sm:min-w-28">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent>
                {divisionItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          {categoryItems.length > 0 ? (
            <Select
              value={category ? String(category.id) : null}
              items={categoryItems}
              onValueChange={(value) => {
                if (value == null) return
                applyFilters({ categoryId: Number(value) })
              }}
            >
              <SelectTrigger className="col-span-2 min-w-0 w-full sm:col-auto sm:w-auto sm:min-w-28">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
