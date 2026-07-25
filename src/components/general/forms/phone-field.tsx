import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Country } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import type { TanStackInputFieldApi } from '@/components/general/forms/input-field'

const DEFAULT_KENYA_ID = 116

export function getDefaultCountry(countries: Country[]): Country | undefined {
  return (
    countries.find((country) => country.id === DEFAULT_KENYA_ID) ??
    countries.find((country) => country.iso_code2 === 'KE') ??
    countries[0]
  )
}

export function PhoneField({
  phoneField,
  countryCodeField,
  countries,
  id = 'phone',
  label = 'Phone number',
  className,
}: {
  phoneField: TanStackInputFieldApi<string>
  countryCodeField: TanStackInputFieldApi<string>
  countries: Country[]
  id?: string
  label?: string
  className?: string
}) {
  const isInvalid =
    (phoneField.state.meta.isTouched && !phoneField.state.meta.isValid) ||
    (countryCodeField.state.meta.isTouched &&
      !countryCodeField.state.meta.isValid)

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  )

  const selectedCountry =
    sortedCountries.find(
      (country) => country.telephone_code === countryCodeField.state.value,
    ) ?? getDefaultCountry(sortedCountries)

  return (
    <Field
      className={cn('gap-2', className)}
      data-invalid={isInvalid ? true : undefined}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <CountryCodePicker
          countries={sortedCountries}
          selected={selectedCountry}
          value={countryCodeField.state.value}
          onChange={(code) => countryCodeField.handleChange(code)}
        />

        <Input
          id={id}
          name={phoneField.name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="712 345 678"
          maxLength={9}
          value={phoneField.state.value}
          onBlur={phoneField.handleBlur}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 9)
            phoneField.handleChange(digits)
          }}
          data-invalid={isInvalid || undefined}
          className="h-12 min-w-0 flex-1 rounded-xl border-border bg-input/40 px-3.5"
        />
      </div>

      {isInvalid ? (
        <FieldError
          errors={[
            ...phoneField.state.meta.errors,
            ...countryCodeField.state.meta.errors,
          ].map((error) =>
            typeof error === 'string'
              ? { message: error }
              : error && typeof error === 'object' && 'message' in error
                ? { message: String((error as { message: unknown }).message) }
                : { message: String(error ?? '') },
          )}
        />
      ) : (
        <p className="text-xs text-muted-foreground">
          Enter 9 digits without the leading 0
        </p>
      )}
    </Field>
  )
}

function CountryCodePicker({
  countries,
  selected,
  value,
  onChange,
}: {
  countries: Country[]
  selected: Country | undefined
  value: string
  onChange: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries

    return countries.filter((country) => {
      const haystack = [
        country.name,
        country.iso_code2,
        country.iso_code3,
        country.telephone_code,
        country.nationality,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [countries, query])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return (
    <div ref={rootRef} className="relative w-full sm:w-[10.5rem]">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Country code"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-border bg-input/40 px-3 text-left text-sm font-semibold transition-colors',
          'hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none',
        )}
      >
        <span className="truncate tabular-nums">
          {selected
            ? `${selected.iso_code2} ${selected.telephone_code}`
            : value || 'Code'}
        </span>
        <ChevronsUpDownIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+0.35rem)] left-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/10 sm:w-72">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <SearchIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search country"
            />
          </div>

          <ul
            role="listbox"
            className="max-h-60 overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                No countries found
              </li>
            ) : (
              filtered.map((country) => {
                const isSelected = country.telephone_code === value

                return (
                  <li key={country.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(country.telephone_code)
                        setOpen(false)
                        setQuery('')
                      }}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-secondary/15 text-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      <span className="w-14 shrink-0 font-semibold tabular-nums">
                        {country.telephone_code}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {country.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {country.iso_code2}
                      </span>
                      {isSelected ? (
                        <CheckIcon className="size-4 shrink-0 text-secondary" />
                      ) : (
                        <span className="size-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
