import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { ArrowUpRightIcon } from 'lucide-react'
import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'

import type { Team } from '#/lib/types'
import { cn, getInitials } from '#/lib/utils'
import SearchBar from '#/components/general/search'
import { getTeamsFn } from '#/data/teams'
import { EditTeamModal } from '#/components/teams/edit-team'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

const workspaceRoute = getRouteApi('/_dashboard/competitions/$compId')

export const Route = createFileRoute('/_dashboard/competitions/$compId/teams/')({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    registration: z.enum(['all', 'registered', 'fullyRegistered']).optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId, categoryId } }) => ({
    seasonId,
    divisionId,
    categoryId,
  }),
  loader: async ({
    params: { compId },
    deps: { seasonId, divisionId, categoryId },
  }) => {
    const teamData = await getTeamsFn({
      data: {
        competitionId: compId,
        ...(seasonId != null ? { seasonId: String(seasonId) } : {}),
        ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
        ...(categoryId != null ? { categoryId: String(categoryId) } : {}),
      },
    })

    return { teamData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { teamData } = Route.useLoaderData()
  const { compId } = workspaceRoute.useParams()
  const { seasonId, divisionId, categoryId, registration = 'all' } =
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
    ...(seasonId != null ? { seasonId } : {}),
    ...(divisionId != null ? { divisionId } : {}),
    ...(categoryId != null ? { categoryId } : {}),
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleSearchClick = async () => {
    setIsLoading(true)
    try {
      const response = await getTeamsFn({
        data: {
          search,
          competitionId: compId,
          ...(seasonId != null ? { seasonId: String(seasonId) } : {}),
          ...(divisionId != null ? { divisionId: String(divisionId) } : {}),
          ...(categoryId != null ? { categoryId: String(categoryId) } : {}),
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
              compId={compId}
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
  compId,
  linkSearch,
}: {
  team: Team
  compId: string
  linkSearch: {
    teamName: string
    seasonId?: number
    divisionId?: number
    categoryId?: number
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
            to="/competitions/$compId/teams/$teamId"
            params={{ compId, teamId: String(team.id) }}
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
            to="/competitions/$compId/players"
            params={{ compId }}
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
            to="/competitions/$compId/fixtures"
            params={{ compId }}
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
  params,
  search,
}: {
  label: string
  value: number
  to: '/competitions/$compId/players' | '/competitions/$compId/fixtures'
  params: { compId: string }
  search: { teamId: number; teamName: string }
}) {
  return (
    <Link
      to={to}
      params={params}
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
