import { z } from 'zod'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import {
  type PaginatedResponse,
  type ClientAccount,
  type DepositResponse,
  type Estimate,
  type Payment,
  type Product,
  type WithdrawCharges,
  type WithdrawResponse,
} from '#/lib/types'

export const getAccountsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data?: { searchTerm?: string; isAdmin?: boolean }) => ({
    searchTerm: data?.searchTerm ?? '',
    isAdmin: data?.isAdmin ?? false,
  }))
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      search: data.searchTerm,
      isadminoraccountant: String(data.isAdmin),
    })
    const response = await apiService.get<ClientAccount[]>(
      `/payments/user-accounts?${params.toString()}`,
    )

    return response
  })

export const walletAccountsQueryOptions = queryOptions({
  queryKey: ['wallet', 'accounts'],
  queryFn: () => getAccountsFn({ data: { isAdmin: false } }),
})

export const getWithdrawChargesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const response = await apiService.get<WithdrawCharges[]>(
      `/payments/withdraw-charges`,
    )

    return response
  })

const withdrawInputSchema = z.object({
  account: z.string().trim().min(1),
  wamount: z.number().positive(),
})

export const withdrawFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof withdrawInputSchema>) =>
    withdrawInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const response = await apiService.post<WithdrawResponse>(
      `/payments/withdraw`,
      {
        account: data.account,
        wamount: data.wamount,
      },
    )

    return response
  })

const depositInputSchema = z.object({
  phoneNo: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  accountNo: z.string().trim().min(1),
})

export const depositFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof depositInputSchema>) =>
    depositInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const response = await apiService.post<DepositResponse>(
      `/payments/stkpush`,
      {
        phone: data.phoneNo,
        amount: data.amount,
        reference: data.accountNo,
      },
    )

    return response
  })

const ESTIMATES_MAX_PAGES = 100

function estimatesPath(isAdmin: boolean | undefined) {
  const params = new URLSearchParams()
  params.set('page_size', '500')
  if (isAdmin) params.set('is_admin', 'true')
  return `/payments/estimates?${params.toString()}`
}

/** Cursor pagination returns an absolute `next` URL. Keep its query string. */
function pathFromCursorUrl(next: string) {
  const base = (process.env.API_URL ?? '').replace(/\/$/, '')
  if (base && next.startsWith(base)) {
    const path = next.slice(base.length)
    return path.startsWith('/') ? path : `/${path}`
  }

  const nextUrl = new URL(next)
  return `${nextUrl.pathname}${nextUrl.search}`
}

export const getEstimatesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data?: { isAdmin?: boolean }) => data)
  .handler(async ({ data }) => {
    const results: Estimate[] = []
    const seen = new Set<number>()
    let path: string | null = estimatesPath(data?.isAdmin)
    let pages = 0

    while (path && pages < ESTIMATES_MAX_PAGES) {
      const page: PaginatedResponse<Estimate> =
        await apiService.get<PaginatedResponse<Estimate>>(path)
      pages += 1
      const before = results.length

      for (const estimate of page.results ?? []) {
        if (seen.has(estimate.id)) continue
        seen.add(estimate.id)
        results.push(estimate)
      }

      if (results.length === before) break
      path = page.next ? pathFromCursorUrl(page.next) : null
    }

    return { previous: '', next: '', results }
  })

const estimateIdSchema = z.object({
  estimateId: z.number().int().positive(),
})

export const approveEstimateFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof estimateIdSchema>) =>
    estimateIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.post<{ code?: string; message?: string }>(
      `/payments/approve/${data.estimateId}`,
    )
  })

export const declineEstimateFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof estimateIdSchema>) =>
    estimateIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.delete<{ code?: string; message?: string }>(
      `/payments/decline/${data.estimateId}`,
    )
  })

const createEstimatePayloadSchema = z.object({
  productid: z.string().trim().min(1),
  accountno: z.string().trim().min(1),
  addAmount: z.number().positive(),
  description: z.string().trim().min(1),
  fixtureid: z.string(),
})

export const createEstimateRevenueFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof createEstimatePayloadSchema>) =>
    createEstimatePayloadSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.post<Estimate>(`/payments/estimate-revenue`, {
      productid: data.productid,
      accountno: data.accountno,
      addAmount: data.addAmount,
      description: data.description,
      fixtureid: data.fixtureid,
    })
  })

export const createEstimateDeductionFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof createEstimatePayloadSchema>) =>
    createEstimatePayloadSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.post<Estimate>(`/payments/estimate-deduction`, {
      productid: data.productid,
      accountno: data.accountno,
      addAmount: data.addAmount,
      description: data.description,
      fixtureid: data.fixtureid,
    })
  })

const updateEstimateSchema = z.object({
  estimateId: z.number().int().positive(),
  description: z.string().trim().min(1),
  debit_amount: z.string().trim().min(1),
  credit_amount: z.string().trim().min(1),
})

export const updateEstimateFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof updateEstimateSchema>) =>
    updateEstimateSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { estimateId, ...body } = data
    return apiService.put<Estimate>(`/payments/estimates/${estimateId}`, body)
  })

export const getPaymentsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data?: { isAdmin?: boolean; productIds?: string[]; entityId?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    const productIds = data?.productIds ?? []
    for (const productId of productIds) {
      params.append('product_id', productId)
    }
    params.set('is_admin', String(data?.isAdmin ?? false))
    if (data?.entityId) {
      params.set('entity_id', data.entityId)
    }

    const response = await apiService.get<Payment[]>(
      `/payments?${params.toString()}`,
    )

    return response
  })

const creditPaymentPayloadSchema = z.object({
  productid: z.string().trim().min(1),
  accountno: z.string().trim().min(1),
  addAmount: z.number().positive(),
  description: z.string().trim().min(1),
  fixtureid: z.string(),
})

export const creditPaymentFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof creditPaymentPayloadSchema>) =>
    creditPaymentPayloadSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.post<Payment>(`/payments/add_revenue`, {
      productid: data.productid,
      accountno: data.accountno,
      addAmount: data.addAmount,
      description: data.description,
      fixtureid: data.fixtureid,
    })
  })

const approvePaymentSchema = z.object({
  transaction_id: z.number().int().positive(),
})

export const approvePaymentFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof approvePaymentSchema>) =>
    approvePaymentSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.post<{ code?: string; message?: string }>(
      `/payments/approve-agent-payout`,
      {
        transid: data.transaction_id,
      },
    )
  })

const paymentIdSchema = z.object({
  paymentId: z.number().int().positive(),
})

export const declinePaymentFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: z.infer<typeof paymentIdSchema>) =>
    paymentIdSchema.parse(data),
  )
  .handler(async ({ data }) => {
    return apiService.delete<{ code?: string; message?: string }>(
      `/payments/decline/${data.paymentId}`,
    )
  })

export const getProductsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const response = await apiService.get<Product[]>(`/payments/products`)

    return response
  })
