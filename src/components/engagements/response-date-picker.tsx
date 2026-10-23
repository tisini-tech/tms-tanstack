import { useState } from 'react'
import { format, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export function ResponseDatePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parse(value, 'yyyy-MM-dd', new Date())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-[168px] justify-between font-normal"
          />
        }
      >
        <span>{format(selected, 'MMM d, yyyy')}</span>
        <CalendarIcon className="size-4 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto overflow-hidden p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          startMonth={new Date(2018, 0)}
          endMonth={new Date()}
          disabled={{ after: new Date() }}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, 'yyyy-MM-dd'))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
