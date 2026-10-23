import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Engagement,
  EngAnswer,
  EngLeaderboard,
  EngResponse,
  UpdateEngagementAnswerPayload,
} from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth'

export const getEngagementsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    return apiService.get<Engagement[]>(`/engagements`)
  })

export const getEngQuestionsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Engagement>(`/engagements/${data.engId}/questions`)
  })

export const getEngResponsesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string; date?: string }) => data)
  .handler(async ({ data }) => {
    const query = new URLSearchParams()

    if (data.date) {
      query.set('date', data.date)
    }

    return apiService.get<EngResponse[]>(
      `/engagements/${data.engId}/answers?${query.toString()}`,
    )
  })

export const getEngLeaderboardFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<EngLeaderboard[]>(
      `/engagements/${data.engId}/leaderboard`,
      { withApiKey: true },
    )
  })

export const getEngAnswersFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { engId: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Engagement[]>(`/engagements/${data.engId}/answers`)
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
    return apiService.patch<EngAnswer>(
      `/engagements/${data.engId}/answers/${data.answerId}`,
      data.answer,
    )
  })
