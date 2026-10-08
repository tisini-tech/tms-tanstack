import { queryOptions } from '@tanstack/react-query'

import { apiService } from '#/lib/api'
import type {
  ClientAccount,
  DepositResponse,
  Estimate,
  Payment,
  Product,
  WithdrawCharges,
  WithdrawResponse,
} from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
  queryFn: () => getAccountsFn(),
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

export const getEstimatesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const response = await apiService.get<Estimate[]>(
      `/payments/estimates?page_size=100`,
    )

    return response
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
