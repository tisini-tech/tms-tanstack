import { createFileRoute } from '@tanstack/react-router'

import {
  estimateColumns,
  estimatesGlobalFilter,
} from '#/components/wallet/estimates-columns'
import { CreateEstimateModal } from '#/components/wallet/create-estimate-modal'
import { DataTable } from '#/components/ui/data-table'
import { getAccountsFn, getEstimatesFn, getProductsFn } from '#/data/payments'

export const Route = createFileRoute('/_dashboard/_content/wallet/estimates')({
  loader: async () => {
    const [estimates, products, accounts] = await Promise.all([
      getEstimatesFn(),
      getProductsFn(),
      getAccountsFn({ data: { searchTerm: '', isAdmin: true } }),
    ])
    return { estimates, products, accounts }
  },
  component: EstimatesPage,
})

function EstimatesPage() {
  const { estimates, products, accounts } = Route.useLoaderData()
  const rows = estimates || []

  const estimateProducts = products?.filter((product) => product.debit !== null)

  const estimateDeduction = products?.filter(
    (product) => product.credit !== null,
  )

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
          <CreateEstimateModal
            kind="revenue"
            products={estimateProducts ?? []}
            accounts={accounts ?? []}
          />
          <CreateEstimateModal
            kind="deduction"
            products={estimateDeduction ?? []}
            accounts={accounts ?? []}
          />
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
