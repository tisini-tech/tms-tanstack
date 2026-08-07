import { z } from 'zod'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { Combobox } from '@base-ui/react/combobox'
import { getCompetitionRoundsFn, getCompetitionsFn } from '#/data/competitions'
import type { Competition } from '#/lib/types'
import { MonthPicker } from '#/components/stats/month-picker'
import { RoundMultiSelect } from '#/components/stats/round-multi-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const roundsSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  return Array.isArray(value) ? value : [value]
}, z.array(z.string()).optional())

export const Route = createFileRoute('/_dashboard/competitions/stats')({
  validateSearch: z.object({
    competitionId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
  }),
  loaderDeps: ({ search: { competitionId, seasonId, divisionId } }) => ({
    competitionId,
    seasonId,
    divisionId,
  }),
  loader: async ({ deps: { competitionId, seasonId, divisionId } }) => {
    const competitions = await getCompetitionsFn()

    const rounds =
      competitionId && seasonId
        ? await getCompetitionRoundsFn({
            data: {
              competitionId: String(competitionId),
              seasonId: String(seasonId),
              ...(divisionId && { divisionId: String(divisionId) }),
            },
          })
        : []

    return { competitions, rounds }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { competitions, rounds } = Route.useLoaderData()
  const { competitionId, divisionId, seasonId, rounds: selectedRounds, month } =
    Route.useSearch()
  const navigate = Route.useNavigate()

  const competition = competitions.find((c) => c.id === competitionId) ?? null
  const division =
    competition?.divisions.find((d) => d.id === divisionId) ?? null
  const season = competition?.seasons.find((s) => s.id === seasonId) ?? null
  const selected = selectedRounds ?? []

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Combobox.Root
          value={competition}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                competitionId: value?.id,
                divisionId: value?.divisions[0]?.id,
                seasonId: value?.seasons[0]?.id,
                rounds: undefined,
                month: undefined,
              }),
              replace: true,
            })
          }
          items={competitions}
          itemToStringLabel={(item) => item?.name ?? ''}
          isItemEqualToValue={(a, b) => a?.id === b?.id}
        >
          <Combobox.Trigger
            aria-label="Competition"
            className={cn(
              'flex h-8 w-[240px] items-center justify-between gap-1.5 rounded-2xl border border-transparent bg-input/50 px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none',
              'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
              'data-placeholder:text-muted-foreground',
            )}
          >
            <Combobox.Value placeholder="Select a competition" />
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
              align="start"
            >
              <Combobox.Popup
                className={cn(
                  'flex max-h-(--available-height) w-(--anchor-width) min-w-[280px] flex-col origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5',
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
                      {item.name}
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>

        <Select
          value={division?.id.toString() ?? null}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                divisionId: Number(value),
                rounds: undefined,
              }),
              replace: true,
            })
          }
          disabled={!competition}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a division">
              {division?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {competition?.divisions.map((division) => (
              <SelectItem key={division.id} value={division.id.toString()}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={season?.id.toString() ?? null}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                seasonId: Number(value),
                rounds: undefined,
              }),
              replace: true,
            })
          }
          disabled={!competition}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a season">
              {season?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {competition?.seasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <RoundMultiSelect
          options={rounds}
          value={selected}
          disabled={!competitionId || !seasonId}
          onChange={(nextRounds) =>
            navigate({
              search: (prev) => ({
                ...prev,
                rounds: nextRounds.length > 0 ? nextRounds : undefined,
              }),
              replace: true,
            })
          }
        />

        <MonthPicker
          value={month}
          onChange={(nextMonth) =>
            navigate({
              search: (prev) => ({
                ...prev,
                month: nextMonth,
              }),
              replace: true,
            })
          }
        />
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}
