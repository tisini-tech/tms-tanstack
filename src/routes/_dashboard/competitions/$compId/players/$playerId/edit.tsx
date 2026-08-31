import { z } from 'zod'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { EditPlayerForm } from '#/components/players/edit-player'
import { getCountriesFn } from '#/data/auth'
import { getPlayersFn, mergeSeasonPlayers } from '#/data/players'

export const Route = createFileRoute(
  '/_dashboard/competitions/$compId/players/$playerId/edit',
)({
  validateSearch: z.object({
    teamId: z.coerce.number(),
    teamName: z.string().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId, seasonId } }) => ({ teamId, seasonId }),
  loader: async ({ params, deps: { teamId, seasonId } }) => {
    const playerId = Number(params.playerId)
    if (!Number.isFinite(playerId) || playerId <= 0) {
      throw notFound()
    }

    const teamIdStr = String(teamId)
    const [countries, roster] = await Promise.all([
      getCountriesFn(),
      getPlayersFn({ data: { teamId: teamIdStr } }),
    ])

    const players =
      seasonId != null
        ? mergeSeasonPlayers(
            roster,
            await getPlayersFn({
              data: { teamId: teamIdStr, seasonId },
            }).catch(() => []),
          )
        : roster

    const entry = players.find((player) => player.id === playerId)
    if (!entry) {
      throw notFound()
    }

    return { countries, entry, seasonId }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { countries, entry, seasonId } = Route.useLoaderData()
  const search = Route.useSearch()

  return (
    <EditPlayerForm
      entry={entry}
      countries={countries}
      seasonId={seasonId}
      backSearch={{
        teamId: search.teamId,
        ...(search.teamName?.trim()
          ? { teamName: search.teamName.trim() }
          : {}),
        ...(search.seasonId != null ? { seasonId: search.seasonId } : {}),
        ...(search.divisionId != null ? { divisionId: search.divisionId } : {}),
        ...(search.categoryId != null ? { categoryId: search.categoryId } : {}),
      }}
    />
  )
}
