import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { getEstimatesFn, getProductsFn } from '#/data/payments'
import { DataTable } from '#/components/ui/data-table'
import {
  estimateColumns,
  estimatesGlobalFilter,
} from '#/components/wallet/estimates-columns'
import {
  EstimateSummary,
  groupEstimatesByProduct,
} from '#/components/wallet/estimate-summary'

export const Route = createFileRoute(
  '/_dashboard/_content/wallet/pending-payments',
)({
  loader: async () => {
    const [estimates, products] = await Promise.all([
      getEstimatesFn(),
      getProductsFn(),
    ])

    return { estimates: estimates.results ?? [], products }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { estimates, products } = Route.useLoaderData()
  const rows = estimates || []
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  )

  const groups = useMemo(
    () => groupEstimatesByProduct(rows, products ?? []),
    [rows, products],
  )
  const visibleRows = selectedProductId
    ? rows.filter(
        (estimate) => (estimate.product_id || '') === selectedProductId,
      )
    : rows

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Pending Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            {visibleRows.length} estimate{visibleRows.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <EstimateSummary
        groups={groups}
        selectedProductId={selectedProductId}
        onSelect={setSelectedProductId}
      />

      <DataTable
        columns={estimateColumns}
        data={visibleRows}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No pending payments found."
        globalFilterFn={estimatesGlobalFilter}
      />
    </div>
  )
}
