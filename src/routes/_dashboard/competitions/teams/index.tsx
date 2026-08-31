import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { ArrowUpRightIcon, CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Combobox } from '@base-ui/react/combobox'
import { Link, createFileRoute } from '@tanstack/react-router'

import type { Competition, Team } from '#/lib/types'
import { cn, getInitials } from '#/lib/utils'
import SearchBar from '#/components/general/search'
import { getTeamsFn } from '#/data/teams'
import { getCompetitionsFn } from '#/data/competitions'
import { EditTeamModal } from '#/components/teams/edit-team'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

export const Route = createFileRoute('/_dashboard/competitions/teams/')({
  validateSearch: z.object({
    competitionId: z.coerce.number().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    registration: z.enum(['all', 'registered', 'fullyRegistered']).optional(),
  }),
  loaderDeps: ({ search: { competitionId, seasonId, divisionId } }) => ({
    competitionId,
    seasonId,
    divisionId,
  }),
  loader: async ({ deps: { competitionId, seasonId, divisionId } }) => {
    const [competitions, teamData] = await Promise.all([
      getCompetitionsFn(),
      getTeamsFn({
        data: {
          ...(competitionId != null
            ? { competitionId: String(competitionId) }
            : {}),
          ...(seasonId != null ? { seasonId: String(seasonId) } : {}),
          ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
        },
      }),
    ])

    return { competitions, teamData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { competitions, teamData } = Route.useLoaderData()
  const { competitionId, seasonId, divisionId, registration = 'all' } =
    Route.useSearch()
  const navigate = Route.useNavigate()

  const [teams, setTeams] = useState<Team[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const registrationItems = [
    { value: 'all', label: 'All teams' },
    { value: 'registered', label: 'With players registered' },
    { value: 'fullyRegistered', label: 'Fully registered' },
  ] as const

  const teamLinkSearch = {
    ...(competitionId != null ? { competitionId } : {}),
    ...(seasonId != null ? { seasonId } : {}),
    ...(divisionId != null ? { divisionId } : {}),
  }

  const competition = competitions.find((c) => c.id === competitionId) ?? null
  const season = competition?.seasons.find((s) => s.id === seasonId) ?? null
  const division =
    competition?.divisions.find((d) => d.id === divisionId) ?? null

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = async () => {
    setIsLoading(true)
    try {
      const response = await getTeamsFn({
        data: {
          search,
          ...(competitionId != null
            ? { competitionId: String(competitionId) }
            : {}),
          ...(seasonId != null ? { seasonId: String(seasonId) } : {}),
          ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
        },
      })
      setTeams(response)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setTeams(teamData)
  }, [teamData])

  const teamsWithPlayers = useMemo(
    () =>
      teams.filter((team) => (team.stats?.players_registered ?? 0) > 0).length,
    [teams],
  )

  const teamsFullyRegistered = useMemo(
    () =>
      teams.filter((team) => (team.stats?.players_fully_registered ?? 0) > 0)
        .length,
    [teams],
  )

  const filteredTeams = useMemo(() => {
    if (registration === 'registered') {
      return teams.filter((team) => (team.stats?.players_registered ?? 0) > 0)
    }
    if (registration === 'fullyRegistered') {
      return teams.filter(
        (team) => (team.stats?.players_fully_registered ?? 0) > 0,
      )
    }
    return teams
  }, [registration, teams])

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        search={search}
        handleSearch={handleSearch}
        handleSearchClick={handleSearchClick}
        isLoading={isLoading}
      />

      <div className="flex flex-wrap gap-2">
        <Combobox.Root
          value={competition}
          onValueChange={(value) =>
            navigate({
              search: (prev) => ({
                ...prev,
                competitionId: value?.id,
                seasonId: value?.seasons[0]?.id,
                divisionId: value?.divisions[0]?.id,
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

        {seasonItems.length > 0 ? (
          <Select
            value={season ? String(season.id) : null}
            items={seasonItems}
            onValueChange={(value) => {
              if (value == null) return
              void navigate({
                search: (prev) => ({
                  ...prev,
                  seasonId: Number(value),
                }),
                replace: true,
              })
            }}
            disabled={!competition}
          >
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Select a season" />
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
              void navigate({
                search: (prev) => ({
                  ...prev,
                  divisionId: Number(value),
                }),
                replace: true,
              })
            }}
            disabled={!competition}
          >
            <SelectTrigger className="min-w-40">
              <SelectValue placeholder="Select a division" />
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{teams.length}</span>{' '}
            {teams.length === 1 ? 'team' : 'teams'}
            {registration !== 'all' ? (
              <>
                {' · showing '}
                <span className="font-medium text-foreground">
                  {filteredTeams.length}
                </span>
              </>
            ) : null}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{teamsWithPlayers}</span>{' '}
            with players registered
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {teamsFullyRegistered}
            </span>{' '}
            fully registered
          </p>
        </div>

        <Select
          value={registration}
          items={[...registrationItems]}
          onValueChange={(value) => {
            if (value == null) return
            void navigate({
              search: (prev) => ({
                ...prev,
                registration:
                  value === 'all'
                    ? undefined
                    : (value as 'registered' | 'fullyRegistered'),
              }),
              replace: true,
            })
          }}
        >
          <SelectTrigger className="min-w-52">
            <SelectValue placeholder="Filter by registration" />
          </SelectTrigger>
          <SelectContent>
            {registrationItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTeams.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {teams.length === 0
            ? 'No teams found.'
            : 'No teams match this registration filter.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              linkSearch={{ teamName: team.name, ...teamLinkSearch }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TeamCard({
  team,
  linkSearch,
}: {
  team: Team
  linkSearch: {
    teamName: string
    competitionId?: number
    seasonId?: number
    divisionId?: number
  }
}) {
  const hasLogo = Boolean(team.teamlogo)
  const stats = team.stats
  const teamSearch = { teamId: team.id, teamName: team.name }

  return (
    <div className="group flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar size="lg" className="size-12 rounded-lg after:rounded-lg">
          {hasLogo ? (
            <AvatarImage
              src={team.teamlogo}
              alt={team.name}
              className="rounded-lg"
            />
          ) : null}
          <AvatarFallback className="rounded-lg text-xs font-medium">
            {getInitials(team.name) || 'TM'}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Link
            to="/competitions/teams/$teamId"
            params={{ teamId: String(team.id) }}
            search={linkSearch}
            className="truncate font-serif text-base font-semibold text-heading hover:underline"
          >
            {team.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            {team.team_type.name}
          </p>
        </div>

        <EditTeamModal team={team} />
      </div>

      {stats ? (
        <dl className="grid grid-cols-3 gap-2 text-xs">
          <StatLink
            label="Players"
            value={stats.players_registered}
            to="/competitions/players"
            search={teamSearch}
          />
          <StatItem
            label="Fully registered"
            value={stats.players_fully_registered}
            highlight={stats.players_fully_registered > 0}
          />
          <StatLink
            label="Games played"
            value={stats.games_played}
            to="/competitions/fixtures"
            search={teamSearch}
          />
          <StatItem label="Won" value={stats.games_won} />
          <StatItem label="Lost" value={stats.games_lost} />
        </dl>
      ) : null}
    </div>
  )
}

function StatLink({
  label,
  value,
  to,
  search,
}: {
  label: string
  value: number
  to: '/competitions/players' | '/competitions/fixtures'
  search: { teamId: number; teamName: string }
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        'group/stat flex flex-col rounded-lg border border-transparent bg-muted/50 px-2.5 py-2 transition-colors',
        'hover:border-primary/25 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <dt className="flex items-center justify-between gap-1 text-[11px] leading-tight text-muted-foreground">
        <span>{label}</span>
        <ArrowUpRightIcon className="size-3 shrink-0 opacity-40 transition-opacity group-hover/stat:opacity-100" />
      </dt>
      <dd className="text-base font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </Link>
  )
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg px-2.5 py-2',
        highlight
          ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20'
          : 'bg-muted/50',
      )}
    >
      <dt className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </dt>
      <dd className="text-base font-semibold tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  )
}
