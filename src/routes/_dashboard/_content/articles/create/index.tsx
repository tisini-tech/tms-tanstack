import { createFileRoute } from '@tanstack/react-router'

import { ArticleEditorForm } from '#/components/articles/article-editor-form'
import { getArticleCategoriesFn } from '#/data/articles'
import type { ArticleFormValues } from '#/lib/schemas'

export const Route = createFileRoute('/_dashboard/_content/articles/create/')({
  loader: async () => {
    const categories = await getArticleCategoriesFn()
    return { categories }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { categories } = Route.useLoaderData()

  const initialValues: ArticleFormValues = {
    title: '',
    excerpt: '',
    accessType: 'FREE',
    featuredImage: null,
    categoryId: '',
    keywords: '',
  }

  return (
    <ArticleEditorForm
      mode="create"
      categories={categories}
      initialValues={initialValues}
    />
  )
}
