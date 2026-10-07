import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { CheckIcon, Loader2Icon, XIcon } from 'lucide-react'

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
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { toast } from '#/components/ui/toast'
import { approvePaymentFn, declinePaymentFn } from '#/data/payments'
import type { Payment } from '#/lib/types'

export function canActOnPayment(payment: Payment) {
  // API may send boolean or 0/1
  return !payment.void_status
}

function paymentAmount(payment: Payment) {
  const credit = Number(payment.credit_amount)
  if (Number.isFinite(credit) && credit > 0) return credit
  const debit = Number(payment.debit_amount)
  if (Number.isFinite(debit) && debit > 0) return debit
  return 0
}

export function ApprovePaymentDialog({
  payment,
  defaultPhone = '',
}: {
  payment: Payment
  defaultPhone?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneno, setPhoneno] = useState(defaultPhone)
  const amount = paymentAmount(payment)

  async function handleApprove() {
    const phone = phoneno.trim().replace(/^\+/, '')
    if (!phone) {
      setError('Phone number is required')
      return
    }
    if (!(amount > 0)) {
      setError('Payment amount must be greater than 0')
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const response = await approvePaymentFn({
        data: {
          transid: payment.id,
          addAmount: amount,
          phoneno: phone,
        },
      })
      toast.add({
        title: 'Payment approved',
        description: response?.message || `Payment #${payment.id} approved.`,
      })
      setOpen(false)
      await router.invalidate()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Failed to approve payment'
      setError(message)
      toast.add({ title: 'Approve failed', description: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setError(null)
          setPhoneno(defaultPhone)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Approve payment"
            title="Approve payment"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve this payment?</DialogTitle>
          <DialogDescription>
            Approve{' '}
            <span className="font-medium text-foreground">
              {payment.description}
            </span>{' '}
            (#{payment.id}) for{' '}
            <span className="font-medium tabular-nums text-foreground">
              {amount}
            </span>
            . Enter the M-Pesa phone number for the payout.
          </DialogDescription>
        </DialogHeader>

        <Field className="gap-2">
          <FieldLabel htmlFor={`approve-payment-phone-${payment.id}`}>
            Phone number
          </FieldLabel>
          <Input
            id={`approve-payment-phone-${payment.id}`}
            type="tel"
            value={phoneno}
            onChange={(e) => setPhoneno(e.target.value)}
            placeholder="07XXXXXXXX"
            autoComplete="tel"
            className="h-10 rounded-xl px-3"
          />
        </Field>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DeclinePaymentDialog({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDecline() {
    setError(null)
    setIsLoading(true)
    try {
      const response = await declinePaymentFn({
        data: { paymentId: payment.id },
      })
      toast.add({
        title: 'Payment declined',
        description: response?.message || `Payment #${payment.id} declined.`,
      })
      setOpen(false)
      await router.invalidate()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Failed to decline payment'
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
            aria-label="Decline payment"
            title="Decline payment"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <XIcon className="size-4 text-destructive" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Decline this payment?</AlertDialogTitle>
          <AlertDialogDescription>
            Decline{' '}
            <span className="font-medium text-foreground">
              {payment.description}
            </span>{' '}
            (#{payment.id}). This cannot be undone from here.
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

export function PaymentActions({
  payment,
  defaultPhone,
}: {
  payment: Payment
  defaultPhone?: string
}) {
  if (!canActOnPayment(payment)) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <ApprovePaymentDialog payment={payment} defaultPhone={defaultPhone} />
      <DeclinePaymentDialog payment={payment} />
    </div>
  )
}
