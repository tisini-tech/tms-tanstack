import { useMemo, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import type { Metrics } from '#/lib/types'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

type MetricsMultiSelectProps = {
  metrics: Metrics[]
  selectedIds: number[]
  onApply: (eventIds: number[]) => void
}

export function MetricsMultiSelect({
  metrics,
  selectedIds,
  onApply,
}: MetricsMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<number[]>(selectedIds)

  const selectedSet = useMemo(() => new Set(draft), [draft])
  const appliedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const dirty =
    draft.length !== selectedIds.length ||
    draft.some((id) => !appliedSet.has(id))

  const triggerLabel =
    selectedIds.length === 0
      ? 'No metrics'
      : selectedIds.length === 1
        ? (metrics.find((metric) => metric.id === selectedIds[0])?.name ??
          '1 metric')
        : `${selectedIds.length} metrics`

  function handleOpenChange(next: boolean) {
    if (next) setDraft(selectedIds)
    setOpen(next)
  }

  function toggleMetric(metricId: number, checked: boolean) {
    setDraft((prev) =>
      checked
        ? [...prev, metricId]
        : prev.filter((id) => id !== metricId),
    )
  }

  function handleApply() {
    onApply(draft)
    setOpen(false)
  }

  if (metrics.length === 0) return null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'h-8 min-w-[160px] max-w-[240px] justify-between gap-2 rounded-lg border-border bg-background px-2.5 font-normal shadow-sm',
              'hover:bg-muted/50',
            )}
          />
        }
      >
        <span className="truncate text-xs text-foreground">{triggerLabel}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 gap-0 rounded-xl border border-border bg-popover p-0 shadow-lg"
      >
        <div className="scrollbar-thin max-h-72 space-y-0.5 overflow-y-auto p-1">
          {metrics.map((metric) => (
            <label
              key={metric.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted/60"
            >
              <Checkbox
                checked={selectedSet.has(metric.id)}
                onCheckedChange={(value) =>
                  toggleMetric(metric.id, value === true)
                }
              />
              <span className="leading-snug text-foreground">{metric.name}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {draft.length} selected
          </p>
          <Button
            type="button"
            size="sm"
            disabled={draft.length === 0 || !dirty}
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
