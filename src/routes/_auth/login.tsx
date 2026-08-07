import { z } from 'zod'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon, MailIcon, SmartphoneIcon } from 'lucide-react'
import {
  createFileRoute,
  isRedirect,
  Link,
  useNavigate,
} from '@tanstack/react-router'

import { loginFn } from '#/data/auth'
import { Button } from '#/components/ui/button'
import { cn, resolvePostLoginPath } from '@/lib/utils'
import { getLastModulePath } from '#/lib/last-module'
import { InputField } from '#/components/general/forms/input-field'
import { createLoginSchema, type LoginMethod } from '#/lib/schemas'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'

export type { LoginMethod }

export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: Login,
})

function Login() {
  const [method, setMethod] = useState<LoginMethod>('email')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { redirect } = Route.useSearch()

  const form = useForm({
    defaultValues: {
      email: '',
      phone: '',
      password: '',
    },
    validators: {
      onSubmit: createLoginSchema(method),
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const identifier =
        method === 'email' ? value.email.trim() : value.phone.trim()

      try {
        const { modules } = await loginFn({
          data: {
            identifier,
            password: value.password,
          },
        })
        console.log(modules)
        await navigate({
          to: resolvePostLoginPath(redirect, modules, getLastModulePath()),
          replace: true,
        })
      } catch (error) {
        if (isRedirect(error)) throw error

        const message =
          error instanceof Error ? error.message : 'An unknown error occurred'
        setSubmitError(message)
      }
    },
  })

  const switchMethod = (next: LoginMethod) => {
    setMethod(next)
    setSubmitError(null)
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Back to the Numbers
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Sign in with your phone or email to continue.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted p-1"
        role="tablist"
        aria-label="Login method"
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
          e.stopPropagation()
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
                  id="login-phone"
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
                  id="login-email"
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

          <form.Field
            name="password"
            children={(field) => (
              <InputField
                field={field}
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                className="gap-2.5"
                inputClassName="h-12 rounded-xl px-3.5"
                labelEnd={
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
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
            selector={(state) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                disabled={isSubmitting}
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl text-sm font-semibold tracking-wide"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  'Login'
                )}
              </Button>
            )}
          />
          <FieldDescription className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </form>
    </div>
  )
}
