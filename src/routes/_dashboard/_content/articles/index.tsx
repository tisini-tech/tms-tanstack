import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { getArticlesFn } from '#/data/articles'
import { ArticlesList } from '#/components/articles/articles-list'
import { rememberLastModulePath } from '#/lib/last-module'

export const Route = createFileRoute('/_dashboard/_content/articles/')({
  loader: async () => {
    const articles = await getArticlesFn()
    return { articles }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { articles } = Route.useLoaderData()

  useEffect(() => {
    rememberLastModulePath('/articles')
  }, [])

  return (
    <ArticlesList
      articles={articles.results ?? []}
      totalItems={articles.total_items}
    />
  )
}
