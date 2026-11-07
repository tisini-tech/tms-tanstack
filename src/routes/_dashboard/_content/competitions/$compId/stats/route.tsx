import { useEffect, useState } from 'react'
import { z } from 'zod'
import { XIcon } from 'lucide-react'
import { createFileRoute, getRouteApi, Outlet } from '@tanstack/react-router'

import { competitionRoundsQueryOptions } from '#/data/competitions'
import { MonthPicker } from '#/components/stats/month-picker'
import { RoundMultiSelect } from '#/components/stats/round-multi-select'
import { teamsQueryOptions } from '#/data/teams'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Input } from '#/components/ui/input'
import { getInitials } from '#/lib/utils'

const competitionRoute = getRouteApi(
  '/_dashboard/_content/competitions/$compId',
)

export const roundsSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  return Array.isArray(value) ? value : [value]
}, z.array(z.string()).optional())

export const minMatchesSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.max(1, Math.trunc(parsed))
}, z.number().int().min(1).optional())

export const panelViewSearchSchema = z
  .enum(['overall', 'attacking', 'defensive', 'goalkeeping'])
  .optional()

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/stats',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
    minMatches: minMatchesSearchSchema,
    teamId: z.coerce.number().optional(),
    panelView: panelViewSearchSchema,
    matchType: z.string().optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId, categoryId } }) => ({
    seasonId,
    divisionId,
    categoryId,
  }),
  loader: async ({
    context,
    params: { compId },
    deps: { seasonId, divisionId, categoryId },
  }) => {
    if (!seasonId) {
      return { rounds: [], teams: [] }
    }

    const [rounds, teams] = await Promise.all([
      context.queryClient.ensureQueryData(
        competitionRoundsQueryOptions(
          String(compId),
          String(seasonId),
          divisionId != null ? String(divisionId) : undefined,
        ),
      ),
      context.queryClient.ensureQueryData(
        teamsQueryOptions(
          String(compId),
          String(seasonId),
          divisionId != null ? String(divisionId) : undefined,
          categoryId != null ? String(categoryId) : undefined,
        ),
      ),
    ])

    return { rounds, teams }
  },
  component: RouteComponent,
})

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex min-w-[180px] flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function RouteComponent() {
  const { competition } = competitionRoute.useLoaderData()
  const { rounds, teams } = Route.useLoaderData()
  const {
    seasonId,
    divisionId,
    categoryId,
    rounds: selectedRounds,
    month,
    teamId,
    minMatches: minMatchesSearch,
  } = Route.useSearch()
  const navigate = Route.useNavigate()
  const selected = selectedRounds ?? []
  const minMatches = minMatchesSearch ?? 3
  const [minMatchesInput, setMinMatchesInput] = useState(String(minMatches))

  const compMatchType = competition?.match_type

  useEffect(() => {
    setMinMatchesInput(String(minMatches))
  }, [minMatches])

  useEffect(() => {
    if (compMatchType) {
      navigate({
        search: (prev) => ({
          ...prev,
          matchType: compMatchType ?? undefined,
        }),
        replace: true,
      })
    }
  }, [compMatchType])

  const season = competition.seasons.find((entry) => entry.id === seasonId)
  const division = competition.divisions.find((entry) => entry.id === divisionId)
  const category = competition.categories.find((entry) => entry.id === categoryId)
  const contextLabel = [season?.name, division?.name, category?.name]
    .filter(Boolean)
    .join(' · ')
  const teamItems = [
    { value: null, label: 'All teams' },
    ...teams.map((team) => ({ value: team.id, label: team.name })),
  ]

  const clearTeam = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        teamId: undefined,
      }),
      replace: true,
    })
  }

  return (
    <div
      data-stats-scroll
      className="scrollbar-thin h-[calc(100dvh-5.5rem)] min-h-0 min-w-0 overflow-auto"
    >
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="lg" className="size-12 rounded-xl after:rounded-xl">
            {competition.logo?.trim() ? (
              <AvatarImage
                src={competition.logo}
                alt={competition.name}
                className="rounded-xl"
              />
            ) : null}
            <AvatarFallback className="rounded-xl text-sm font-medium">
              {getInitials(competition.name) || 'CP'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-heading">
              {competition.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {contextLabel || 'Select a season to load stats'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <FilterField label="Rounds">
            <RoundMultiSelect
              options={rounds}
              value={selected}
              disabled={!seasonId}
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
          </FilterField>

          <FilterField label="Month">
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
          </FilterField>

          <FilterField label="Min matches">
            <Input
              id="stats-min-matches"
              type="text"
              inputMode="numeric"
              value={minMatchesInput}
              className="h-8 w-[180px] border-border bg-background"
              onChange={(event) => {
                const raw = event.currentTarget.value
                if (raw !== '' && !/^\d+$/.test(raw)) return
                setMinMatchesInput(raw)
                const next = Number(raw)
                if (!Number.isInteger(next) || next < 1) return
                navigate({
                  search: (prev) => ({
                    ...prev,
                    minMatches: next === 3 ? undefined : next,
                  }),
                  replace: true,
                })
              }}
              onBlur={() => setMinMatchesInput(String(minMatches))}
            />
          </FilterField>

          <FilterField label="Team">
            <div className="flex items-center gap-1">
              <Select
                items={teamItems}
                value={teamId ?? null}
                onValueChange={(value) =>
                  navigate({
                    search: (prev) => ({
                      ...prev,
                      teamId: value ?? undefined,
                    }),
                    replace: true,
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teamId != null ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear team"
                  onClick={clearTeam}
                >
                  <XIcon />
                </Button>
              ) : null}
            </div>
          </FilterField>
        </div>
      </section>

      <div className="mt-4 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
