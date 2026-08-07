import { getArticlesFn } from '#/data/articles'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/articles/')({
  loader: async () => {
    const articles = await getArticlesFn()
    return { articles }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { articles } = Route.useLoaderData()

  console.log(articles)
  return <div>Hello "/_dashboard/articles/"!</div>
}
