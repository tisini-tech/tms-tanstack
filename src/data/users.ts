import { apiService } from '#/lib/api'
import type { UserProfileSchema } from '#/lib/schemas'
import { useAppSession } from '#/lib/session'
import type { PaginatedResponse, User } from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'

export const getUsersFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data?: { search?: string }) => data ?? {})
  .handler(async ({ data }) => {
    const params = new URLSearchParams()
    if (data.search) {
      params.set('search', data.search)
    }

    return apiService.get<PaginatedResponse<User>>(
      `/auth/users?${params.toString()}`,
    )
  })

export const updateUserFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { userId: number } & UserProfileSchema) => data)
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const username = data.username.trim()
    return apiService.patch<User>(`/auth/users/${data.userId}`, {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      sir_name: data.sirName.trim(),
      email: data.email.trim(),
      phone_number: data.phoneNumber.trim(),
      ...(String(session.data.role) === '1'
        ? { role_id: Number(data.roleId) }
        : {}),
      ...(username ? { username } : {}),
    })
  })
