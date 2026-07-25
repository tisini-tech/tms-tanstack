import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { registerSchema } from '#/lib/schemas'
import { Button } from '#/components/ui/button'
import { getCountriesFn, registerFn } from '#/data/auth'
import { PhoneField } from '#/components/general/forms/phone-field'
import { InputField } from '#/components/general/forms/input-field'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '#/components/ui/field'

export const Route = createFileRoute('/_auth/register')({
  loader: async () => {
    const countries = await getCountriesFn()

    return { countries }
  },
  component: Register,
})

function Register() {
  const { countries } = Route.useLoaderData()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      countryCode: '+254',
      phone: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await registerFn({ data: value })
        void navigate({ to: '/verify' })
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Could not create your account',
        )
      }
    },
  })

  const inputClassName = 'h-12 rounded-xl px-3.5'

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          Create your account
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter your details to start using Tisini.
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
        <FieldGroup className="gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="firstName"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-first-name"
                  label="First name"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  className="gap-2.5"
                  inputClassName={inputClassName}
                />
              )}
            />

            <form.Field
              name="lastName"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-last-name"
                  label="Last name"
                  type="text"
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="gap-2.5"
                  inputClassName={inputClassName}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="username"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-username"
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  autoComplete="username"
                  className="gap-2.5"
                  inputClassName={inputClassName}
                />
              )}
            />

            <form.Field
              name="email"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="gap-2.5"
                  inputClassName={inputClassName}
                />
              )}
            />
          </div>

          <form.Field
            name="countryCode"
            children={(countryCodeField) => (
              <form.Field
                name="phone"
                children={(phoneField) => (
                  <PhoneField
                    countries={countries}
                    countryCodeField={countryCodeField}
                    phoneField={phoneField}
                    id="register-phone"
                    className="gap-2.5"
                  />
                )}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field
              name="password"
              children={(field) => (
                <InputField
                  field={field}
                  id="register-password"
                  label="Password"
                  type="password"
                  placeholder="Min 6 chars + special"
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
                  id="register-confirm-password"
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="gap-2.5"
                  inputClassName={inputClassName}
                />
              )}
            />
          </div>

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
                  'Create account'
                )}
              </Button>
            )}
          />

          <FieldDescription className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </form>
    </div>
  )
}
