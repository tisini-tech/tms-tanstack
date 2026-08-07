import { createFileRoute } from '@tanstack/react-router'

import { ArticleEditorForm } from '#/components/articles/article-editor-form'
import {
  getArticleCategoriesFn,
  getArticleFn,
  getAuthorsFn,
} from '#/data/articles'
import type { ArticleFormValues } from '#/lib/schemas'

export const Route = createFileRoute('/_dashboard/articles/$articleId/edit')({
  loader: async ({ params }) => {
    const [article, categories, authors] = await Promise.all([
      getArticleFn({ data: { id: params.articleId } }),
      getArticleCategoriesFn(),
      getAuthorsFn(),
    ])

    return { article, categories, authors }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { article, categories, authors } = Route.useLoaderData()

  const initialValues: ArticleFormValues = {
    title: article.title ?? '',
    excerpt: article.excerpt ?? '',
    accessType: article.access_type || 'FREE',
    featuredImage: article.featured_image || null,
    categoryId: article.category?.id ? String(article.category.id) : '',
    keywords: Array.isArray(article.keywords)
      ? article.keywords.join(', ')
      : '',
    slug: article.slug ?? '',
    authorId: article.author?.id ? String(article.author.id) : '',
    status:
      article.status === 'published' || article.status === 'draft'
        ? article.status
        : 'draft',
  }

  return (
    <ArticleEditorForm
      articleId={article.id ? String(article.id) : ''}
      mode="edit"
      categories={categories}
      authors={authors}
      initialValues={initialValues}
      initialContent={article.content}
      headingTitle={article.title}
    />
  )
}
