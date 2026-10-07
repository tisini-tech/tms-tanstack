import { createFileRoute } from '@tanstack/react-router'

import {
  estimateColumns,
  estimatesGlobalFilter,
} from '#/components/wallet/estimates-columns'
import { CreateEstimateModal } from '#/components/wallet/create-estimate-modal'
import { DataTable } from '#/components/ui/data-table'
import { getEstimatesFn } from '#/data/payments'

export const Route = createFileRoute('/_dashboard/_content/wallet/estimates')({
  loader: async () => {
    const estimates = await getEstimatesFn()
    return { estimates }
  },
  component: EstimatesPage,
})

function EstimatesPage() {
  const { estimates } = Route.useLoaderData()
  const rows = estimates || []

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Estimates
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} estimate{rows.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CreateEstimateModal kind="revenue" />
          <CreateEstimateModal kind="deduction" />
        </div>
      </div>

      <DataTable
        columns={estimateColumns}
        data={rows}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No estimates found."
        globalFilterFn={estimatesGlobalFilter}
      />
    </div>
  )
}
