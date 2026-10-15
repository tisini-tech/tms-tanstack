import { createFileRoute } from '@tanstack/react-router'

import { getEstimatesFn } from '#/data/payments'
import { DataTable } from '#/components/ui/data-table'
import {
  estimateColumns,
  estimatesGlobalFilter,
} from '#/components/wallet/estimates-columns'

export const Route = createFileRoute(
  '/_dashboard/_content/wallet/pending-payments',
)({
  loader: async () => {
    const estimates = await getEstimatesFn({ data: { isPending: true } })

    return { estimates }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { estimates } = Route.useLoaderData()

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Pending Payments
          </h1>
        </div>
      </div>

      <DataTable
        columns={estimateColumns}
        data={estimates}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No estimates found."
        globalFilterFn={estimatesGlobalFilter}
      />
    </div>
  )
}
