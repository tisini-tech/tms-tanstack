import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { ArrowUpRightIcon, Loader2Icon } from 'lucide-react'

import { withdrawFn } from '#/data/payments'
import { toast } from '#/components/ui/toast'
import { Button } from '#/components/ui/button'
import { FieldGroup } from '#/components/ui/field'
import { InputField } from '#/components/general/forms/input-field'
import { createWithdrawSchema, type WithdrawSchema } from '#/lib/schemas'
import type { ClientAccount, WithdrawCharges } from '#/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount} ${currency || 'KES'}`
  }
}

function findCharge(amount: number, charges: WithdrawCharges[]) {
  if (!Number.isFinite(amount) || amount <= 0) return undefined
  return charges.find((charge) => {
    const min = Number(charge.min_amount)
    const max = Number(charge.max_amount)
    return amount >= min && amount <= max
  })
}

type WithdrawModalProps = {
  charges: WithdrawCharges[]
  walletAccount?: ClientAccount
  defaultPhone?: string
}

export default function WithdrawModal({
  charges,
  walletAccount,
  defaultPhone = '',
}: WithdrawModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const balance = walletAccount?.balance_cents ?? 0
  const currency = walletAccount?.currency || 'KES'
  const schema = useMemo(() => createWithdrawSchema(balance), [balance])

  const form = useForm({
    defaultValues: {
      account: defaultPhone,
      amount: '',
    } satisfies WithdrawSchema,
    validators: {
      onSubmit: schema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const response = await withdrawFn({
          data: {
            account: value.account.trim(),
            amount: Number(value.amount),
          },
        })

        toast.add({
          title: 'Withdrawal initiated',
          description: response.message || 'Your withdrawal request was sent.',
        })
        form.reset({ account: defaultPhone, amount: '' })
        setOpen(false)
        await router.invalidate()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to withdraw'
        setSubmitError(message)
        toast.add({
          title: 'Withdrawal failed',
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
          form.reset({ account: defaultPhone, amount: '' })
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={<Button type="button" size="lg" className="min-w-28" />}
      >
        <ArrowUpRightIcon data-icon="inline-start" />
        Withdraw
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw</DialogTitle>
          <DialogDescription>
            Send funds to your M-Pesa number. Available balance{' '}
            <span className="font-medium text-foreground tabular-nums">
              {formatMoney(balance, currency)}
            </span>
            .
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
            <form.Field name="account">
              {(field) => (
                <InputField
                  field={field}
                  id="withdraw-account"
                  label="Phone number"
                  type="tel"
                  placeholder="07XXXXXXXX"
                  autoComplete="tel"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3"
                />
              )}
            </form.Field>

            <form.Field name="amount">
              {(field) => (
                <InputField
                  field={field}
                  id="withdraw-amount"
                  label="Amount"
                  type="text"
                  placeholder="0"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3 tabular-nums"
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.amount}>
              {(amountValue) => {
                const amount = Number(amountValue)
                const charge = findCharge(amount, charges)
                if (!charge) return null

                return (
                  <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium tabular-nums text-heading">
                        {formatMoney(Number(charge.cost), currency)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">You receive</span>
                      <span className="font-medium tabular-nums text-heading">
                        {formatMoney(amount - Number(charge.cost), currency)}
                      </span>
                    </div>
                  </div>
                )
              }}
            </form.Subscribe>

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
                <Button type="submit" disabled={isSubmitting || balance <= 0}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Withdrawing…
                    </>
                  ) : (
                    'Withdraw'
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
