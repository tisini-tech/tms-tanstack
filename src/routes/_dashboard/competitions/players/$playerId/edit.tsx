import { z } from 'zod'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { EditPlayerForm } from '#/components/players/edit-player'
import { getCountriesFn } from '#/data/auth'
import { getPlayersFn } from '#/data/players'

export const Route = createFileRoute(
  '/_dashboard/competitions/players/$playerId/edit',
)({
  validateSearch: z.object({
    teamId: z.coerce.number(),
    teamName: z.string().optional(),
  }),
  loaderDeps: ({ search: { teamId } }) => ({ teamId }),
  loader: async ({ params, deps: { teamId } }) => {
    const playerId = Number(params.playerId)
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw notFound()
    }

    const [countries, players] = await Promise.all([
      getCountriesFn(),
      getPlayersFn({ data: { teamId: String(teamId) } }),
    ])

    const entry = players.find((player) => player.id === playerId)
    if (!entry) {
      throw notFound()
    }

    return { countries, entry }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { countries, entry } = Route.useLoaderData()
  const { teamId, teamName } = Route.useSearch()

  return (
    <EditPlayerForm
      entry={entry}
      countries={countries}
      backSearch={{
        teamId,
        ...(teamName?.trim() ? { teamName: teamName.trim() } : {}),
      }}
    />
  )
}
