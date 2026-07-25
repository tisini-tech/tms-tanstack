import z from 'zod'
import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { toast } from '#/components/ui/toast'
import { Button } from '#/components/ui/button'
import { cn, safeInternalPath } from '@/lib/utils'
import { resendOTPFn, verifyFn } from '#/data/auth'
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

export const Route = createFileRoute('/_auth/verify')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: Verify,
})

function Verify() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)

  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const redirectTo = safeInternalPath(redirect)

  const form = useForm({
    defaultValues: {
      otp: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await verifyFn({ data: value })
        void navigate({ to: redirectTo || '/dashboard' })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An unknown error occurred',
        )
      }
    },
  })

  const handleResendOTP = async () => {
    if (isResending) return

    try {
      setIsResending(true)
      await resendOTPFn()
      toast.add({
        title: 'OTP sent successfully',
        description: 'Please check your phone or email for the 6-digit code.',
      })
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'An unknown error occurred',
      )
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Verify your account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Check your phone or email for the 6-digit code we sent to you.
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
                  <FieldLabel htmlFor="verify-otp" className="sr-only">
                    One-time code
                  </FieldLabel>

                  <div className="flex w-full justify-center">
                    <InputOTP
                      id="verify-otp"
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
                              'size-12 rounded-xl border border-border bg-input/40 text-base font-semibold shadow-none first:rounded-xl first:border-l last:rounded-xl',
                              'data-[active=true]:border-ring data-[active=true]:bg-card data-[active=true]:ring-3 data-[active=true]:ring-ring/30',
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
                              'size-12 rounded-xl border border-border bg-input/40 text-base font-semibold shadow-none first:rounded-xl first:border-l last:rounded-xl',
                              'data-[active=true]:border-ring data-[active=true]:bg-card data-[active=true]:ring-3 data-[active=true]:ring-ring/30',
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
                      <button
                        type="button"
                        className="font-semibold text-foreground underline-offset-4 hover:underline"
                        onClick={handleResendOTP}
                      >
                        {isResending ? (
                          <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                          'Resend'
                        )}
                      </button>
                    </FieldDescription>
                  )}
                </Field>
              )
            }}
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
            })}
            children={({ isSubmitting, otp }) => (
              <Button
                disabled={isSubmitting || otp.length < 6}
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-sm font-semibold tracking-wide"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  'Verify account'
                )}
              </Button>
            )}
          />

          <FieldDescription className="text-center text-sm text-muted-foreground">
            Wrong account?{' '}
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
