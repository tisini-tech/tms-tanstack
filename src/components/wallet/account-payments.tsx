import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import { DataTable } from '#/components/ui/data-table'
import type { Payment } from '#/lib/types'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatAmount(value: string | null | undefined) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value || '—'
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const paymentsFilter: FilterFn<Payment> = (row, _columnId, filterValue) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true

  const payment = row.original
  const haystack = [
    String(payment.id),
    payment.description,
    payment.debit_amount,
    payment.credit_amount,
    payment.account_name,
    payment.account_number,
    payment.phone_number,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'date_created',
    header: 'Date',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.date_created)}
      </span>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="min-w-0 max-w-md">
        <p className="truncate font-medium text-heading">
          {row.original.description || '—'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          #{row.original.id}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'debit_amount',
    header: 'Debit',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatAmount(row.original.debit_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'credit_amount',
    header: 'Credit',
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatAmount(row.original.credit_amount)}
      </span>
    ),
  },
]

type AccountPaymentsProps = {
  payments: Payment[]
  showHeading?: boolean
}

export function AccountPayments({
  payments,
  showHeading = true,
}: AccountPaymentsProps) {
  return (
    <section className="space-y-3">
      {showHeading ? (
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-heading">
            Payments
          </h2>
          <p className="text-sm text-muted-foreground">
            {payments.length} payment{payments.length === 1 ? '' : 's'}
          </p>
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search description, id, amounts…"
        emptyMessage="No payments yet."
        globalFilterFn={paymentsFilter}
        pageSize={20}
      />
    </section>
  )
}
