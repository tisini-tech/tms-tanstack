import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import type { Engagement } from '#/lib/types'
import { cn } from '#/lib/utils'
import { Button } from '../ui/button'
import { Link } from '@tanstack/react-router'

const TYPE_LABELS: Record<string, string> = {
  SU: 'Survey',
  QZ: 'Quiz',
  PR: 'Predictor',
}

const STATUS_LABELS: Record<string, string> = {
  DR: 'Draft',
  SC: 'Scheduled',
  OP: 'Open',
  LV: 'Live',
  CL: 'Closed',
  MK: 'Marked',
}

const PLAY_MODE_LABELS: Record<string, string> = {
  AS: 'Async',
  LS: 'Live sync',
}

function label(map: Record<string, string>, value: string | null | undefined) {
  if (!value) return '—'
  return map[value] ?? value
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function statusClassName(status: string) {
  switch (status) {
    case 'OP':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
    case 'LV':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-400'
    case 'SC':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
    case 'CL':
      return 'bg-muted text-muted-foreground'
    case 'MK':
      return 'bg-violet-500/15 text-violet-700 dark:text-violet-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export const engagementsGlobalFilter: FilterFn<Engagement> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true

  const engagement = row.original
  const haystack = [
    engagement.title,
    engagement.description,
    engagement.prize_description,
    label(TYPE_LABELS, engagement.type),
    label(STATUS_LABELS, engagement.status),
    label(PLAY_MODE_LABELS, engagement.play_mode),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export const engagementColumns: ColumnDef<Engagement>[] = [
  {
    accessorKey: 'title',
    header: 'Engagement',
    cell: ({ row }) => {
      const description = row.original.description?.trim()
      const prize = row.original.prize_description?.trim()

      return (
        <div className="min-w-56 max-w-md">
          <p className="truncate font-medium text-heading">
            {row.original.title || '—'}
          </p>
          {description ? (
            <p className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
          {prize ? (
            <p className="truncate text-xs text-muted-foreground">
              Prize: {prize}
            </p>
          ) : null}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <span className="text-sm">{label(TYPE_LABELS, row.original.type)}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={cn(
          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
          statusClassName(row.original.status),
        )}
      >
        {label(STATUS_LABELS, row.original.status)}
      </span>
    ),
  },
  {
    accessorKey: 'play_mode',
    header: 'Play',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {label(PLAY_MODE_LABELS, row.original.play_mode)}
      </span>
    ),
  },
  {
    accessorKey: 'starts_at',
    header: 'Starts',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDate(row.original.starts_at)}
      </span>
    ),
  },
  {
    accessorKey: 'ends_at',
    header: 'Ends',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDate(row.original.ends_at)}
      </span>
    ),
  },
  {
    id: 'access',
    header: 'Access',
    cell: ({ row }) => {
      const payable = row.original.is_payable
      const amount = Number(row.original.amount_payable)

      return (
        <div className="text-sm">
          <p>{row.original.is_public ? 'Public' : 'Private'}</p>
          <p className="text-xs text-muted-foreground">
            {payable && Number.isFinite(amount) && amount > 0
              ? `Paid · ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Free'}
          </p>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link
        to={`/engagements/$engId`}
        params={{ engId: String(row.original.id) }}
        className="text-sm"
      >
        <Button variant="outline" size="sm">
          View
        </Button>
      </Link>
    ),
  },
]
