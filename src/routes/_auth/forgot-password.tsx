import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon, MailIcon, SmartphoneIcon } from 'lucide-react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { cn } from '@/lib/utils'
import { requestOtpFn } from '#/data/auth'
import { Button } from '#/components/ui/button'
import { InputField } from '#/components/general/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'

type RecoveryMethod = 'phone' | 'email'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPassword,
})

function ForgotPassword() {
  const [method, setMethod] = useState<RecoveryMethod>('email')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      phone: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const identifier = method === 'phone' ? value.phone : value.email

      try {
        await requestOtpFn({ data: { identifier } })
        navigate({ to: '/reset-password' })
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'An unknown error occurred',
        )
      }
    },
  })

  const switchMethod = (next: RecoveryMethod) => {
    setMethod(next)
    setSubmitError(null)
    form.setFieldMeta('phone', (meta) => ({
      ...meta,
      errors: [],
      errorMap: {},
    }))
    form.setFieldMeta('email', (meta) => ({
      ...meta,
      errors: [],
      errorMap: {},
    }))
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Forgot password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter your phone or email and we&apos;ll send a one-time code to reset
          your password.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1"
        role="tablist"
        aria-label="Recovery method"
      >
        <button
          type="button"
          role="tab"
          aria-selected={method === 'phone'}
          onClick={() => switchMethod('phone')}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs font-semibold tracking-wide uppercase transition-colors',
            method === 'phone'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <SmartphoneIcon className="size-3.5 shrink-0" aria-hidden />
          Phone
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === 'email'}
          onClick={() => switchMethod('email')}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-xs font-semibold tracking-wide uppercase transition-colors',
            method === 'email'
              ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <MailIcon className="size-3.5 shrink-0" aria-hidden />
          Email
        </button>
      </div>

      <form
        noValidate
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-6">
          {method === 'phone' ? (
            <form.Field
              name="phone"
              children={(field) => (
                <InputField
                  field={field}
                  id="forgot-phone"
                  label="Phone number"
                  type="tel"
                  placeholder="0712 345 678"
                  autoComplete="tel"
                  className="gap-2.5"
                  inputClassName="h-12 rounded-xl px-3.5"
                />
              )}
            />
          ) : (
            <form.Field
              name="email"
              children={(field) => (
                <InputField
                  field={field}
                  id="forgot-email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="gap-2.5"
                  inputClassName="h-12 rounded-xl px-3.5"
                />
              )}
            />
          )}

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
              phone: state.values.phone,
              email: state.values.email,
            })}
            children={({ isSubmitting, phone, email }) => (
              <Button
                disabled={
                  isSubmitting ||
                  (method === 'phone' ? !phone.trim() : !email.trim())
                }
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-sm font-semibold tracking-wide"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  'Send reset code'
                )}
              </Button>
            )}
          />

          <FieldDescription className="text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
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
