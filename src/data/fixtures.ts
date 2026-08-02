import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import type {
  Fixture,
  FixturePlayerStats,
  FixtureTeamStats,
  FixtureQuarterStats,
  PaginatedResponse,
  FixturePassMatrix,
  ReviewStats,
  ReviewComment,
  RawFixtureEvent,
} from '#/lib/types'

export const getFixturesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const fixtures =
      await apiService.get<PaginatedResponse<Fixture>>('/fixtures')

    return fixtures
  })

export const searchFixturesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { search: string }) => data)
  .handler(async ({ data }) => {
    const fixtures = await apiService.get<PaginatedResponse<Fixture>>(
      `/fixtures?search=${data.search}`,
    )
    return fixtures
  })

export const getFixtureTeamStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const teamStats = await apiService.get<FixtureTeamStats>(
      `/fixtures/${data.id}/team-stats`,
    )
    return teamStats
  })

export const getFixtureQuarterStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const quarterStats = await apiService.get<FixtureQuarterStats>(
      `/fixtures/${data.id}/quarter-stats`,
    )
    return quarterStats
  })

export const getFixturePassMatrixFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const passMatrix = await apiService.get<FixturePassMatrix>(
      `/fixtures/${data.id}/pass-matrix`,
    )
    return passMatrix
  })

export const getFixtureReviewStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const reviewStats = await apiService.get<ReviewStats>(
      `/fixtures/${data.id}/review-stats`,
    )
    return reviewStats
  })

type ReviewPayload = {
  fixtureId: string
  agentId: number
  teamId: number
  review: string[]
}

type UpdateReviewPayload = ReviewPayload & {
  reviewId: number
}

export const saveReviewCommentsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: ReviewPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiService.post<ReviewComment>(
      `/fixtures/${data.fixtureId}/reviews`,
      {
        agent: data.agentId,
        team: data.teamId,
        review: data.review,
      },
    )
    return response
  })

export const updateReviewCommentsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: UpdateReviewPayload) => data)
  .handler(async ({ data }) => {
    await apiService.patch(
      `/fixtures/${data.fixtureId}/reviews/${data.reviewId}`,
      {
        agent: data.agentId,
        team: data.teamId,
        review: data.review,
      },
    )
    return { success: true as const }
  })

export const getReviewCommentsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const reviewComments = await apiService.get<ReviewComment[]>(
      `/fixtures/${data.id}/reviews`,
    )
    return reviewComments
  })

export const getFixtureRawEventsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const rawEvents = await apiService.get<RawFixtureEvent[]>(
      `/fixtures/${data.id}/match-events`,
    )

    return rawEvents
  })
