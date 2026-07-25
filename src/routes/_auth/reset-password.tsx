import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { cn } from '@/lib/utils'
import { resetPasswordFn } from '#/data/auth'
import { Button } from '#/components/ui/button'
import { InputField } from '#/components/general/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '#/components/ui/input-otp'

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPassword,
})

function ResetPassword() {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await resetPasswordFn({ data: value })
        navigate({ to: '/login' })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An unknown error occurred',
        )
      }
    },
  })

  const inputClassName = 'h-12 rounded-xl px-3.5'
  const otpSlotClassName =
    'size-12 rounded-xl border border-border bg-input/40 text-base font-semibold shadow-none first:rounded-xl first:border-l last:rounded-xl data-[active=true]:border-ring data-[active=true]:bg-card data-[active=true]:ring-3 data-[active=true]:ring-ring/30'

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Reset password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter the code we sent you, then choose a new password.
        </p>
      </header>

      <form
        noValidate
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-6">
          <form.Field
            name="otp"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid

              return (
                <Field
                  className="items-center gap-3"
                  data-invalid={isInvalid ? true : undefined}
                >
                  <FieldLabel htmlFor="reset-otp" className="sr-only">
                    One-time code
                  </FieldLabel>

                  <div className="flex w-full justify-center">
                    <InputOTP
                      id="reset-otp"
                      maxLength={6}
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      containerClassName="gap-3"
                      aria-invalid={isInvalid || undefined}
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              otpSlotClassName,
                              isInvalid && 'border-destructive',
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-muted-foreground/50" />
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <InputOTPSlot
                            key={index + 3}
                            index={index + 3}
                            className={cn(
                              otpSlotClassName,
                              isInvalid && 'border-destructive',
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {isInvalid ? (
                    <FieldError errors={field.state.meta.errors} />
                  ) : (
                    <FieldDescription className="text-center text-sm text-muted-foreground">
                      Didn&apos;t get a code?{' '}
                      <Link
                        to="/forgot-password"
                        className="font-semibold text-foreground underline-offset-4 hover:underline"
                      >
                        Request a new one
                      </Link>
                    </FieldDescription>
                  )}
                </Field>
              )
            }}
          />

          <form.Field
            name="newPassword"
            children={(field) => (
              <InputField
                field={field}
                id="new-password"
                label="New password"
                type="password"
                placeholder="At least 6 characters + a special character"
                autoComplete="new-password"
                className="gap-2.5"
                inputClassName={inputClassName}
              />
            )}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => (
              <InputField
                field={field}
                id="confirm-password"
                label="Confirm password"
                type="password"
                placeholder="Repeat your new password"
                autoComplete="new-password"
                className="gap-2.5"
                inputClassName={inputClassName}
              />
            )}
          />

          {submitError ? (
            <Field>
              <FieldError errors={[{ message: submitError }]} />
            </Field>
          ) : null}
        </FieldGroup>

        <Field className="gap-5">
          <form.Subscribe
            selector={(state) => ({
              isSubmitting: state.isSubmitting,
              otp: state.values.otp,
              newPassword: state.values.newPassword,
              confirmPassword: state.values.confirmPassword,
            })}
            children={({ isSubmitting, otp, newPassword, confirmPassword }) => (
              <Button
                disabled={
                  isSubmitting ||
                  otp.length < 6 ||
                  !newPassword ||
                  !confirmPassword
                }
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-sm font-semibold tracking-wide"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  'Reset password'
                )}
              </Button>
            )}
          />

          <FieldDescription className="text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link
              to="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </FieldDescription>
        </Field>
      </form>
    </div>
  )
}
