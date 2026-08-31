import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'

import { Input } from '../ui/input'
import { Button } from '../ui/button'
import type { Fixture } from '#/lib/types'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { compId } = useParams({ strict: false }) as { compId?: string }
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState<string>('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      rowSelection,
      globalFilter,
    },
    globalFilterFn: 'includesString',
  })

  const getSelectedFixtures = () => {
    return table.getSelectedRowModel().flatRows.map((row) => row.original)
  }

  const getReviewableFixtureIds = (): number[] => {
    return (getSelectedFixtures() as Fixture[])
      .filter((fixture) => fixture.match_status !== 'notstarted')
      .map((fixture) => fixture.id)
  }

  return (
    <>
      <div className="flex items-center justify-between py-4 gap-4">
        <Input
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(String(e.target.value))}
          placeholder="Search all columns..."
          className="max-w-sm"
        />

        <Button
          type="button"
          disabled={getReviewableFixtureIds().length === 0 || !compId}
          render={
            <Link
              to="/competitions/$compId/fixtures/review"
              params={{ compId: compId ?? '' }}
              search={{
                ids: getReviewableFixtureIds().join(','),
              }}
            />
          }
          nativeButton={false}
        >
          Review Selected
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
