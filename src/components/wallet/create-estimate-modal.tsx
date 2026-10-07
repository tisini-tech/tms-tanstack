import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { ArrowDownLeftIcon, ArrowUpRightIcon, Loader2Icon } from 'lucide-react'

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
import { FieldGroup } from '#/components/ui/field'
import { toast } from '#/components/ui/toast'
import {
  createEstimateDeductionFn,
  createEstimateRevenueFn,
} from '#/data/payments'
import { createEstimateSchema, type CreateEstimateSchema } from '#/lib/schemas'

type EstimateKind = 'revenue' | 'deduction'

const copy: Record<
  EstimateKind,
  {
    title: string
    description: string
    trigger: string
    submitting: string
    successTitle: string
  }
> = {
  revenue: {
    title: 'Estimate revenue',
    description: 'Create a revenue estimate to credit the account.',
    trigger: 'Estimate revenue',
    submitting: 'Creating…',
    successTitle: 'Revenue estimate created',
  },
  deduction: {
    title: 'Estimate deduction',
    description: 'Create a deduction estimate to debit the account.',
    trigger: 'Estimate deduction',
    submitting: 'Creating…',
    successTitle: 'Deduction estimate created',
  },
}

type CreateEstimateModalProps = {
  kind: EstimateKind
  /** Prefill when you fetch products / accounts. */
  defaultProductId?: string
  defaultAccountNo?: string
}

export function CreateEstimateModal({
  kind,
  defaultProductId = '',
  defaultAccountNo = '',
}: CreateEstimateModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const labels = copy[kind]

  const emptyValues: CreateEstimateSchema = {
    productid: defaultProductId,
    accountno: defaultAccountNo,
    addAmount: '',
    description: '',
    fixtureid: '',
  }

  const form = useForm({
    defaultValues: emptyValues,
    validators: {
      onSubmit: createEstimateSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const payload = {
        productid: value.productid.trim(),
        accountno: value.accountno.trim(),
        addAmount: Number(value.addAmount),
        description: value.description.trim(),
        fixtureid: value.fixtureid.trim(),
      }

      try {
        await (kind === 'revenue'
          ? createEstimateRevenueFn({ data: payload })
          : createEstimateDeductionFn({ data: payload }))

        toast.add({
          title: labels.successTitle,
          description: payload.description,
        })
        form.reset({
          ...emptyValues,
          productid: defaultProductId,
          accountno: defaultAccountNo,
        })
        setOpen(false)
        await router.invalidate()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create estimate'
        setSubmitError(message)
        toast.add({
          title: 'Create failed',
          description: message,
        })
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
            ...emptyValues,
            productid: defaultProductId,
            accountno: defaultAccountNo,
          })
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={kind === 'revenue' ? 'default' : 'outline'}
          />
        }
      >
        {kind === 'revenue' ? (
          <ArrowDownLeftIcon data-icon="inline-start" />
        ) : (
          <ArrowUpRightIcon data-icon="inline-start" />
        )}
        {labels.trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
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
            <form.Field name="productid">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-${kind}-productid`}
                  label="Product"
                  type="text"
                  placeholder="Product id"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="accountno">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-${kind}-accountno`}
                  label="Account number"
                  type="text"
                  placeholder="Account number"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="addAmount">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-${kind}-amount`}
                  label="Amount"
                  type="text"
                  placeholder="0"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3 tabular-nums"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-${kind}-description`}
                  label="Description"
                  type="text"
                  placeholder="e.g. Transport - Ops meeting"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="fixtureid">
              {(field) => (
                <InputField
                  field={field}
                  id={`estimate-${kind}-fixtureid`}
                  label="Fixture"
                  type="text"
                  placeholder="Optional fixture id"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
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
                      {labels.submitting}
                    </>
                  ) : (
                    labels.trigger
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
