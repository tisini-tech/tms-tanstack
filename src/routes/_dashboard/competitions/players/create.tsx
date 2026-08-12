import { z } from 'zod'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { CreatePlayerForm } from '#/components/players/create-player'
import { getCountriesFn } from '#/data/auth'
import { getTeamsFn } from '#/data/teams'

export const Route = createFileRoute('/_dashboard/competitions/players/create')({
  validateSearch: z.object({
    teamId: z.coerce.number(),
  }),
  loaderDeps: ({ search: { teamId } }) => ({ teamId }),
  loader: async ({ deps: { teamId } }) => {
    const [countries, teams] = await Promise.all([
      getCountriesFn(),
      getTeamsFn(),
    ])
    const team = teams.find((entry) => entry.id === teamId)
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
