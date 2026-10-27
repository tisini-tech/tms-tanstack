import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import type { Fixture } from '#/lib/types'

function label(value: { name: string } | null | undefined) {
  const name = value?.name?.trim()
  return name || '—'
}

function schedule(fixture: Fixture) {
  const date = fixture.match_date?.trim() ?? ''
  const time = fixture.match_time?.trim().slice(0, 5) ?? ''
  const text = [date, time].filter(Boolean).join(' · ')
  return text || '—'
}

export const adminFixtureColumns: ColumnDef<Fixture>[] = [
  {
    id: 'match',
    accessorFn: (row) =>
      `${row.home_team?.name ?? ''} ${row.away_team?.name ?? ''}`,
    header: 'Match',
    cell: ({ row }) => (
      <span className="font-medium">
        {label(row.original.home_team)}
        <span className="px-1.5 font-normal text-muted-foreground">vs</span>
        {label(row.original.away_team)}
      </span>
    ),
  },
  {
    id: 'competition',
    accessorFn: (row) => row.competition?.name ?? '',
    header: 'Competition',
    cell: ({ row }) => label(row.original.competition),
  },
  {
    id: 'season',
    accessorFn: (row) => row.season?.name ?? '',
    header: 'Season',
    cell: ({ row }) => label(row.original.season),
  },
  {
    accessorKey: 'matchday',
    header: 'Matchday',
    cell: ({ row }) => row.original.matchday?.trim() || '—',
  },
  {
    id: 'schedule',
    accessorFn: (row) => schedule(row),
    header: 'Date',
    cell: ({ row }) => schedule(row.original),
  },
  {
    accessorKey: 'match_status',
    header: 'Status',
    cell: ({ row }) => row.original.match_status || '—',
  },
  {
    id: 'actions',
    enableSorting: false,
    enableGlobalFilter: false,
    meta: {
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const fixture = row.original
      return (
        <div className="flex justify-end gap-2">
          {fixture.competition?.id ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  to="/competitions/$compId/fixtures/$fixId"
                  params={{
                    compId: String(fixture.competition.id),
                    fixId: String(fixture.id),
                  }}
                  search={{}}
                />
              }
            >
              View
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/admin/fixtures/add"
                search={{ fixtureId: String(fixture.id) }}
              />
            }
          >
            Edit
          </Button>
        </div>
      )
    },
  },
]
