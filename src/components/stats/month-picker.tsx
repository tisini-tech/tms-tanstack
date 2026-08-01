import { useState } from 'react'
import { format, parse } from 'date-fns'
import { CalendarIcon, XIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

interface MonthPickerProps {
  value?: string
  onChange: (value: string | undefined) => void
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false)

  const selected = value
    ? parse(`${value}-01`, 'yyyy-MM-dd', new Date())
    : undefined

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-[180px] justify-between font-normal"
            />
          }
        >
          <span className={selected ? undefined : 'text-muted-foreground'}>
            {selected ? format(selected, 'MMMM yyyy') : 'Select month'}
          </span>
          <CalendarIcon className="size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto overflow-hidden p-0">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected}
            startMonth={new Date(2018, 0)}
            endMonth={new Date(2035, 11)}
            onSelect={(date) => {
              if (!date) return
              onChange(format(date, 'yyyy-MM'))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear month"
          onClick={() => onChange(undefined)}
        >
          <XIcon className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}
