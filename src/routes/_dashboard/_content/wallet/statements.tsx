import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import {
  AccountComboboxField,
  accountNumber,
} from '#/components/wallet/account-combobox-field'
import { AccountPayments } from '#/components/wallet/account-payments'
import { getAccountsFn, getPaymentsFn } from '#/data/payments'

const statementSearchSchema = z.object({
  entityId: z.string().optional(),
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

export const Route = createFileRoute('/_dashboard/_content/wallet/statements')({
  validateSearch: statementSearchSchema,
  loaderDeps: ({ search }) => ({ entityId: search.entityId }),
  loader: async ({ deps }) => {
    const [accounts, payments, matchedAccounts] = await Promise.all([
      getAccountsFn({ data: { searchTerm: '', isAdmin: true } }),
      deps.entityId
        ? getPaymentsFn({
            data: {
              isAdmin: true,
              entityId: deps.entityId,
            },
          })
        : Promise.resolve([]),
      deps.entityId
        ? getAccountsFn({
            data: { searchTerm: deps.entityId, isAdmin: true },
          })
        : Promise.resolve([]),
    ])

    const selectedAccount =
      matchedAccounts.find(
        (account) => accountNumber(account) === deps.entityId,
      ) ?? null

    return { accounts, payments, selectedAccount }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { entityId } = Route.useSearch()
  const { accounts, payments, selectedAccount } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const paymentCount = payments?.length ?? 0
  const accountOptions =
    selectedAccount &&
    !(accounts ?? []).some(
      (account) => accountNumber(account) === accountNumber(selectedAccount),
    )
      ? [selectedAccount, ...(accounts ?? [])]
      : (accounts ?? [])

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Statements
          </h1>
          <p className="text-sm text-muted-foreground">
            {entityId
              ? `${paymentCount} payment${paymentCount === 1 ? '' : 's'}`
              : 'Select a user to view their statement.'}
            {selectedAccount ? (
              <span className="text-heading">
                {' '}
                ·{' '}
                {formatMoney(
                  selectedAccount.balance_cents ?? 0,
                  selectedAccount.currency || 'KES',
                )}
              </span>
            ) : null}
          </p>
        </div>

        <AccountComboboxField
          id="statement-user"
          label="User"
          accounts={accountOptions}
          value={entityId ?? ''}
          onValueChange={(next) => {
            void navigate({
              search: next ? { entityId: next } : {},
            })
          }}
          className="w-full gap-2 sm:w-80"
        />
      </div>

      {entityId ? (
        <AccountPayments payments={payments ?? []} showHeading={false} />
      ) : null}
    </div>
  )
}
