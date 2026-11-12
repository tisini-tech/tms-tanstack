import { createFileRoute } from '@tanstack/react-router'
import { getAgentFixtures } from '#/data/collection'
import { DataTable } from '#/components/ui/data-table'
import { columns } from '#/components/collection/columns'

export const Route = createFileRoute(
  '/_dashboard/_content/competitions/collection/',
)({
  loader: async () => {
    const fixtures = await getAgentFixtures()
    
    return { fixtures }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixtures } = Route.useLoaderData()

  return <div className="space-y-4">
    <DataTable columns={columns} data={fixtures} />
  </div>
}
