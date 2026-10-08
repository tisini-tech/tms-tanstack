import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'

import { AccountComboboxField } from '#/components/wallet/account-combobox-field'
import { AccountPayments } from '#/components/wallet/account-payments'
import { getAccountsFn, getPaymentsFn } from '#/data/payments'

const statementSearchSchema = z.object({
  entityId: z.string().optional(),
})

export const Route = createFileRoute('/_dashboard/_content/wallet/statements')({
  validateSearch: statementSearchSchema,
  loaderDeps: ({ search }) => ({ entityId: search.entityId }),
  loader: async ({ deps }) => {
    const [accounts, payments] = await Promise.all([
      getAccountsFn({ data: { searchTerm: '', isAdmin: true } }),
      deps.entityId
        ? getPaymentsFn({
            data: {
              isAdmin: true,
              productIds: ['1', '6', '7'],
              entityId: deps.entityId,
            },
          })
        : Promise.resolve([]),
    ])

    return { accounts, payments }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { entityId } = Route.useSearch()
  const { accounts, payments } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Statements
          </h1>
          <p className="text-sm text-muted-foreground">
            {entityId
              ? `${payments?.length ?? 0} payment${payments?.length === 1 ? '' : 's'}`
              : 'Select a user to view their statement.'}
          </p>
        </div>

        <AccountComboboxField
          id="statement-user"
          label="User"
          accounts={accounts ?? []}
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
