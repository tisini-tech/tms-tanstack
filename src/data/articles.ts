import { apiService } from '#/lib/api'
import type { Article, PagePaginatedResponse } from '#/lib/types'
import { authFnMiddleware } from '#/middlewares/auth'
import { createServerFn } from '@tanstack/react-start'

export const getArticlesFn = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async () => {
    const articles =
      await apiService.get<PagePaginatedResponse<Article>>(`/manage/articles`)

    return articles
  })
