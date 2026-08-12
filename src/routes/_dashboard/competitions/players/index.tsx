import { z } from 'zod'
import { createFileRoute, useRouterState } from '@tanstack/react-router'

import { getPlayersFn } from '#/data/players'
import { getTeamsFn } from '#/data/teams'
import { TeamPlayers } from '#/components/players/team-players'

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
      }
    }

    const players = await getPlayersFn({
      data: { teamId: String(selectedTeamId) },
    })

    return { teams, players, teamId: selectedTeamId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { teams, players, teamId } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const selectedTeam = teams.find((team) => team.id === teamId) ?? null

  return (
    <TeamPlayers
      teams={teams}
      players={players}
      selectedTeam={selectedTeam}
      isLoading={isLoading}
      onTeamChange={(team) => {
        void navigate({
          search: { teamId: team?.id },
          replace: true,
        })
      }}
    />
  )
}
