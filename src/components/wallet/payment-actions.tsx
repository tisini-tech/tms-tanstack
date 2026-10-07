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
import { toast } from '#/components/ui/toast'
import { approvePaymentFn, declinePaymentFn } from '#/data/payments'
import type { Payment } from '#/lib/types'

export function canActOnPayment(payment: Payment) {
  // API may send boolean or 0/1
  return !payment.void_status
}

export function ApprovePaymentDialog({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setError(null)
    setIsLoading(true)
    try {
      const response = await approvePaymentFn({
        data: { transaction_id: payment.id },
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
            aria-label="Approve payment"
            title="Approve payment"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve this payment?</AlertDialogTitle>
          <AlertDialogDescription>
            Approve{' '}
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

export function PaymentActions({ payment }: { payment: Payment }) {
  if (!canActOnPayment(payment)) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <ApprovePaymentDialog payment={payment} />
      <DeclinePaymentDialog payment={payment} />
    </div>
  )
}
