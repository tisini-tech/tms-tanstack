import type { Fixture } from '#/lib/types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '../ui/button'
import { Link, useSearch } from '@tanstack/react-router'
import { Checkbox } from '../ui/checkbox'

function FixtureMoreLink({ fixture }: { fixture: Fixture }) {
  const { teamId, teamName, seasonId, divisionId, categoryId } = useSearch({
    from: '/_dashboard/_content/competitions/$compId/fixtures/',
  })

  return (
    <Button
      variant="outline"
      render={
        <Link
          to="/competitions/$compId/fixtures/$fixId"
          params={{
            compId: String(fixture.competition.id),
            fixId: fixture.id.toString(),
          }}
          search={{
            seasonId,
            divisionId,
            categoryId,
            teamId,
            teamName,
          }}
        />
      }
      nativeButton={false}
    >
      More
    </Button>
  )
}

export const columns: ColumnDef<Fixture>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'home_team.name',
    header: 'Home Team',
  },
  {
    accessorKey: 'away_team.name',
    header: 'Away Team',
  },
  {
    accessorKey: 'match_status',
    header: 'Match Status',
  },
  {
    accessorKey: 'matchday',
    header: 'Matchday',
  },
  {
    accessorKey: 'match_type.type_name',
    header: 'Match Type',
  },
  {
    accessorKey: 'competition.name',
    header: 'Competition',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const fixture = row.original

      return <FixtureMoreLink fixture={fixture} />
    },
  },
]
