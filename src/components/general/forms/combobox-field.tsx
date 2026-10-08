import { Combobox } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import type { TanStackInputFieldApi } from '#/components/general/forms/input-field'
import type { SelectOption } from '#/components/general/forms/select-field'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { cn } from '#/lib/utils'

const triggerClassName = cn(
  'flex h-10 w-full items-center justify-between gap-1.5 rounded-xl border border-transparent bg-input/50 px-3 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  'data-placeholder:text-muted-foreground',
  'aria-invalid:border-destructive',
)

const popupClassName = cn(
  'z-[80] flex max-h-(--available-height) w-(--anchor-width) min-w-[220px] flex-col origin-(--transform-origin) overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/5',
  'dark:ring-foreground/10',
  'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
  'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
)

const itemClassName = cn(
  'relative flex min-h-8 cursor-default items-center gap-2 rounded-xl py-1.5 pr-8 pl-2 text-sm outline-hidden select-none',
  'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
)

type ComboboxFieldProps<T extends string = string> = {
  field: TanStackInputFieldApi<T>
  label: string
  options: SelectOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  required?: boolean
  id?: string
  className?: string
}

export function ComboboxField<T extends string = string>({
  field,
  label,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results',
  required = false,
  id: idProp,
  className,
}: ComboboxFieldProps<T>) {
  const id = idProp ?? field.name
  const isInvalid = field.state.meta.errors.length > 0
  const selected =
    options.find((option) => option.value === field.state.value) ?? null

  return (
    <Field className={cn(className)} data-invalid={isInvalid ? true : undefined}>
      <FieldContent>
        <FieldLabel htmlFor={id}>
          {label}
          {required ? (
            <span className="text-destructive" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </FieldLabel>
        {isInvalid ? (
          <FieldError
            errors={
              field.state.meta.errors as Array<{ message?: string } | undefined>
            }
          />
        ) : null}
      </FieldContent>

      <Combobox.Root
        items={options}
        value={selected}
        onValueChange={(item) => {
          field.handleChange((item?.value ?? '') as T)
          field.handleBlur()
        }}
        itemToStringLabel={(item) => item?.label ?? ''}
        isItemEqualToValue={(a, b) => a?.value === b?.value}
      >
        <Combobox.Trigger
          id={id}
          aria-invalid={isInvalid || undefined}
          className={triggerClassName}
          onBlur={field.handleBlur}
        >
          <Combobox.Value placeholder={placeholder} />
          <Combobox.Icon
            render={
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
            }
          />
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner className="isolate z-[80]" sideOffset={4} align="start">
            <Combobox.Popup className={popupClassName}>
              <div className="border-b border-border/60 p-2">
                <Combobox.Input
                  placeholder={searchPlaceholder}
                  className={cn(
                    'h-8 w-full rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                    'placeholder:text-muted-foreground',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                  )}
                />
              </div>
              <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </Combobox.Empty>
              <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                {(option: SelectOption) => (
                  <Combobox.Item
                    key={option.value}
                    value={option}
                    className={itemClassName}
                  >
                    <Combobox.ItemIndicator
                      render={
                        <span className="absolute right-2 flex size-4 items-center justify-center" />
                      }
                    >
                      <CheckIcon className="size-4" />
                    </Combobox.ItemIndicator>
                    {option.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </Field>
  )
}
