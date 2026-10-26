import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon, PencilIcon } from 'lucide-react'

import type { Author } from '#/lib/types'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Textarea } from '#/components/ui/textarea'
import { authorProfileSchema } from '#/lib/schemas'
import type { AuthorProfileSchema } from '#/lib/schemas'
import { updateAuthorFn } from '#/data/articles'
import { InputField } from '#/components/general/forms/input-field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'

function profileValues(author: Author): AuthorProfileSchema {
  return {
    displayName: author.display_name,
    bio: author.bio,
    website: author.website,
    twitter: author.twitter,
    facebook: author.facebook,
    instagram: author.instagram,
    linkedin: author.linkedin,
    youtube: author.youtube,
    isActive: author.is_active ?? true,
  }
}

const textFields = [
  { name: 'website', label: 'Website', placeholder: 'https://' },
  { name: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/' },
  { name: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/' },
  {
    name: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/',
  },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/' },
  { name: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/' },
] as const

export default function EditAuthorModal({ author }: { author: Author }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: profileValues(author),
    validators: {
      onSubmit: authorProfileSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await updateAuthorFn({
          data: { authorId: author.id, ...value },
        })
        await router.invalidate()
        setOpen(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to update author',
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
          form.reset(profileValues(author))
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon className="size-4 text-[#48873b] hover:text-[#48873b]/80" />
      </DialogTrigger>
      <DialogContent className="scrollbar-thin max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {author.display_name || 'author'}</DialogTitle>
          <DialogDescription>Update this author profile.</DialogDescription>
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
            <form.Field name="displayName">
              {(field) => (
                <InputField
                  field={field}
                  id={`author-${author.id}-name`}
                  label="Display name"
                  required
                  type="text"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="bio">
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid ? true : undefined}>
                    <FieldLabel htmlFor={`author-${author.id}-bio`}>
                      Bio
                    </FieldLabel>
                    <Textarea
                      id={`author-${author.id}-bio`}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      rows={3}
                      className="min-h-20 rounded-xl"
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            </form.Field>

            {textFields.map((item) => (
              <form.Field key={item.name} name={item.name}>
                {(field) => (
                  <InputField
                    field={field}
                    id={`author-${author.id}-${item.name}`}
                    label={item.label}
                    type="text"
                    placeholder={item.placeholder}
                    autoComplete="off"
                    className="gap-2"
                    inputClassName="h-10 rounded-xl px-3"
                  />
                )}
              </form.Field>
            ))}

            <form.Field name="isActive">
              {(field) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.state.value}
                    onCheckedChange={(checked) =>
                      field.handleChange(checked === true)
                    }
                  />
                  Active
                </label>
              )}
            </form.Field>

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
