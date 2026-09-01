import { z } from 'zod'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { CreatePlayerForm } from '#/components/players/create-player'
import { getCountriesFn } from '#/data/auth'
import { getTeamsFn } from '#/data/teams'

export const Route = createFileRoute('/_dashboard/_content/competitions/$compId/players/create')({
  validateSearch: z.object({
    teamId: z.coerce.number(),
    teamName: z.string().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId, teamName } }) => ({ teamId, teamName }),
  loader: async ({ deps: { teamId, teamName } }) => {
    const search = teamName?.trim() || ''
    const [countries, matches] = await Promise.all([
      getCountriesFn(),
      getTeamsFn({ data: { search } }),
    ])

    const team = matches.find((entry) => entry.id === teamId)
    if (!team) {
      throw notFound()
    }

    return { countries, team }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { countries, team } = Route.useLoaderData()
  return <CreatePlayerForm team={team} countries={countries} />
}
