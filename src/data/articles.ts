import { apiService } from '#/lib/api'
import type {
  Article,
  ArticleCategory,
  PagePaginatedResponse,
  Author,
} from '#/lib/types'
import type { AuthorProfileSchema, CreateArticlePayload } from '#/lib/schemas'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'

function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    if (Array.isArray(obj.results)) return obj.results as T[]
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

export const getArticlesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const articles = await apiService.get<PagePaginatedResponse<Article>>(
      `/manage/articles?page=1&page_size=100`,
    )

    return articles
  })

export const getArticleFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    return apiService.get<Article>(`/manage/articles/${data.id}`)
  })

export const getArticleCategoriesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const categories = await apiService.get<unknown>(`/categories`)
    return unwrapList<ArticleCategory>(categories)
  })

export const createCategoryFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { name: string; description?: string }) => data)
  .handler(async ({ data }) => {
    return apiService.post<ArticleCategory>('/categories', {
      name: data.name.trim(),
      description: data.description?.trim() || '',
    })
  })

export const createAuthorFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { userId: number; displayName: string }) => data)
  .handler(async ({ data }) => {
    return apiService.post<Author>('/manage/authors', {
      user_id: data.userId,
      display_name: data.displayName,
      bio: '',
      website: '',
      twitter: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      is_active: true,
    })
  })

export const updateAuthorFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { authorId: number } & AuthorProfileSchema) => data,
  )
  .handler(async ({ data }) => {
    return apiService.patch<Author>(`/manage/authors/${data.authorId}`, {
      display_name: data.displayName.trim(),
      bio: data.bio.trim(),
      website: data.website.trim(),
      twitter: data.twitter.trim(),
      facebook: data.facebook.trim(),
      instagram: data.instagram.trim(),
      linkedin: data.linkedin.trim(),
      youtube: data.youtube.trim(),
      is_active: data.isActive,
    })
  })

export const deleteAuthorFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: { authorId: number }) => data)
  .handler(async ({ data }) => {
    return apiService.delete<{ message: string }>(
      `/manage/authors/${data.authorId}`,
    )
  })

export const getAuthorsFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const authors = await apiService.get<unknown>(
      `/manage/authors?page=1&page_size=100`,
    )
    return unwrapList<Author>(authors)
  })

export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: CreateArticlePayload) => data)
  .handler(async ({ data }) => {
    return apiService.post<Article>('/manage/articles', data)
  })

export const updateArticleFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator((data: CreateArticlePayload) => data)
  .handler(async ({ data }) => {
    return apiService.put<Article>(`/manage/articles/${data.id}`, data)
  })

export type PublishRejectAction = 'submit' | 'publish' | 'reject'

export const updateArticleStatusFn = createServerFn({ method: 'POST' })
  .middleware([authFnMiddleware])
  .validator(
    (data: { id: string; action: PublishRejectAction; reason?: string }) => {
      if (
        data.action !== 'submit' &&
        data.action !== 'publish' &&
        data.action !== 'reject'
      ) {
        throw new Error('Invalid action')
      }
      if (data.action === 'reject' && !data.reason?.trim()) {
        throw new Error('Rejection reason is required')
      }
      return data
    },
  )
  .handler(async ({ data }) => {
    return apiService.patch<Article>(`/manage/articles/${data.id}`, {
      action: data.action,
      reason: data.reason,
    })
  })
