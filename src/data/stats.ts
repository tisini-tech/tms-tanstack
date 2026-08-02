import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type {
  FixturePlayerStats,
  PaginatedResponse,
  TopPlayerStats,
} from '#/lib/types'

export const getTopPlayersStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator(
    (data: {
      competitionId: number
      seasonId: number
      divisionId?: number
      rounds?: string[]
      month?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams()

    params.set('page_size', '100')

    if (data.divisionId != null) {
      params.set('division_id', String(data.divisionId))
    }
    for (const round of data.rounds ?? []) {
      params.append('round', round)
    }
    if (data.month) {
      params.set('month', data.month)
    }

    const playersStats = await apiService.get<
      PaginatedResponse<TopPlayerStats>
    >(
      `/competitions/${data.competitionId}/seasons/${data.seasonId}/top-rated-players?${params.toString()}`,
    )

    return playersStats
  })

export const getFixturePlayerStatsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const playerStats = await apiService.get<FixturePlayerStats[]>(
      `/fixtures/${data.id}/player-stats`,
    )
    return playerStats
  })
