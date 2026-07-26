import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { type ReviewTableData } from './transform-review-stats'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

interface AgentsReviewTableProps {
  tableData: ReviewTableData | null
  teamName: string
}

export function AgentsReviewTable({
  tableData,
  teamName,
}: AgentsReviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (eventId: number) => {
    setExpandedRows((current) => {
      const next = new Set(current)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  if (!teamName) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Select a team to review agent counts.
      </div>
    )
  }

  if (!tableData || tableData.columns.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        No agent data for {teamName}.
      </div>
    )
  }

  const { fixtureLabel, teamLabel, columns, rows } = tableData

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{fixtureLabel}</p>
        <p className="text-lg font-semibold">{teamLabel}</p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="max-h-[600px] overflow-auto">
          <Table className="w-full table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-40" />
              <col className="w-40" />
              {columns.map((column) => (
                <col key={column.key} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead />
                <TableHead>Event</TableHead>
                <TableHead>Sub-Event</TableHead>
                {columns.map((column) => (
                  <TableHead key={column.key} className="text-center">
                    {column.agentLabel}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((event) => (
                <Fragment key={event.eventId}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => toggleRow(event.eventId)}
                  >
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRow(event.eventId)
                        }}
                      >
                        {expandedRows.has(event.eventId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="truncate font-medium">
                      {event.eventName}
                    </TableCell>
                    <TableCell className="truncate text-muted-foreground">
                      —
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={`${event.eventId}-${column.key}`}
                        className="text-center font-medium tabular-nums"
                      >
                        {event.values[column.key] ?? 0}
                      </TableCell>
                    ))}
                  </TableRow>

                  {expandedRows.has(event.eventId) &&
                    event.subEvents.map((subEvent) => (
                      <TableRow
                        key={`${event.eventId}-${subEvent.subeventId}`}
                        className="bg-muted/20 hover:bg-muted/30"
                      >
                        <TableCell />
                        <TableCell className="text-muted-foreground">
                          └
                        </TableCell>
                        <TableCell className="truncate text-muted-foreground">
                          {subEvent.name}
                        </TableCell>
                        {columns.map((column) => (
                          <TableCell
                            key={`${event.eventId}-${subEvent.subeventId}-${column.key}`}
                            className="text-center tabular-nums text-muted-foreground"
                          >
                            {subEvent.values[column.key] ?? 0}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
