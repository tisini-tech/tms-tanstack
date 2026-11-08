import { z } from 'zod'
import { useState } from 'react'
import { format, parse } from 'date-fns'
import { Combobox } from '@base-ui/react/combobox'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react'

import { cn } from '#/lib/utils'
import type { Competition, Fixture } from '#/lib/types'
import { getFixturesFn } from '#/data/fixtures'
import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import { DataTable } from '#/components/ui/data-table'
import { competitionQueryOptions } from '#/data/competitions'
import LoadingComponent from '#/components/general/loading/loading'
import { adminFixtureColumns } from '#/components/admin/fixture-columns'
import { FixtureReviewButton } from '#/components/admin/fixture-review-button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const ALL_DATES = 'all'

function parseDay(value: string) {
  return parse(value, 'yyyy-MM-dd', new Date())
}

function todayKey() {
  return format(new Date(), 'yyyy-MM-dd')
}

function isMatchDay(value: string | undefined): value is string {
  return Boolean(
    value && value !== ALL_DATES && /^\d{4}-\d{2}-\d{2}$/.test(value),
  )
}

function keptId(id: number | undefined, options: Array<{ id: number }>) {
  if (id == null) return undefined
  return options.some((option) => option.id === id) ? id : undefined
}

export const Route = createFileRoute('/_dashboard/_content/admin/fixtures/')({
  validateSearch: z.object({
    matchDate: z.string().optional(),
    compId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    const competitions = await context.queryClient.ensureQueryData(
      competitionQueryOptions,
    )
    const competition = competitions.find((entry) => entry.id === search.compId)
    const compId = competition?.id
    const seasonId = keptId(search.seasonId, competition?.seasons ?? [])
    const divisionId = keptId(search.divisionId, competition?.divisions ?? [])
    const categoryId = keptId(search.categoryId, competition?.categories ?? [])
    const matchDate =
      search.matchDate === undefined ? todayKey() : search.matchDate

    const changed =
      matchDate !== search.matchDate ||
      compId !== search.compId ||
      seasonId !== search.seasonId ||
      divisionId !== search.divisionId ||
      categoryId !== search.categoryId

    if (!changed) return

    throw redirect({
      to: '/admin/fixtures',
      search: { matchDate, compId, seasonId, divisionId, categoryId },
      replace: true,
    })
  },
  loaderDeps: ({
    search: { matchDate, compId, seasonId, divisionId, categoryId },
  }) => ({
    matchDate,
    compId,
    seasonId,
    divisionId,
    categoryId,
  }),
  loader: async ({
    deps: { matchDate, compId, seasonId, divisionId, categoryId },
  }) => {
    const fixtures = await getFixturesFn({
      data: {
        matchDate: isMatchDay(matchDate) ? matchDate : undefined,
        compId: compId != null ? String(compId) : undefined,
        seasonId,
        divisionId,
        categoryId,
      },
    })

    return { fixtures: fixtures.results ?? [] }
  },
  pendingMs: 0,
  pendingComponent: LoadingComponent,
  component: RouteComponent,
})

function RouteComponent() {
  const { fixtures } = Route.useLoaderData()
  const { matchDate, compId, seasonId, divisionId, categoryId } =
    Route.useSearch()
  const navigate = Route.useNavigate()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Fixture[]>([])
  const { data: competitions } = useSuspenseQuery(competitionQueryOptions)

  const competition = competitions.find((entry) => entry.id === compId)
  const selectedDay = isMatchDay(matchDate) ? parseDay(matchDate) : undefined
  const seasons = competition?.seasons ?? []
  const divisions = competition?.divisions ?? []
  const categories = competition?.categories ?? []

  const summary = [
    `${fixtures.length} fixture${fixtures.length === 1 ? '' : 's'}`,
    selectedDay ? `on ${format(selectedDay, 'PPP')}` : null,
    competition?.name,
  ]
    .filter(Boolean)
    .join(' · ')

  const applySearch = (
    patch: Partial<{
      matchDate: string | undefined
      compId: number | undefined
      seasonId: number | undefined
      divisionId: number | undefined
      categoryId: number | undefined
    }>,
  ) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    })
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Fixtures
          </h1>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    data-empty={!selectedDay}
                    className="h-8 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                  />
                }
              >
                <CalendarIcon />
                {selectedDay ? (
                  format(selectedDay, 'PPP')
                ) : (
                  <span>All dates</span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  defaultMonth={selectedDay}
                  onSelect={(day) => {
                    applySearch({
                      matchDate: day ? format(day, 'yyyy-MM-dd') : ALL_DATES,
                    })
                    setOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
            {selectedDay ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Clear date"
                onClick={() => applySearch({ matchDate: ALL_DATES })}
              >
                <XIcon />
              </Button>
            ) : null}
          </div>

          <CompetitionCombobox
            competitions={competitions}
            value={competition ?? null}
            onChange={(next) =>
              applySearch({
                compId: next?.id,
                seasonId: next?.seasons[0]?.id,
                divisionId: next?.divisions[0]?.id,
                categoryId: next?.categories[0]?.id,
              })
            }
          />
          {seasons.length > 0 ? (
            <ContextSelect
              label="Season"
              placeholder="All seasons"
              value={keptId(seasonId, seasons) ?? null}
              options={seasons}
              onChange={(id) => applySearch({ seasonId: id ?? undefined })}
            />
          ) : null}
          {divisions.length > 0 ? (
            <ContextSelect
              label="Division"
              placeholder="All divisions"
              value={keptId(divisionId, divisions) ?? null}
              options={divisions}
              onChange={(id) => applySearch({ divisionId: id ?? undefined })}
            />
          ) : null}
          {categories.length > 0 ? (
            <ContextSelect
              label="Category"
              placeholder="All categories"
              value={keptId(categoryId, categories) ?? null}
              options={categories}
              onChange={(id) => applySearch({ categoryId: id ?? undefined })}
            />
          ) : null}

          <Button
            className="h-8"
            nativeButton={false}
            render={<Link to="/admin/fixtures/add" />}
          >
            <PlusIcon className="size-4" />
            Add Fixture
          </Button>
        </div>
      </div>

      <DataTable
        columns={adminFixtureColumns}
        data={fixtures}
        searchPlaceholder="Search teams, competition, season, or id…"
        emptyMessage={
          selectedDay || competition
            ? 'No fixtures match these filters.'
            : 'No fixtures yet.'
        }
        enableRowSelection
        getRowId={(fixture) => String(fixture.id)}
        onSelectedRowsChange={setSelected}
        toolbar={<FixtureReviewButton fixtures={selected} />}
      />
    </div>
  )
}

function CompetitionCombobox({
  competitions,
  value,
  onChange,
}: {
  competitions: Competition[]
  value: Competition | null
  onChange: (competition: Competition | null) => void
}) {
  const items = [null, ...competitions]

  return (
    <Combobox.Root
      items={items}
      value={value}
      onValueChange={onChange}
      itemToStringLabel={(item) => item?.name ?? 'All competitions'}
      isItemEqualToValue={(left, right) => left?.id === right?.id}
    >
      <Combobox.Trigger
        aria-label="Competition"
        className={cn(
          'flex h-8 w-[13.5rem] max-w-full min-w-0 items-center justify-between gap-1.5 rounded-2xl border border-transparent bg-input/50 px-3 text-sm outline-none',
          'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
          'data-placeholder:text-muted-foreground',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left">
          <Combobox.Value placeholder="All competitions" />
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
              {(item: Competition | null) => (
                <Combobox.Item
                  key={item?.id ?? 'all'}
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
                  <span className="truncate">
                    {item?.name ?? 'All competitions'}
                  </span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function ContextSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  placeholder: string
  value: number | null
  options: Array<Pick<Competition, 'id' | 'name'>>
  onChange: (value: number | null) => void
  className?: string
}) {
  const items = [
    { value: null, label: placeholder },
    ...options.map((option) => ({ value: option.id, label: option.name })),
  ]

  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className={cn('h-8 w-[10.5rem] max-w-full', className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
