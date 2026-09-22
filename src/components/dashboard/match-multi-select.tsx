import { useMemo, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import type { DashboardMatch } from '#/lib/types'
import { cn } from '#/lib/utils'
import {
  type DashboardFilters,
  isAllMatchesSelected,
  selectedMatchIds,
  setMatchSelection,
} from '#/components/dashboard/dashboard-filters'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Field, FieldLabel } from '#/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

type MatchMultiSelectProps = {
  matches: DashboardMatch[]
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
}

export function MatchMultiSelect({
  matches,
  filters,
  onFiltersChange,
}: MatchMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const allIds = useMemo(
    () => matches.map((match) => match.match_id),
    [matches],
  )
  const selected = selectedMatchIds(filters, allIds)
  const allSelected = isAllMatchesSelected(filters)
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const triggerLabel = allSelected
    ? '(All)'
    : selected.length === 0
      ? 'No matches'
      : selected.length === 1
        ? (matches.find((match) => match.match_id === selected[0])?.label ??
          '1 match')
        : `${selected.length} matches`

  function toggleAll(checked: boolean) {
    onFiltersChange(setMatchSelection(filters, checked ? allIds : [], allIds))
  }

  function toggleMatch(matchId: number, checked: boolean) {
    const next = checked
      ? [...selected, matchId]
      : selected.filter((id) => id !== matchId)
    onFiltersChange(setMatchSelection(filters, next, allIds))
  }

  if (matches.length === 0) return null

  return (
    <Field className="w-fit gap-1">
      <FieldLabel className="text-[11px] text-muted-foreground">
        Matches
      </FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-8 min-w-[180px] max-w-[280px] justify-between gap-2 rounded-lg border-border bg-background px-2.5 font-normal shadow-sm',
                'hover:bg-muted/50',
              )}
            />
          }
        >
          <span className="truncate text-xs text-foreground">
            {triggerLabel}
          </span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-80 gap-0 rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          <div className="max-h-72 space-y-0.5 overflow-y-auto p-1">
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted/60">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(value) => toggleAll(value === true)}
              />
              <span className="font-medium text-foreground">(All)</span>
            </label>

            <div className="mx-1 my-1 border-t border-border" />

            {matches.map((match) => (
              <label
                key={match.match_id}
                className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted/60"
              >
                <Checkbox
                  checked={selectedSet.has(match.match_id)}
                  className="mt-0.5"
                  onCheckedChange={(value) =>
                    toggleMatch(match.match_id, value === true)
                  }
                />
                <span className="leading-snug text-foreground">
                  {match.label}
                </span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  )
}
