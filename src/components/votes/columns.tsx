import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import type { VoteCause } from '#/types/voting'

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

function formationNames(formation: VoteCause['formation']) {
  if (!formation) return []
  const items = Array.isArray(formation) ? formation : [formation]
  return items.map((item) => item.name)
}

function text(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

export const votesGlobalFilter: FilterFn<VoteCause> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!query) return true

  const cause = row.original
  const haystack = [
    cause.reason,
    cause.kind,
    cause.vote_mode,
    ...formationNames(cause.formation),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export const voteColumns: ColumnDef<VoteCause>[] = [
  {
    accessorKey: 'reason',
    header: 'Vote',
    cell: ({ row }) => (
      <p className="min-w-56 max-w-md truncate font-medium text-heading">
        {text(row.original.reason)}
      </p>
    ),
  },
  {
    accessorKey: 'kind',
    header: 'Kind',
    cell: ({ row }) => (
      <span className="text-sm">{text(row.original.kind)}</span>
    ),
  },
  {
    accessorKey: 'vote_mode',
    header: 'Mode',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {text(row.original.vote_mode)}
      </span>
    ),
  },
  {
    accessorKey: 'picks_required',
    header: 'Picks',
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.picks_required ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'date_from',
    header: 'From',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDate(row.original.date_from)}
      </span>
    ),
  },
  {
    accessorKey: 'date_to',
    header: 'To',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDate(row.original.date_to)}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link
        to="/votes/$voteId"
        params={{ voteId: String(row.original.id) }}
        className="text-sm"
      >
        <Button variant="outline" size="sm">
          More
        </Button>
      </Link>
    ),
  },
]
