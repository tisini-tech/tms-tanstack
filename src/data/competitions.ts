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
