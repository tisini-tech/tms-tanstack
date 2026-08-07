'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Loader2Icon, PlusIcon } from 'lucide-react'

import { createCategoryFn } from '#/data/articles'
import { InputField } from '#/components/general/forms/input-field'
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'
import { createCategorySchema, type CreateCategorySchema } from '#/lib/schemas'
import type { ArticleCategory } from '#/lib/types'

type CreateCategoryModalProps = {
  onCreated?: (category: ArticleCategory) => void
}

export function CreateCategoryModal({ onCreated }: CreateCategoryModalProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    } satisfies CreateCategorySchema,
    validators: {
      onSubmit: createCategorySchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const category = await createCategoryFn({
          data: {
            name: value.name.trim(),
            description: value.description?.trim() || undefined,
          },
        })
        onCreated?.(category)
        form.reset()
        setOpen(false)
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to create category',
        )
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          form.reset()
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Create category"
            title="Create category"
          />
        }
      >
        <PlusIcon className="size-4" />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>
            Add a category you can assign to articles in this editor.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-8"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            <form.Field name="name">
              {(field) => (
                <InputField
                  field={field}
                  id="create-category-name"
                  label="Name"
                  type="text"
                  placeholder="e.g. Match reports"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.errors.length > 0
                return (
                  <Field
                    className="gap-2"
                    data-invalid={isInvalid ? true : undefined}
                  >
                    <FieldLabel htmlFor="create-category-description">
                      Description
                      <span className="font-normal text-muted-foreground">
                        {' '}
                        (optional)
                      </span>
                    </FieldLabel>
                    <Textarea
                      id="create-category-description"
                      name={field.name}
                      value={field.state.value ?? ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Short note about this category"
                      rows={3}
                      aria-invalid={isInvalid || undefined}
                      className="min-h-20 rounded-xl"
                    />
                    {isInvalid ? (
                      <FieldError
                        errors={
                          field.state.meta.errors as Array<
                            { message?: string } | undefined
                          >
                        }
                      />
                    ) : null}
                  </Field>
                )
              }}
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
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Creating…
                    </>
                  ) : (
                    'Create category'
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
