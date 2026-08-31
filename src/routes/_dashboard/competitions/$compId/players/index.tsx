import { z } from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import type { Team } from '#/lib/types'
import { getTeamsFn, resolveTeamFn } from '#/data/teams'
import { isUnresolvedTeamName } from '#/lib/recent-teams'
import { TeamPlayers } from '#/components/players/team-players'
import { getPlayersFn, mergeSeasonPlayers } from '#/data/players'

const SELECT_PLAYER_ROLES = new Set([1, 7])

function canSelectPlayers(role: string | number | null | undefined) {
  const id = Number(role)
  return Number.isFinite(id) && SELECT_PLAYER_ROLES.has(id)
}

/** Enough of a Team for the combobox / page chrome when the squad is outside the first page. */
function teamPlaceholder(id: number, name?: string | null): Team {
  return {
    id,
    name: name?.trim() || `Team ${id}`,
    teamlogo: '',
    team_type: { id: 0, name: '' },
    country: {
      id: 0,
      name: '',
      iso_code2: '',
      iso_code3: '',
      telephone_code: '',
      nationality: '',
    },
    short_name: '',
    pricing: '',
    referral: '',
    organisation_id: 0,
    year_founded: 0,
    website_url: '',
    description: '',
    stats: {
      players_registered: 0,
      players_fully_registered: 0,
      games_played: 0,
      games_won: 0,
      games_lost: 0,
    },
  }
}

export const Route = createFileRoute(
  '/_dashboard/competitions/$compId/players/',
)({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
    teamName: z.string().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId, teamName, seasonId } }) => ({
    teamId,
    teamName,
    seasonId,
  }),
  pendingMs: Infinity,
  loader: async ({
    params: { compId },
    deps: { teamId, teamName, seasonId },
  }) => {
    const teams = await getTeamsFn({
      data: { competitionId: compId },
    })
    const selectedTeamId = teamId ?? teams[0]?.id
    const urlName = teamName?.trim()
    const resolvedName =
      (urlName && !isUnresolvedTeamName(urlName, selectedTeamId)
        ? urlName
        : undefined) ||
      teams.find((team) => team.id === selectedTeamId)?.name ||
      undefined

    if (!selectedTeamId) {
      return {
        teams,
        players: [],
        teamId: undefined as number | undefined,
        seasonId,
        selectedTeam: null as Team | null,
      }
    }

    let selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null

    if (
      !selectedTeam ||
      isUnresolvedTeamName(selectedTeam.name, selectedTeamId)
    ) {
      const resolved = await resolveTeamFn({
        data: {
          teamId: selectedTeamId,
          teamName: resolvedName,
        },
      }).catch(() => null)
      if (resolved) selectedTeam = resolved
    }

    if (!selectedTeam) {
      selectedTeam = teamPlaceholder(selectedTeamId, resolvedName)
    }

    const teamIdStr = String(selectedTeamId)
    const roster = await getPlayersFn({
      data: { teamId: teamIdStr },
    })

    const players =
      seasonId != null
        ? mergeSeasonPlayers(
            roster,
            await getPlayersFn({
              data: { teamId: teamIdStr, seasonId },
            }).catch(() => []),
          )
        : roster.map((entry) => ({
            ...entry,
            season_player_id: entry.season_player_id ?? null,
            front_img: entry.front_img ?? null,
            side_img: entry.side_img ?? null,
            action_img: entry.action_img ?? null,
          }))

    return {
      teams,
      players,
      teamId: selectedTeamId,
      seasonId,
      selectedTeam,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { teams, players, teamId, seasonId, selectedTeam } =
    Route.useLoaderData()
  const { role } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <TeamPlayers
      teams={teams}
      players={players}
      teamId={teamId}
      seasonId={seasonId}
      selectedTeam={selectedTeam}
      isLoading={isLoading}
      canSelect={canSelectPlayers(role)}
      onTeamChange={(team) => {
        if (!team) return
        void navigate({
          search: (prev) => ({
            ...prev,
            teamId: team.id,
            ...(isUnresolvedTeamName(team.name, team.id)
              ? { teamName: undefined }
              : { teamName: team.name }),
          }),
          replace: true,
        })
      }}
    />
  )
}
