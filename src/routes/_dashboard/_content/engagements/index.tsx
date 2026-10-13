import {
  engagementColumns,
  engagementsGlobalFilter,
} from '#/components/engagements/columns'
import { DataTable } from '#/components/ui/data-table'
import { getEngagementsFn } from '#/data/engagements'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/engagements/')({
  loader: async () => {
    const engagements = await getEngagementsFn()

    return { engagements }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { engagements } = Route.useLoaderData()
  const rows = engagements ?? []

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          Engagements
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} engagement{rows.length === 1 ? '' : 's'}
        </p>
      </div>

      <DataTable
        columns={engagementColumns}
        data={rows}
        searchPlaceholder="Search title, type, status…"
        emptyMessage="No engagements found."
        globalFilterFn={engagementsGlobalFilter}
        pageSize={20}
      />
    </div>
  )
}
