import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { ArrowDownLeftIcon, Loader2Icon } from 'lucide-react'

import { AccountComboboxField } from '#/components/wallet/account-combobox-field'
import { InputField } from '#/components/general/forms/input-field'
import { ComboboxField } from '#/components/general/forms/combobox-field'
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
import { creditPaymentFn } from '#/data/payments'
import {
  createEstimateSchema,
  type CreateEstimateSchema,
} from '#/lib/schemas'
import type { ClientAccount, Product } from '#/lib/types'

type CreditPaymentModalProps = {
  products: Product[]
  accounts: ClientAccount[]
  defaultProductId?: string
  defaultAccountNo?: string
}

export function CreditPaymentModal({
  products,
  accounts,
  defaultProductId = '',
  defaultAccountNo = '',
}: CreditPaymentModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const productOptions = (products.some((product) => product.status)
    ? products.filter((product) => product.status)
    : products
  ).map((product) => ({
    value: String(product.id),
    label: product.name,
  }))

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
        await creditPaymentFn({ data: payload })
        toast.add({
          title: 'Credit payment created',
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
          error instanceof Error
            ? error.message
            : 'Failed to create credit payment'
        setSubmitError(message)
        toast.add({
          title: 'Credit payment failed',
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
      <DialogTrigger render={<Button type="button" />}>
        <ArrowDownLeftIcon data-icon="inline-start" />
        Credit payment
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Credit payment</DialogTitle>
          <DialogDescription>
            Create a credit payment to add revenue to an account.
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
            <form.Field name="productid">
              {(field) => (
                <ComboboxField
                  field={field}
                  id="credit-payment-productid"
                  label="Product"
                  options={productOptions}
                  placeholder="Select a product"
                  searchPlaceholder="Search products…"
                  emptyMessage="No products found"
                  className="gap-2"
                />
              )}
            </form.Field>

            <form.Field name="accountno">
              {(field) => (
                <AccountComboboxField
                  field={field}
                  id="credit-payment-accountno"
                  accounts={accounts}
                  className="gap-2"
                />
              )}
            </form.Field>

            <form.Field name="addAmount">
              {(field) => (
                <InputField
                  field={field}
                  id="credit-payment-amount"
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
                  id="credit-payment-description"
                  label="Description"
                  type="text"
                  placeholder="e.g. Sponsorship payment"
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
                  id="credit-payment-fixtureid"
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
                      Creating…
                    </>
                  ) : (
                    'Credit payment'
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
