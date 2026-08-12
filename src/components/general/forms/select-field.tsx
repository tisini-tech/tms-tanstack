import type { ReactNode } from "react"

import type { TanStackInputFieldApi } from "./input-field"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"


export type SelectOption = {
  value: string
  label: string
}

export type SelectFieldProps<T extends string = string> = {
  field: TanStackInputFieldApi<T>
  label: string
  options: Array<SelectOption>
  /** Helper text under the label (same pattern as shadcn responsive fields). */
  description?: ReactNode
  placeholder?: string
  /** Defaults to `field.name`. */
  id?: string
  /** Matches `Field`: use `responsive` for label left / control right on md+. */
  orientation?: "vertical" | "horizontal" | "responsive"
  className?: string
  triggerClassName?: string
}

export function SelectField<T extends string = string>({
  field,
  label,
  options,
  description,
  placeholder = "Select…",
  id: idProp,
  orientation = "responsive",
  className,
  triggerClassName,
}: SelectFieldProps<T>) {
  const id = idProp ?? field.name
  const isInvalid =
    field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <Field
      className={cn(className)}
      data-invalid={isInvalid ? true : undefined}
      orientation={orientation}
    >
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        {isInvalid ? (
          <FieldError
            errors={
              field.state.meta.errors as Array<
                { message?: string } | undefined
              >
            }
          />
        ) : null}
      </FieldContent>

      <Select
        name={field.name}
        items={options}
        value={field.state.value === "" ? null : field.state.value}
        onValueChange={(value) => {
          if (value != null) field.handleChange(value as T)
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={isInvalid}
          className={cn("min-w-[140px] w-full max-w-full", triggerClassName)}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
