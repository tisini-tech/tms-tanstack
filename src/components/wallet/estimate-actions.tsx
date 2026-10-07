import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { CheckIcon, Loader2Icon, PencilIcon, XIcon } from 'lucide-react'
import { z } from 'zod'

import { InputField } from '#/components/general/forms/input-field'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
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
import { toast } from '#/components/ui/toast'
import {
  approveEstimateFn,
  declineEstimateFn,
  updateEstimateFn,
} from '#/data/payments'
import type { Estimate } from '#/lib/types'

const editEstimateSchema = z.object({
  description: z.string().trim().min(1, 'Description is required'),
  debit_amount: z.string().trim().min(1, 'Debit amount is required'),
  credit_amount: z.string().trim().min(1, 'Credit amount is required'),
})

type EditEstimateSchema = z.infer<typeof editEstimateSchema>

export function canActOnEstimate(estimate: Estimate) {
  return !estimate.void_status && estimate.invoiced === 0
}

export function EditEstimateDialog({ estimate }: { estimate: Estimate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      description: estimate.description,
      debit_amount: estimate.debit_amount,
      credit_amount: estimate.credit_amount,
    } satisfies EditEstimateSchema,
    validators: {
      onSubmit: editEstimateSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await updateEstimateFn({
          data: {
            estimateId: estimate.id,
            description: value.description.trim(),
            debit_amount: value.debit_amount.trim(),
            credit_amount: value.credit_amount.trim(),
          },
        })
        toast.add({
          title: 'Estimate updated',
          description: 'Changes were saved successfully.',
        })
        setOpen(false)
        await router.invalidate()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update estimate'
        setSubmitError(message)
        toast.add({ title: 'Update failed', description: message })
      }
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          form.reset({
            description: estimate.description,
            debit_amount: estimate.debit_amount,
            credit_amount: estimate.credit_amount,
          })
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Edit estimate"
            title="Edit estimate"
          />
        }
      >
        <PencilIcon className="size-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit estimate</DialogTitle>
          <DialogDescription>
            Update the description and amounts for estimate #{estimate.id}.
          </DialogDescription>
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
            <form.Field name="description">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-description-${estimate.id}`}
                  label="Description"
                  type="text"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="debit_amount">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-debit-${estimate.id}`}
                  label="Debit amount"
                  type="text"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3 tabular-nums"
                />
              )}
            </form.Field>

            <form.Field name="credit_amount">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-credit-${estimate.id}`}
                  label="Credit amount"
                  type="text"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3 tabular-nums"
                />
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
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Saving…
                    </>
                  ) : (
                    'Save changes'
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

export function ApproveEstimateDialog({ estimate }: { estimate: Estimate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setError(null)
    setIsLoading(true)
    try {
      const response = await approveEstimateFn({
        data: { estimateId: estimate.id },
      })
      toast.add({
        title: 'Estimate approved',
        description: response?.message || `Estimate #${estimate.id} approved.`,
      })
      setOpen(false)
      await router.invalidate()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Failed to approve estimate'
      setError(message)
      toast.add({ title: 'Approve failed', description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Approve estimate"
            title="Approve estimate"
          />
        }
      >
        <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve this estimate?</AlertDialogTitle>
          <AlertDialogDescription>
            Approve{' '}
            <span className="font-medium text-foreground">
              {estimate.description}
            </span>{' '}
            (#{estimate.id}). This cannot be undone from here.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => void handleApprove()}
          >
            {isLoading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Approving…
              </>
            ) : (
              'Approve'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DeclineEstimateDialog({ estimate }: { estimate: Estimate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDecline() {
    setError(null)
    setIsLoading(true)
    try {
      const response = await declineEstimateFn({
        data: { estimateId: estimate.id },
      })
      toast.add({
        title: 'Estimate declined',
        description: response?.message || `Estimate #${estimate.id} declined.`,
      })
      setOpen(false)
      await router.invalidate()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Failed to decline estimate'
      setError(message)
      toast.add({ title: 'Decline failed', description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Decline estimate"
            title="Decline estimate"
          />
        }
      >
        <XIcon className="size-4 text-destructive" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Decline this estimate?</AlertDialogTitle>
          <AlertDialogDescription>
            Decline{' '}
            <span className="font-medium text-foreground">
              {estimate.description}
            </span>{' '}
            (#{estimate.id}). This cannot be undone from here.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading}
            onClick={() => void handleDecline()}
          >
            {isLoading ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                Declining…
              </>
            ) : (
              'Decline'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EstimateActions({ estimate }: { estimate: Estimate }) {
  if (!canActOnEstimate(estimate)) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex items-center gap-1">
      <EditEstimateDialog estimate={estimate} />
      <ApproveEstimateDialog estimate={estimate} />
      <DeclineEstimateDialog estimate={estimate} />
    </div>
  )
}
