import { voteColumns, votesGlobalFilter } from '#/components/votes/columns'
import { DataTable } from '#/components/ui/data-table'
import { voteCauseQueryOptions } from '#/data/votes'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/_content/votes/')({
  loader: async ({ context }) => {
    const causes = await context.queryClient.ensureQueryData(
      voteCauseQueryOptions,
    )

    return { causes }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { causes } = Route.useLoaderData()
  const rows = causes ?? []

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          Votes
        </h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} vote{rows.length === 1 ? '' : 's'}
        </p>
      </div>

      <DataTable
        columns={voteColumns}
        data={rows}
        searchPlaceholder="Search reason, kind, mode…"
        emptyMessage="No votes found."
        globalFilterFn={votesGlobalFilter}
        pageSize={20}
      />
    </div>
  )
}
