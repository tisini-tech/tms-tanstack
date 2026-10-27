import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type { Venue } from '#/lib/types'

export const getVenuesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const venues = await apiService.get<Venue[]>('/venues')
    return venues
  })
