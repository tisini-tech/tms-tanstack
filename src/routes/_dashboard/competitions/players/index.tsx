import { z } from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { getPlayersFn } from '#/data/players'
import { getTeamsFn } from '#/data/teams'
import { TeamPlayers } from '#/components/players/team-players'

const SELECT_PLAYER_ROLES = new Set([1, 7])

function canSelectPlayers(role: string | number | null | undefined) {
  const id = Number(role)
  return Number.isFinite(id) && SELECT_PLAYER_ROLES.has(id)
}

export const Route = createFileRoute('/_dashboard/competitions/players/')({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId } }) => ({ teamId }),
  pendingMs: Infinity,
  loader: async ({ deps: { teamId } }) => {
    const teams = await getTeamsFn()
    const selectedTeamId = teamId ?? teams[0]?.id

    if (!selectedTeamId) {
      return {
        teams,
        players: [],
        teamId: undefined as number | undefined,
        selectedTeam: null,
      }
    }

    const listedTeam = teams.find((team) => team.id === selectedTeamId) ?? null
    const players = await getPlayersFn({
      data: { teamId: String(selectedTeamId) },
    })

    return {
      teams,
      players,
      teamId: selectedTeamId,
      selectedTeam: listedTeam,
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
          search: { teamId: team.id },
          replace: true,
        })
      }}
    />
  )
}
