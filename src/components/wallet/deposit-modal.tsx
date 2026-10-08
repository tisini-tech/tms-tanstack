import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { ArrowDownLeftIcon, Loader2Icon } from 'lucide-react'

import { depositFn } from '#/data/payments'
import { InputField } from '#/components/general/forms/input-field'
import { Button } from '#/components/ui/button'
import { FieldGroup } from '#/components/ui/field'
import { toast } from '#/components/ui/toast'
import { depositSchema, type DepositSchema } from '#/lib/schemas'
import type { ClientAccount } from '#/lib/types'
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

type DepositModalProps = {
  walletAccount?: ClientAccount
  defaultPhone?: string
  onSuccess?: () => void
}

export default function DepositModal({
  walletAccount,
  defaultPhone = '',
  onSuccess,
}: DepositModalProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const balance = walletAccount?.balance_cents ?? 0
  const currency = walletAccount?.currency || 'KES'
  const accountNo = walletAccount?.account_number?.trim() || ''

  const form = useForm({
    defaultValues: {
      phoneNo: defaultPhone,
      amount: '',
    } satisfies DepositSchema,
    validators: {
      onSubmit: depositSchema as never,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      if (!accountNo) {
        const message = 'No wallet account found for this deposit'
        setSubmitError(message)
        toast.add({ title: 'Deposit failed', description: message })
        return
      }

      try {
        const response = await depositFn({
          data: {
            phoneNo: value.phoneNo.trim().replace(/^\+/, ''),
            amount: value.amount.trim(),
            accountNo,
          },
        })

        toast.add({
          title: 'STK push sent',
          description:
            response?.message ||
            'Check your phone and enter your M-Pesa PIN to complete the deposit.',
        })
        form.reset({ phoneNo: defaultPhone, amount: '' })
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to initiate deposit'
        setSubmitError(message)
        toast.add({
          title: 'Deposit failed',
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
          form.reset({ phoneNo: defaultPhone, amount: '' })
          setSubmitError(null)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="min-w-28"
          />
        }
      >
        <ArrowDownLeftIcon data-icon="inline-start" />
        Deposit
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
          <DialogDescription>
            Pay via M-Pesa STK push. Current balance{' '}
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
            <form.Field name="phoneNo">
              {(field) => (
                <InputField
                  field={field}
                  id="deposit-phone"
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
                  id="deposit-amount"
                  label="Amount"
                  type="text"
                  placeholder="0"
                  autoComplete="off"
                  className="gap-2"
                  inputClassName="h-10 rounded-xl px-3 tabular-nums"
                />
              )}
            </form.Field>

            {accountNo ? (
              <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium tabular-nums text-heading">
                    {accountNo}
                  </span>
                </div>
              </div>
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
                <Button type="submit" disabled={isSubmitting || !accountNo}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                      Sending…
                    </>
                  ) : (
                    'Deposit'
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
