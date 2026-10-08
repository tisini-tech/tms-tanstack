import { createFileRoute } from '@tanstack/react-router'

import { CreditPaymentModal } from '#/components/wallet/credit-payment-modal'
import {
  paymentColumns,
  paymentsGlobalFilter,
} from '#/components/wallet/payments-columns'
import { DataTable } from '#/components/ui/data-table'
import { getAccountsFn, getPaymentsFn, getProductsFn } from '#/data/payments'

export const Route = createFileRoute('/_dashboard/_content/wallet/payments')({
  loader: async () => {
    const [payments, products, accounts] = await Promise.all([
      getPaymentsFn(),
      getProductsFn(),
      getAccountsFn({ data: { searchTerm: '', isAdmin: true } }),
    ])
    return { payments, products, accounts }
  },
  component: PaymentsPage,
})

function PaymentsPage() {
  const { payments, products, accounts } = Route.useLoaderData()

  const rows = payments ?? []

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Payments
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} payment{rows.length === 1 ? '' : 's'}
          </p>
        </div>

        <CreditPaymentModal
          products={products ?? []}
          accounts={accounts ?? []}
        />
      </div>

      <DataTable
        columns={paymentColumns}
        data={rows}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No payments found."
        globalFilterFn={paymentsGlobalFilter}
      />
    </div>
  )
}
