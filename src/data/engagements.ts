import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Engagement,
  EngagementAnswer,
  EngagementDetail,
  UpdateEngagementAnswerPayload,
} from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth'

export const getEngAnswersFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Engagement[]>(`/engagements/${data.engId}/answers`)
  })

export const getEngQuestionsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<EngagementDetail>(
      `/engagements/${data.engId}/questions`,
    )
  })

export const updateAnswerFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      engId: string
      answerId: number
      answer: UpdateEngagementAnswerPayload
    }) => data,
  )
  .handler(async ({ data }) => {
    return apiService.patch<EngagementAnswer>(
      `/engagements/${data.engId}/answers/${data.answerId}`,
      data.answer,
    )
  })
