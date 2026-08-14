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

export type UpdateFixtureEventPayload = {
  metric_id: number
  metric_detail_id: number
  metric_sub_detail_id: number
  player_id: number
  subplayer_id: number
  team_id: number
  minute: number
  second: number
  moment: string
  quarter: string
  narration: string
  zone_id: number
  xper: string
  yper: string
  video_timestamp: number
  no_ruck: string
  no_lineout: string
  meter_gain: string
  kickfrom: string
  kickland: string
  defender: string
  localid: string
  app_timelog: string
  sync_status: number
}

export type CreateFixtureEventPayload = UpdateFixtureEventPayload

export const updateFixtureEventFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      fixtureId: string
      eventId: number
      body: UpdateFixtureEventPayload
    }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiService.patch<RawFixtureEvent>(
      `/fixtures/${data.fixtureId}/match-events/${data.eventId}`,
      data.body,
    )
    return response
  })

export const deleteFixtureEventFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { fixtureId: string; eventId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiService.delete<{ message: string }>(
      `/fixtures/${data.fixtureId}/match-events/${data.eventId}`,
    )

    return response.message
  })

export const createFixtureEventFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { fixtureId: string; body: CreateFixtureEventPayload }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiService.post<RawFixtureEvent>(
      `/fixtures/${data.fixtureId}/match-events`,
      data.body,
    )
    return response
  })

export const swapPlayerEventsFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      fixtureId: string
      wrongPlayerId: string
      rightPlayerId: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const { fixtureId, wrongPlayerId, rightPlayerId } = data
    const response = await apiService.patch<RawFixtureEvent[]>(
      `/fixtures/${fixtureId}/swap-player-events`,
      { wrong_player: wrongPlayerId, right_player: rightPlayerId },
    )

    return response
  })
