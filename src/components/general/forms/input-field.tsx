import type { ReactNode } from 'react'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type FieldMeta = {
  errors: Array<unknown>
  isTouched: boolean
  isValid: boolean
}

/** String- or number-backed `<input>` fields from TanStack Form `form.Field`. */
export type TanStackInputFieldApi<T extends string | number = string> = {
  name: string
  state: {
    value: T
    meta: FieldMeta
  }
  handleChange: (value: T) => void
  handleBlur: () => void
}

/** `type="file"` — value is a `File` or none (not a string path). */
export type TanStackFileFieldApi = {
  name: string
  state: {
    value: File | null
    meta: FieldMeta
  }
  handleChange: (value: File | null) => void
  handleBlur: () => void
}

export type InputFieldProps<T extends string | number = string> = {
  field: TanStackInputFieldApi<T>
  label: string
  labelEnd?: ReactNode
  type?: Exclude<
    React.HTMLInputTypeAttribute,
    | 'button'
    | 'checkbox'
    | 'file'
    | 'hidden'
    | 'image'
    | 'radio'
    | 'reset'
    | 'submit'
  >
  placeholder?: string
  autoComplete?: string
  id?: string
  className?: string
  inputClassName?: string
  min?: number | string
  max?: number | string
  step?: number | string
}

export function InputField<T extends string | number = string>({
  field,
  label,
  labelEnd,
  type = 'text',
  placeholder,
  autoComplete,
  id: idProp,
  className,
  inputClassName,
  min,
  max,
  step,
}: InputFieldProps<T>) {
  const id = idProp ?? field.name
  const isInvalid = field.state.meta.errors.length > 0

  const defaultAutoComplete =
    type === 'email'
      ? 'email'
      : type === 'password'
        ? 'current-password'
        : type === 'tel'
          ? 'tel'
          : undefined

  const isNumber = type === 'number'

  return (
    <Field
      className={cn(className)}
      data-invalid={isInvalid ? true : undefined}
    >
      {labelEnd ? (
        <div className="flex items-center gap-2">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <span className="ml-auto">{labelEnd}</span>
        </div>
      ) : (
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      )}
      <Input
        id={id}
        name={field.name}
        type={type}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete ?? defaultAutoComplete}
        placeholder={placeholder}
        value={
          isNumber
            ? (field.state.value as number)
            : (field.state.value as string)
        }
        onBlur={field.handleBlur}
        onChange={(e) => {
          if (isNumber) {
            const raw = e.target.value
            const next = raw === '' ? (0 as T) : (Number(raw) as T)
            field.handleChange(next)
            return
          }
          field.handleChange(e.target.value as T)
        }}
        data-invalid={isInvalid}
        className={inputClassName}
      />

      {isInvalid && (
        <FieldError
          errors={
            field.state.meta.errors as Array<{ message?: string } | undefined>
          }
        />
      )}
    </Field>
  )
}

export type FileInputFieldProps = {
  field: TanStackFileFieldApi
  label: string
  accept?: string
  id?: string
  className?: string
}

/**
 * File inputs are handled separately: they must not use a string `value` like
 * text fields; the form should store `File | null` (e.g. for multipart upload).
 */
export function FileInputField({
  field,
  label,
  accept,
  id: idProp,
  className,
}: FileInputFieldProps) {
  const id = idProp ?? field.name
  const isInvalid = field.state.meta.errors.length > 0

  return (
    <Field
      className={cn(className)}
      data-invalid={isInvalid ? true : undefined}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={field.name}
        type="file"
        accept={accept}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.files?.[0] ?? null)}
        data-invalid={isInvalid}
        className="cursor-pointer file:mr-2 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-2 file:py-1 file:text-sm"
      />
      {field.state.value ? (
        <p className="text-xs text-muted-foreground">
          Selected: {field.state.value.name}
        </p>
      ) : null}

      {isInvalid && (
        <FieldError
          errors={
            field.state.meta.errors as Array<{ message?: string } | undefined>
          }
        />
      )}
    </Field>
  )
}
