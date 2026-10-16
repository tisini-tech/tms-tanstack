import type { Estimate, Product } from '#/lib/types'
import { cn } from '#/lib/utils'

export interface EstimateProductGroup {
  productId: string
  name: string
  count: number
  debit: number
  credit: number
}

function formatAmount(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function groupEstimatesByProduct(
  estimates: Pick<
    Estimate,
    'product_id' | 'debit_amount' | 'credit_amount' | 'void_status'
  >[],
  products: Product[],
): EstimateProductGroup[] {
  const names = new Map(products.map((product) => [String(product.id), product.name]))
  const groups = new Map<string, EstimateProductGroup>()

  for (const estimate of estimates) {
    const productId = estimate.product_id || ''
    const group = groups.get(productId) ?? {
      productId,
      name: names.get(productId) || (productId ? `Product ${productId}` : 'No product'),
      count: 0,
      debit: 0,
      credit: 0,
    }

    group.count += 1
    if (!estimate.void_status) {
      group.debit += Number(estimate.debit_amount) || 0
      group.credit += Number(estimate.credit_amount) || 0
    }
    groups.set(productId, group)
  }

  return [...groups.values()].sort(
    (a, b) => b.debit - a.debit || b.credit - a.credit || b.count - a.count,
  )
}

export function EstimateSummary({
  groups,
  selectedProductId,
  onSelect,
  countLabel = 'Estimates',
  fill = false,
}: {
  groups: EstimateProductGroup[]
  selectedProductId: string | null
  onSelect: (productId: string | null) => void
  countLabel?: string
  fill?: boolean
}) {
  if (groups.length === 0) return null

  const totals = groups.reduce(
    (sum, group) => ({
      count: sum.count + group.count,
      debit: sum.debit + group.debit,
      credit: sum.credit + group.credit,
    }),
    { count: 0, debit: 0, credit: 0 },
  )

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card',
        fill && 'flex min-h-0 flex-1 flex-col',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm">
        <p className="text-muted-foreground">
          <span className="font-medium text-heading">{groups.length}</span> products
          <span className="mx-2 text-border">·</span>
          Debit{' '}
          <span className="tabular-nums font-medium text-heading">
            {formatAmount(totals.debit)}
          </span>
          <span className="mx-2 text-border">·</span>
          Credit{' '}
          <span className="tabular-nums font-medium text-heading">
            {formatAmount(totals.credit)}
          </span>
        </p>
        {selectedProductId !== null ? (
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground hover:text-heading"
            onClick={() => onSelect(null)}
          >
            Show all
          </button>
        ) : null}
      </div>
      <div className={cn('overflow-y-auto', fill ? 'min-h-0 flex-1' : 'max-h-56')}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card text-left text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 text-right font-medium">{countLabel}</th>
              <th className="px-3 py-2 text-right font-medium">Debit</th>
              <th className="px-3 py-2 text-right font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const selected = selectedProductId === group.productId
              return (
                <tr
                  key={group.productId || 'none'}
                  className={cn(
                    'cursor-pointer border-b border-border/70 last:border-0 hover:bg-muted/40',
                    selected && 'bg-muted/60',
                  )}
                  onClick={() => onSelect(selected ? null : group.productId)}
                >
                  <td className="px-3 py-2 font-medium text-heading">{group.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {group.count}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatAmount(group.debit)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatAmount(group.credit)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
