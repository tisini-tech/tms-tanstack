import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import type {
  Engagement,
  EngAnswer,
  EngLeaderboard,
  EngResponse,
  PaginatedResponse,
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

const RESPONSES_MAX_PAGES = 100

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

export const getEngResponsesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      engId: string
      date?: string
      dateFrom?: string
      dateTo?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const query = new URLSearchParams()

    if (data.dateFrom && data.dateTo) {
      query.set('date_from', data.dateFrom)
      query.set('date_to', data.dateTo)
    } else if (data.date) {
      query.set('date', data.date)
    }

    const results: EngResponse[] = []
    const seen = new Set<number>()
    let path: string | null =
      `/engagements/${data.engId}/answers?${query.toString()}`
    let pages = 0

    while (path && pages < RESPONSES_MAX_PAGES) {
      const page = await apiService.get<PaginatedResponse<EngResponse>>(path)
      pages += 1
      const before = results.length

      for (const response of page.results ?? []) {
        if (seen.has(response.participation_id)) continue
        seen.add(response.participation_id)
        results.push(response)
      }

      if (!page.next || results.length === before) break
      path = pathFromCursorUrl(page.next)
    }

    return { previous: '', next: '', results }
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
