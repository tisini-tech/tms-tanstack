import { useEffect, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { CheckIcon, ChevronDownIcon, Loader2Icon, SearchIcon } from 'lucide-react'

import type { TanStackInputFieldApi } from '#/components/general/forms/input-field'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { getAccountsFn } from '#/data/payments'
import type { ClientAccount } from '#/lib/types'
import { cn } from '#/lib/utils'

const triggerClassName = cn(
  'flex h-10 w-full items-center justify-between gap-1.5 rounded-xl border border-transparent bg-input/50 px-3 text-left text-sm transition-[color,box-shadow] outline-none',
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

export function accountNumber(account: ClientAccount) {
  return account.accountNo || account.account_number || ''
}

export function accountName(account: ClientAccount) {
  return account.accountName || account.account_name || ''
}

export function accountPhone(account: ClientAccount) {
  return account.phone_number || account.phoneNo || ''
}

function accountSearchLabel(account: ClientAccount) {
  return [accountNumber(account), accountName(account), accountPhone(account)]
    .filter(Boolean)
    .join(' ')
}

type AccountComboboxFieldProps = {
  field: TanStackInputFieldApi<string>
  accounts: ClientAccount[]
  id: string
  label?: string
  className?: string
}

export function AccountComboboxField({
  field,
  accounts,
  id,
  label = 'Account',
  className,
}: AccountComboboxFieldProps) {
  const [items, setItems] = useState(accounts)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const isInvalid = field.state.meta.errors.length > 0
  const selected =
    items.find((account) => accountNumber(account) === field.state.value) ??
    accounts.find((account) => accountNumber(account) === field.state.value) ??
    null

  useEffect(() => {
    setItems(accounts)
  }, [accounts])

  async function searchAccounts(term = query) {
    const searchTerm = term.trim()
    setSearching(true)
    try {
      const next = await getAccountsFn({
        data: { searchTerm, isAdmin: true },
      })
      setItems(next ?? [])
    } catch {
      setItems([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <Field
      className={cn(className)}
      data-invalid={isInvalid ? true : undefined}
    >
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {isInvalid ? (
          <FieldError
            errors={
              field.state.meta.errors as Array<{ message?: string } | undefined>
            }
          />
        ) : null}
      </FieldContent>

      <Combobox.Root
        items={items}
        value={selected}
        filter={null}
        onInputValueChange={(inputValue) => {
          setQuery(inputValue)
        }}
        onValueChange={(account) => {
          field.handleChange(account ? accountNumber(account) : '')
          field.handleBlur()
        }}
        itemToStringLabel={(account) =>
          account ? accountSearchLabel(account) : ''
        }
        isItemEqualToValue={(a, b) => accountNumber(a) === accountNumber(b)}
      >
        <Combobox.Trigger
          id={id}
          aria-invalid={isInvalid || undefined}
          className={triggerClassName}
          onBlur={field.handleBlur}
        >
          <Combobox.Value placeholder="Select an account">
            {(account: ClientAccount | null) =>
              account ? (
                <span className="truncate">
                  {accountNumber(account)}
                  {accountName(account) ? ` · ${accountName(account)}` : ''}
                </span>
              ) : null
            }
          </Combobox.Value>
          <Combobox.Icon
            render={
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
            }
          />
        </Combobox.Trigger>

        <Combobox.Portal>
          <Combobox.Positioner
            className="isolate z-[80]"
            sideOffset={4}
            align="start"
          >
            <Combobox.Popup className={popupClassName}>
              <div className="flex items-center gap-2 border-b border-border/60 p-2">
                <Combobox.Input
                  placeholder="Search number, name, or account no…"
                  className={cn(
                    'h-8 min-w-0 flex-1 rounded-xl border border-transparent bg-input/50 px-2.5 text-sm outline-none',
                    'placeholder:text-muted-foreground',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
                  )}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    event.preventDefault()
                    event.stopPropagation()
                    void searchAccounts(
                      (event.currentTarget as HTMLInputElement).value,
                    )
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={searching}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void searchAccounts()
                  }}
                >
                  {searching ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <SearchIcon className="size-3.5" />
                  )}
                  Search
                </Button>
              </div>
              <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                No accounts found
              </Combobox.Empty>
              <Combobox.List className="max-h-72 scroll-py-1 overflow-y-auto p-1 outline-none">
                {(account: ClientAccount) => (
                  <Combobox.Item
                    key={account.id ?? accountNumber(account)}
                    value={account}
                    className={itemClassName}
                  >
                    <Combobox.ItemIndicator
                      render={
                        <span className="absolute right-2 flex size-4 items-center justify-center" />
                      }
                    >
                      <CheckIcon className="size-4" />
                    </Combobox.ItemIndicator>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {accountName(account) || 'Unnamed account'}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {accountNumber(account)}
                        {accountPhone(account)
                          ? ` · ${accountPhone(account)}`
                          : ''}
                      </span>
                    </span>
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
