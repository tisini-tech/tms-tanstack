import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouteContext, useRouter } from '@tanstack/react-router'
import { Loader2Icon, PencilIcon } from 'lucide-react'

import { InputField } from '#/components/general/forms/input-field'
import { SelectField } from '#/components/general/forms/select-field'
import { updateUserFn } from '#/data/users'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { FieldGroup } from '#/components/ui/field'
import { userProfileSchema } from '#/lib/schemas'
import type { UserProfileSchema } from '#/lib/schemas'
import { appRoles } from '#/lib/roles'
import type { User } from '#/lib/types'

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function userName(user: User) {
  const parts = [user.first_name, user.last_name, user.sir_name]
    .map(text)
    .filter(Boolean)
  if (parts.length) return parts.join(' ')
  return text(user.name) || user.email
}

export function userPhone(user: User) {
  return text(user.phone_number) || text(user.phone) || '—'
}

export function roleName(role: number) {
  return appRoles.find((item) => item.id === role)?.name ?? `Role ${role}`
}

function profileValues(user: User): UserProfileSchema {
  return {
    firstName: text(user.first_name),
    lastName: text(user.last_name),
    sirName: text(user.sir_name),
    username: text(user.username),
    email: text(user.email),
    phoneNumber: text(user.phone_number) || text(user.phone),
    roleId: String(user.role),
  }
}

function roleOptions(roleId: number) {
  const options = appRoles.map((role) => ({
    value: String(role.id),
    label: role.name,
  }))
  if (!options.some((option) => option.value === String(roleId))) {
    options.unshift({ value: String(roleId), label: `Role ${roleId}` })
  }
  return options
}

const textFields = [
  { name: 'firstName', label: 'First name', required: true, type: 'text' },
  { name: 'lastName', label: 'Last name', required: true, type: 'text' },
  { name: 'sirName', label: 'Sir name', required: false, type: 'text' },
  { name: 'username', label: 'Username', required: false, type: 'text' },
  { name: 'email', label: 'Email', required: true, type: 'email' },
  { name: 'phoneNumber', label: 'Phone number', required: true, type: 'tel' },
] as const

export default function EditUserModal({ user }: { user: User }) {
  const router = useRouter()
  const { role } = useRouteContext({ from: '/_dashboard' })
  const canEditRole = String(role) === '1'
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const name = userName(user)

  const form = useForm({
    defaultValues: profileValues(user),
    validators: {
      onSubmit: userProfileSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await updateUserFn({
          data: { userId: user.id, ...value },
        })
        await router.invalidate()
        setOpen(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to update user',
        )
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          form.reset(profileValues(user))
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="icon-sm" aria-label={`Edit ${name}`} />
        }
      >
        <PencilIcon className="size-4 text-[#48873b]" />
      </DialogTrigger>
      <DialogContent className="scrollbar-thin max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {name}</DialogTitle>
          <DialogDescription>Update this user profile.</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            {textFields.map((item) => (
              <form.Field key={item.name} name={item.name}>
                {(field) => (
                  <InputField
                    field={field}
                    id={`user-${user.id}-${item.name}`}
                    label={item.label}
                    required={item.required}
                    type={item.type}
                    autoComplete="off"
                    placeholder={
                      item.name === 'username'
                        ? 'Leave blank to keep the current username'
                        : undefined
                    }
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            ))}

            {canEditRole ? (
              <form.Field name="roleId">
                {(field) => (
                  <SelectField
                    field={field}
                    id={`user-${user.id}-role`}
                    label="Role"
                    required
                    options={roleOptions(user.role)}
                    orientation="vertical"
                    className="gap-2"
                    triggerClassName="h-10 rounded-xl"
                  />
                )}
              </form.Field>
            ) : null}

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
