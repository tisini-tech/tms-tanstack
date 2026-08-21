import { z } from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { getPlayersFn } from '#/data/players'
import { getTeamsFn, resolveTeamFn } from '#/data/teams'
import { TeamPlayers } from '#/components/players/team-players'
import { isUnresolvedTeamName } from '#/lib/recent-teams'
import type { Team } from '#/lib/types'

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
  }
}

export const Route = createFileRoute('/_dashboard/competitions/players/')({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
    teamName: z.string().optional(),
  }),
  loaderDeps: ({ search: { teamId, teamName } }) => ({ teamId, teamName }),
  pendingMs: Infinity,
  loader: async ({ deps: { teamId, teamName } }) => {
    const teams = await getTeamsFn()
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
        selectedTeam: null as Team | null,
      }
    }

    let selectedTeam =
      teams.find((team) => team.id === selectedTeamId) ?? null

    if (!selectedTeam || isUnresolvedTeamName(selectedTeam.name, selectedTeamId)) {
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

    const players = await getPlayersFn({
      data: { teamId: String(selectedTeamId) },
    })

    return {
      teams,
      players,
      teamId: selectedTeamId,
      selectedTeam,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { teams, players, teamId, selectedTeam } = Route.useLoaderData()
  const { role } = Route.useRouteContext()
  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  return (
    <TeamPlayers
      teams={teams}
      players={players}
      teamId={teamId}
      selectedTeam={selectedTeam}
      isLoading={isLoading}
      canSelect={canSelectPlayers(role)}
      onTeamChange={(team) => {
        if (!team) return
        void navigate({
          search: {
            teamId: team.id,
            ...(isUnresolvedTeamName(team.name, team.id)
              ? {}
              : { teamName: team.name }),
          },
          replace: true,
        })
      }}
    />
  )
}
