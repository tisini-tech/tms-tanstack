import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type { PaginatedResponse, TopPlayerStats } from '#/lib/types'

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

    if (data.divisionId != null) {
      params.set('division_id', String(data.divisionId))
    }
    for (const round of data.rounds ?? []) {
      params.append('round', round)
    }
    if (data.month) {
      params.set('month', data.month)
    }

    const query = params.toString()
    const path = `/competitions/${data.competitionId}/seasons/${data.seasonId}/top-rated-players&page_size=100`

    const playersStats = await apiService.get<
      PaginatedResponse<TopPlayerStats>
    >(query ? `${path}?${query}` : path)

    return playersStats
  })
