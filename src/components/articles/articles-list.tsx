import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import type { Article } from '#/lib/types'
import { Button } from '#/components/ui/button'
import { DataTable } from '#/components/ui/data-table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { articleColumns, articleGlobalFilter } from './columns'

const ALL_STATUSES = 'all'

interface ArticlesListProps {
  articles: Article[]
  totalItems?: number
}

export function ArticlesList({ articles, totalItems }: ArticlesListProps) {
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES)

  const statuses = useMemo(() => {
    const values = new Set(
      articles.map((article) => article.status).filter(Boolean),
    )
    return [...values].sort((a, b) => a.localeCompare(b))
  }, [articles])

  const filteredByStatus = useMemo(() => {
    if (statusFilter === ALL_STATUSES) return articles
    return articles.filter((article) => article.status === statusFilter)
  }, [articles, statusFilter])

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Articles
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalItems != null
              ? `${totalItems} article${totalItems === 1 ? '' : 's'} in total`
              : `${articles.length} article${articles.length === 1 ? '' : 's'}`}
          </p>
        </div>

        <Button
          render={<Link to="/articles/create" />}
          nativeButton={false}
          className="shrink-0"
        >
          <PlusIcon data-icon="inline-start" />
          New article
        </Button>
      </div>

      <DataTable
        columns={articleColumns}
        data={filteredByStatus}
        searchPlaceholder="Search title, author, category…"
        emptyMessage={
          articles.length === 0
            ? 'No articles yet. Create your first article to get started.'
            : 'No articles match your search or status filter.'
        }
        globalFilterFn={articleGlobalFilter}
        toolbar={
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? ALL_STATUSES)}
          >
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Status">
              <SelectValue placeholder="All statuses">
                {statusFilter === ALL_STATUSES ? 'All statuses' : statusFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}
