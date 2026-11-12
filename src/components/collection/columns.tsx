import type { ColumnDef } from '@tanstack/react-table'

import type { AgentFixture } from '#/lib/types'
import { Button } from '../ui/button'
import { Link, useSearch } from '@tanstack/react-router'

function clock(fixture: AgentFixture) {
  const status = fixture.game_status?.toLowerCase().replace(/\s+/g, '') ?? ''
  if (status === 'notstarted') return '—'

  const minute = fixture.minute ?? 0
  const second = fixture.second ?? 0
  if (second > 0) {
    return `${minute}:${String(second).padStart(2, '0')}`
  }
  return `${minute}'`
}

function MatchCell({ fixture }: { fixture: AgentFixture }) {
  return (
    <div className="flex min-w-[18rem] items-center gap-3">
      <span className="min-w-0 flex-1 truncate text-right font-medium text-primary">
        {fixture.team1_name || '—'}
      </span>
      <span className="flex shrink-0 flex-col items-center">
        <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-sm font-bold tabular-nums text-foreground">
          {fixture.home_score ?? 0}
          <span className="px-1 font-normal text-muted-foreground">-</span>
          {fixture.away_score ?? 0}
        </span>
        <span className="mt-1 text-xs font-medium tabular-nums text-muted-foreground">
          {clock(fixture)}
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-destructive">
        {fixture.team2_name || '—'}
      </span>
    </div>
  )
}

function FixtureMoreLink({ fixture }: { fixture: AgentFixture }) {
  // const { seasonId, divisionId, categoryId } = useSearch({
  //   from: '/_dashboard/_content/competitions/collection/',
  // })

  return (
    <Button
      variant="outline"
      render={
        <Link
          to="/competitions/collection/$fixId"
          params={{
            fixId: fixture.id.toString(),
          }}
        />
      }
      nativeButton={false}
    >
      More
    </Button>
  )
}

export const columns: ColumnDef<AgentFixture>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    id: 'match',
    accessorFn: (row) =>
      `${row.team1_name} ${row.home_score} ${row.away_score} ${row.team2_name} ${row.minute}`,
    header: 'Match',
    cell: ({ row }) => <MatchCell fixture={row.original} />,
  },
  {
    accessorKey: 'game_status',
    header: 'Status',
    cell: ({ row }) => row.original.game_status || '—',
  },
  {
    accessorKey: 'matchday',
    header: 'Matchday',
    cell: ({ row }) => row.original.matchday?.trim() || '—',
  },
  {
    accessorKey: 'fixture_type',
    header: 'Match Type',
    cell: ({ row }) => row.original.fixture_type || '—',
  },
  {
    accessorKey: 'game_moment',
    header: 'Moment',
    cell: ({ row }) => row.original.game_moment || '—',
  },
  {
    id: 'actions',
    cell: ({ row }) => <FixtureMoreLink fixture={row.original} />,
  },
]
