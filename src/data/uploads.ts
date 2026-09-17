import { createServerFn } from '@tanstack/react-start'
import { authFnMiddleware } from '#/middlewares/auth'
import { apiService } from '#/lib/api'

type UploadResponse = {
  url: string
  key: string
  name: string
}

export const uploadDocument = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((formData: FormData) => {
    if (!(formData instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    return { file }
  })
  .handler(async ({ data }) => {
    const { file } = data

    const body = new FormData()
    body.append('file', file)

    return await apiService.post<UploadResponse>('/uploads', body)
  })
