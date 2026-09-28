import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { apiService } from '#/lib/api'
import { authFnMiddleware } from '#/middlewares/auth'
import type {
  Competition,
  CompetitionImage,
  CompetitionStandings,
  LeagueDashboard,
} from '#/lib/types'

export const getCompetitionsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const competitions = await apiService.get<Competition[]>('/competitions')

    return competitions
  })

export const competitionQueryOptions = queryOptions({
  queryKey: ['competitions'],
  queryFn: () => getCompetitionsFn(),
})

export const getCompetitionRoundsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { competitionId: string; seasonId: string; divisionId?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { competitionId, seasonId, divisionId } = data

    const params = new URLSearchParams()
    if (divisionId) {
      params.set('division_id', divisionId)
    }

    const query = params.toString()
    const path = `/competitions/${competitionId}/seasons/${seasonId}/rounds`

    const rounds = await apiService.get<string[]>(
      query ? `${path}?${query}` : path,
    )

    return rounds
  })

export const getCompetitionImagesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { competitionId: string; seasonId: string; divisionId?: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { competitionId, seasonId, divisionId } = data

    const params = new URLSearchParams()
    if (divisionId) {
      params.set('division_id', divisionId)
    }

    const query = params.toString()
    const path = `/competitions/${competitionId}/seasons/${seasonId}/images`

    const images = await apiService.get<CompetitionImage[]>(
      query ? `${path}?${query}` : path,
    )

    return images
  })

export const createCompetitionImageFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      competitionId: string
      seasonId: string
      divisionId?: string
      images: Array<{ image_url: string; caption?: string }>
    }) => data,
  )
  .handler(async ({ data }) => {
    const { competitionId, seasonId, divisionId, images } = data

    const res = await apiService.post<CompetitionImage[]>(
      `/competitions/${competitionId}/seasons/${seasonId}/images`,
      {
        division_id: divisionId ? Number(divisionId) : null,
        images: images.map((image) => ({
          image_url: image.image_url,
          caption: image.caption?.trim() ?? '',
        })),
      },
    )

    return res
  })

export const getLeagueDashboardFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      competitionId: string
      seasonId: string
      divisionId?: string
      categoryId?: string
      eventIds: number[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const { competitionId, seasonId, divisionId, categoryId, eventIds } = data

    const params = new URLSearchParams()
    if (divisionId) {
      params.set('division_id', divisionId)
    }
    if (categoryId) {
      params.set('category_id', categoryId)
    }
    for (const eventId of eventIds) {
      params.append('event_ids', String(eventId))
    }

    const query = params.toString()
    const path = `/competitions/${competitionId}/seasons/${seasonId}/dashboard`

    const dashboard = await apiService.get<LeagueDashboard>(
      query ? `${path}?${query}` : path,
    )

    return dashboard
  })

export const getCompetitionStandingsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      competitionId: string
      seasonId: string
      divisionId?: string
      categoryId?: string
      addSeqPoints?: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const { competitionId, seasonId, divisionId, categoryId, addSeqPoints } =
      data

    const params = new URLSearchParams()
    if (divisionId) {
      params.set('division_id', divisionId)
    }
    if (categoryId) {
      params.set('category_id', categoryId)
    }
    if (addSeqPoints) {
      params.set('add_seq_points', 'true')
    }

    const query = params.toString()
    const path = `/competitions/${competitionId}/seasons/${seasonId}/standings`

    const standings = await apiService.get<CompetitionStandings>(
      query ? `${path}?${query}` : path,
      { base: 'scores', withApiKey: true },
    )

    return standings
  })
