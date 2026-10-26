import { useState } from 'react'
import { format, isSameDay, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'

function parseDay(value: string) {
  return parse(value, 'yyyy-MM-dd', new Date())
}

function dayLabel(date: string, from?: string, to?: string, all?: boolean) {
  if (all) return 'All dates'
  if (from && to) {
    const start = parseDay(from)
    const end = parseDay(to)
    const sameYear = start.getFullYear() === end.getFullYear()
    return `${format(start, sameYear ? 'MMM d' : 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`
  }
  return format(parseDay(date), 'MMM d, yyyy')
}

export function ResponseDatePicker({
  date,
  from,
  to,
  all,
  onDayChange,
  onRangeChange,
}: {
  date: string
  from?: string
  to?: string
  all?: boolean
  onDayChange: (date: string) => void
  onRangeChange: (from: string, to: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'day' | 'range'>(from && to ? 'range' : 'day')
  const [draft, setDraft] = useState<DateRange | undefined>(
    from && to ? { from: parseDay(from), to: parseDay(to) } : undefined,
  )
  const selectedDay = parseDay(date)
  const hasRange = Boolean(from && to)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) return
        setMode(hasRange ? 'range' : 'day')
        setDraft(
          from && to ? { from: parseDay(from), to: parseDay(to) } : undefined,
        )
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-auto min-w-[168px] justify-between font-normal"
          />
        }
      >
        <span>{dayLabel(date, from, to, all)}</span>
        <CalendarIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        <div className="flex gap-1 border-b border-border p-2">
          <Button
            type="button"
            size="sm"
            variant={mode === 'day' ? 'secondary' : 'ghost'}
            className={cn('flex-1', mode === 'day' && 'pointer-events-none')}
            onClick={() => setMode('day')}
          >
            Day
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'range' ? 'secondary' : 'ghost'}
            className={cn('flex-1', mode === 'range' && 'pointer-events-none')}
            onClick={() => setMode('range')}
          >
            Range
          </Button>
        </div>
        {mode === 'day' ? (
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDay}
            defaultMonth={hasRange && from ? parseDay(from) : selectedDay}
            startMonth={new Date(2018, 0)}
            endMonth={new Date()}
            disabled={{ after: new Date() }}
            onSelect={(next) => {
              if (!next) return
              onDayChange(format(next, 'yyyy-MM-dd'))
              setOpen(false)
            }}
          />
        ) : (
          <Calendar
            mode="range"
            captionLayout="dropdown"
            selected={draft}
            defaultMonth={draft?.from ?? selectedDay}
            startMonth={new Date(2018, 0)}
            endMonth={new Date()}
            disabled={{ after: new Date() }}
            onSelect={(range) => {
              setDraft(range)
              if (!range?.from || !range.to || isSameDay(range.from, range.to)) {
                return
              }
              const start = range.from < range.to ? range.from : range.to
              const end = range.from < range.to ? range.to : range.from
              onRangeChange(
                format(start, 'yyyy-MM-dd'),
                format(end, 'yyyy-MM-dd'),
              )
              setOpen(false)
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
