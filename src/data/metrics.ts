import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'
import { apiService } from '#/lib/api'
import type { Metrics } from '#/lib/types'

export const getMetricsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { fixType: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiService.get<Metrics[]>(
      `/metrics?fixture_type=${data.fixType}&with_details=true`,
    )

    return response
  })
