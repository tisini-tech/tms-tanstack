import { createFileRoute } from '@tanstack/react-router'

import AddAuthorModal from '#/components/articles/add-author'
import { authorColumns } from '#/components/articles/author-columns'
import { DataTable } from '#/components/ui/data-table'
import { getAuthorsFn } from '#/data/articles'

export const Route = createFileRoute('/_dashboard/_content/articles/authors/')({
  loader: async () => {
    const authors = await getAuthorsFn()

    return { authors }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { authors } = Route.useLoaderData()

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Authors
          </h1>
          <p className="text-sm text-muted-foreground">
            {authors.length} author{authors.length === 1 ? '' : 's'}
          </p>
        </div>
        <AddAuthorModal />
      </div>

      <DataTable
        columns={authorColumns}
        data={authors}
        searchPlaceholder="Search name, bio, website…"
        emptyMessage={
          authors.length === 0
            ? 'No authors yet.'
            : 'No authors match your search.'
        }
      />
    </div>
  )
}
