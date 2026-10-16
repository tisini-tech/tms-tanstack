import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import {
  estimateColumns,
  estimatesGlobalFilter,
} from '#/components/wallet/estimates-columns'
import {
  EstimateSummary,
  groupEstimatesByProduct,
} from '#/components/wallet/estimate-summary'
import { CreateEstimateModal } from '#/components/wallet/create-estimate-modal'
import { DataTable } from '#/components/ui/data-table'
import { getAccountsFn, getEstimatesFn, getProductsFn } from '#/data/payments'

export const Route = createFileRoute('/_dashboard/_content/wallet/estimates')({
  loader: async ({ context }) => {
    const isAdmin = ['1', '4'].includes(String(context.role))

    const [estimates, products, accounts] = await Promise.all([
      getEstimatesFn({ data: { isAdmin } }),
      getProductsFn(),
      getAccountsFn({ data: { searchTerm: '', isAdmin: true } }),
    ])

    return { estimates: estimates.results ?? [], products, accounts }
  },
  component: EstimatesPage,
})

function EstimatesPage() {
  const { estimates, products, accounts } = Route.useLoaderData()

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

  const estimateProducts = products?.filter((product) => product.debit !== null)

  const estimateDeduction = products?.filter(
    (product) => product.credit !== null,
  )

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Estimates
          </h1>
          <p className="text-sm text-muted-foreground">
            {visibleRows.length} estimate{visibleRows.length === 1 ? '' : 's'}
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

      <EstimateSummary
        groups={groups}
        selectedProductId={selectedProductId}
        onSelect={setSelectedProductId}
      />

      <DataTable
        columns={estimateColumns}
        data={visibleRows}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No estimates found."
        globalFilterFn={estimatesGlobalFilter}
      />
    </div>
  )
}
