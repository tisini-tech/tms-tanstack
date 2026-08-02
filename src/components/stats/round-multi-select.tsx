import { ChevronDownIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'

interface RoundMultiSelectProps {
  options: string[]
  value: string[]
  onChange: (rounds: string[]) => void
  disabled?: boolean
}

export function RoundMultiSelect({
  options,
  value,
  onChange,
  disabled,
}: RoundMultiSelectProps) {
  const selected = new Set(value)

  const toggle = (round: string) => {
    const next = selected.has(round)
      ? value.filter((item) => item !== round)
      : [...value, round]
    onChange(next)
  }

  const label =
    value.length === 0
      ? 'Select rounds'
      : value.length === 1
        ? value[0]
        : `${value.length} rounds selected`

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'h-8 min-w-[160px] justify-between gap-1.5 rounded-2xl border-transparent bg-input/50 px-3 font-normal',
              value.length === 0 && 'text-muted-foreground',
            )}
          />
        }
      >
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 gap-0 p-2">
        {options.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            No rounds available
          </p>
        ) : (
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {options.map((round) => {
              const checked = selected.has(round)

              return (
                <label
                  key={round}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-muted/60"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(round)}
                  />
                  <span>{round}</span>
                </label>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
