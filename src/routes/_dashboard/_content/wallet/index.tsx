import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { getInitials } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import type { ClientAccount } from '#/lib/types'
import {
  getPaymentsFn,
  getWithdrawChargesFn,
  walletAccountsQueryOptions,
} from '#/data/payments'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import DepositModal from '#/components/wallet/deposit-modal'
import WithdrawModal from '#/components/wallet/withdraw-modal'

export const Route = createFileRoute('/_dashboard/_content/wallet/')({
  loader: async ({ context }) => {
    const [accounts, withdrawCharges, payments] = await Promise.all([
      context.queryClient.ensureQueryData(walletAccountsQueryOptions),
      getWithdrawChargesFn(),
      getPaymentsFn(),
    ])
    return { accounts, withdrawCharges, payments }
  },
  component: RouteComponent,
})

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

function maskAccountNumber(accountNumber: string) {
  const trimmed = accountNumber.trim()
  if (trimmed.length <= 4) return trimmed
  return `•••• ${trimmed.slice(-4)}`
}

function pickPrimaryAccount(accounts: ClientAccount[]) {
  return (
    accounts.find((a) => a.is_active && a.is_approved) ??
    accounts.find((a) => a.is_active) ??
    accounts[0]
  )
}

const BALANCE_POLL_INTERVAL_MS = 5_000
const BALANCE_POLL_WINDOW_MS = 5 * 60 * 1000

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const loaderData = Route.useLoaderData()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [watchingBalance, setWatchingBalance] = useState(false)
  const balanceBaselineRef = useRef<number | null | undefined>(undefined)
  const refreshUntilRef = useRef<number | null>(null)

  const accountsQuery = useQuery({
    ...walletAccountsQueryOptions,
    refetchInterval: watchingBalance ? BALANCE_POLL_INTERVAL_MS : false,
  })

  const accounts = accountsQuery.data ?? loaderData?.accounts ?? []
  const account = pickPrimaryAccount(accounts)

  const pollExpired =
    watchingBalance &&
    refreshUntilRef.current != null &&
    accountsQuery.dataUpdatedAt >= refreshUntilRef.current
  const balanceUpdated =
    watchingBalance &&
    account?.balance_cents !== balanceBaselineRef.current

  if (pollExpired || balanceUpdated) {
    setWatchingBalance(false)
  }

  function beginBalancePolling() {
    balanceBaselineRef.current = account?.balance_cents
    refreshUntilRef.current = Date.now() + BALANCE_POLL_WINDOW_MS
    setWatchingBalance(true)
    void accountsQuery.refetch()
  }

  const balance = account
    ? formatMoney(account.balance_cents, account.currency)
    : formatMoney(0, 'KES')
  const accountLabel = account
    ? maskAccountNumber(account.account_number)
    : 'No account'

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_55%),radial-gradient(90%_70%_at_100%_0%,color-mix(in_oklch,var(--accent)_22%,transparent),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />

        <div className="relative flex flex-col gap-8 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar size="lg" className="size-12 rounded-xl after:rounded-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/10.x/adventurer/svg?seed=${user.id}`}
                  alt={user.name}
                  className="rounded-xl"
                />
                <AvatarFallback className="rounded-xl text-sm font-medium">
                  {getInitials(user.name) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-heading">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <span
                className={
                  account?.is_active
                    ? 'size-1.5 rounded-full bg-emerald-500'
                    : 'size-1.5 rounded-full bg-muted-foreground/50'
                }
              />
              {account?.is_active ? 'Active' : 'Inactive'} · {accountLabel}
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Available balance
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground"
                  aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                  aria-pressed={balanceVisible}
                  onClick={() => setBalanceVisible((v) => !v)}
                >
                  {balanceVisible ? <EyeIcon /> : <EyeOffIcon />}
                </Button>
              </div>
              <p
                className={`font-heading text-4xl font-semibold tracking-tight text-heading tabular-nums transition-[filter] duration-200 sm:text-5xl ${
                  balanceVisible ? 'blur-none' : 'select-none blur-md'
                }`}
              >
                {balance}
              </p>
              {watchingBalance ? (
                <p className="text-xs text-muted-foreground">
                  Updating balance…
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DepositModal
                walletAccount={account}
                defaultPhone={user.phone}
                onSuccess={beginBalancePolling}
              />

              <WithdrawModal
                charges={loaderData?.withdrawCharges ?? []}
                walletAccount={account}
                onSuccess={beginBalancePolling}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
