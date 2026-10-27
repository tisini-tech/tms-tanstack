import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import type {
  Fixture,
  FixtureTeamStats,
  FixtureQuarterStats,
  PaginatedResponse,
  FixturePassMatrix,
  ReviewStats,
  ReviewComment,
  RawFixtureEvent,
  FixtureType,
} from '#/lib/types'

export type CreateFixtureInput = {
  matchTypeId: number
  homeTeamId: number
  awayTeamId: number
  competitionId: number
  seasonId: number
  divisionId: number | null
  categoryId: number | null
  stageId: number | null
  live: number
  collectionMode: 'both' | 'home_only' | 'away_only'
  matchday: string
  matchDate: string | null
  matchTime: string | null
  venueId: number | null
  agentIds: number[]
  separateFixtures: boolean
}

export const createFixtureFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: CreateFixtureInput) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.separateFixtures) params.set('separate_fixtures', 'true')
    const query = params.toString()

    return apiService.post<{ message?: string }>(
      query ? `/fixtures?${query}` : '/fixtures',
      {
        match_type_id: data.matchTypeId,
        home_team_id: data.homeTeamId,
        away_team_id: data.awayTeamId,
        competition_id: data.competitionId,
        season_id: data.seasonId,
        division_id: data.divisionId,
        category_id: data.categoryId,
        stage_id: data.stageId,
        venue_id: data.venueId,
        matchday: data.matchday,
        match_date: data.matchDate,
        match_time: data.matchTime,
        collection_mode: data.collectionMode,
        live: data.live,
        agent_ids: data.agentIds,
      },
    )
  })

export const getFixtureFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Fixture>(`/fixtures/${data.id}`)
  })

export type UpdateFixtureInput = {
  fixtureId: number
  teamView: number
  status: string
  matchStatus: string
  matchMoment: string
  minute: number
  second: number
  highlightUrl: string | null
  videoUrl: string | null
  videoUrl2: string | null
  isFeatured: boolean
  appealStatus: string
  appealReason: string | null
  addedHalftime: number | null
  addedFulltime: number | null
  addedExtra: number | null
  addedExtraSecond: number | null
} & CreateFixtureInput

export const updateFixtureFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: UpdateFixtureInput) => data)
  .handler(async ({ data }) => {
    return apiService.patch<Fixture>(`/fixtures/${data.fixtureId}`, {
      match_type_id: data.matchTypeId,
      home_team_id: data.homeTeamId,
      away_team_id: data.awayTeamId,
      competition_id: data.competitionId,
      season_id: data.seasonId,
      division_id: data.divisionId,
      category_id: data.categoryId,
      stage_id: data.stageId,
      venue_id: data.venueId,
      matchday: data.matchday,
      match_date: data.matchDate,
      match_time: data.matchTime,
      collection_mode: data.collectionMode,
      live: data.live,
      team_view: data.teamView,
      status: data.status,
      match_status: data.matchStatus,
      match_moment: data.matchMoment,
      minute: data.minute,
      second: data.second,
      highlight_url: data.highlightUrl,
      video_url: data.videoUrl,
      video_url2: data.videoUrl2,
      is_featured: data.isFeatured,
      appeal_status: data.appealStatus,
      appeal_reason: data.appealReason,
      added_halftime: data.addedHalftime,
      added_fulltime: data.addedFulltime,
      added_extra: data.addedExtra,
      added_extra_second: data.addedExtraSecond,
      agent_ids: data.agentIds,
    })
  })

export const getFixtureTypesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const fixtureTypes = await apiService.get<FixtureType[]>('/fixture-types')
    return fixtureTypes
  })

export const getFixturesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data?: { pageSize?: number }) => data ?? {})
  .handler(async ({ data }) => {
    const pageSize = data.pageSize ?? 100
    const fixtures = await apiService.get<PaginatedResponse<Fixture>>(
      `/fixtures?page_size=${pageSize}`,
    )

    return fixtures
  })

export const searchFixturesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { search: string }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      search: data.search,
      page_size: '100',
    })
    const fixtures = await apiService.get<PaginatedResponse<Fixture>>(
      `/fixtures?${params.toString()}`,
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

export const rawEventsQuery = (id: string) =>
  queryOptions({
    queryKey: ['fixture-raw-events', id],
    queryFn: () => getFixtureRawEventsFn({ data: { id } }),
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
