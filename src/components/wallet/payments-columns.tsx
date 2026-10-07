import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import { PaymentActions } from '#/components/wallet/payment-actions'
import type { Payment } from '#/lib/types'
import { cn } from '#/lib/utils'

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

function statusLabel(payment: Payment) {
  if (payment.void_status) return 'Void'
  return 'Pending'
}

function statusClassName(payment: Payment) {
  if (payment.void_status) {
    return 'bg-destructive/15 text-destructive'
  }
  return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
}

export const paymentsGlobalFilter: FilterFn<Payment> = (
  row,
  _columnId,
  filterValue,
) => {
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
    payment.created_by,
    payment.entity,
    statusLabel(payment),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        #{row.original.id}
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
          Entity {row.original.entity}
          {row.original.is_withdraw ? ' · Withdraw' : ''}
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
  {
    accessorKey: 'date_created',
    header: 'Created',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDate(row.original.date_created)}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium',
          statusClassName(row.original),
        )}
      >
        {statusLabel(row.original)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PaymentActions payment={row.original} />,
  },
]
