import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { PlusIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'

type AddReviewCommentsModalProps = {
  onAdd: (comment: string) => void
}

export function AddReviewCommentsModal({ onAdd }: AddReviewCommentsModalProps) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    defaultValues: {
      comment: '',
    },
    onSubmit: ({ value }) => {
      const trimmed = value.comment.trim()
      if (!trimmed) return

      onAdd(trimmed)
      form.reset()
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Add comment" />
        }
      >
        <PlusIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="comment"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor="comment">Comment</FieldLabel>
                    <Textarea
                      id="comment"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter your comment here"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          <div className="mt-4 flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Add Comment
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
