import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type { Competition } from '#/lib/types'

export const getCompetitionsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const competitions = await apiService.get<Competition[]>('/competitions')

    return competitions
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
