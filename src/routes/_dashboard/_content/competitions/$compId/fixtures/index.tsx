import { z } from 'zod'
import { Loader2Icon } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

import { getFixturesFn } from '#/data/fixtures'
import { columns } from '#/components/fixtures/columns'
import { DataTable } from '#/components/fixtures/fixtures-table'
import LoadingComponent from '#/components/general/loading/loading'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/$compId/fixtures/',
)({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
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
    const fixtures = await getFixturesFn({
      data: { compId, seasonId, divisionId, categoryId },
    })

    return { fixtures: fixtures.results ?? [] }
  },
  // Show this as soon as the loader starts, instead of holding the old table.
  pendingMs: 0,
  pendingComponent: LoadingComponent,
  component: RouteComponent,
})



function RouteComponent() {
  const { fixtures } = Route.useLoaderData()

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={fixtures} />
    </div>
  )
}
