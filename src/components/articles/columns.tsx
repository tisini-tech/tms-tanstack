'use client'

import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpDownIcon, FileTextIcon } from 'lucide-react'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import type { Article } from '#/lib/types'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClassName(status: string) {
  const key = status.toLowerCase()
  if (key === 'published' || key === 'public') {
    return 'bg-primary/15 text-primary'
  }
  if (key === 'rejected') {
    return 'bg-destructive/15 text-destructive'
  }
  if (key === 'pending' || key === 'review' || key === 'in_review') {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  }
  return 'bg-muted text-muted-foreground'
}

function ArticleThumbnail({ src, title }: { src?: string | null; title: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src?.trim()) && !failed

  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <FileTextIcon
          className="size-4 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className="sr-only">{title}</span>
    </div>
  )
}

export const articleGlobalFilter: FilterFn<Article> = (
  row,
  _columnId,
  filterValue,
) => {
  const q = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!q) return true

  const article = row.original
  const haystack = [
    article.title,
    article.slug,
    article.excerpt,
    article.author?.username,
    article.category?.name,
    article.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export const articleColumns: ColumnDef<Article>[] = [
  {
    id: 'article',
    accessorFn: (row) => row.title,
    meta: {
      cellClassName: 'max-w-[min(28rem,45vw)] whitespace-normal',
    },
    header: ({ column }) => (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Article
        <ArrowUpDownIcon data-icon="inline-end" />
      </Button>
    ),
    cell: ({ row }) => {
      const article = row.original
      return (
        <Link
          to="/articles/$articleId/edit"
          params={{ articleId: String(article.id) }}
          className="flex min-w-0 max-w-full items-center gap-3 rounded-lg outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArticleThumbnail
            src={article.featured_image}
            title={article.title || 'Untitled'}
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate font-medium leading-snug text-foreground">
              {article.title || 'Untitled'}
            </p>
            <p className="truncate text-xs leading-snug text-muted-foreground">
              /{article.slug}
            </p>
          </div>
        </Link>
      )
    },
  },
  {
    id: 'category',
    accessorFn: (row) => row.category?.name ?? '',
    meta: {
      cellClassName: 'max-w-[12rem]',
    },
    header: 'Category',
    cell: ({ row }) => (
      <span className="block max-w-[12rem] truncate text-muted-foreground">
        {row.original.category?.name ?? '—'}
      </span>
    ),
  },
  {
    id: 'author',
    accessorFn: (row) => row.author?.username ?? '',
    meta: {
      cellClassName: 'max-w-[8rem]',
    },
    header: 'Author',
    cell: ({ row }) => (
      <span className="block max-w-[8rem] truncate text-muted-foreground">
        {row.original.author?.username ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const status = row.original.status || 'unknown'
      return (
        <span
          className={cn(
            'inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize',
            statusClassName(status),
          )}
        >
          {status.toLowerCase()}
        </span>
      )
    },
  },
  {
    id: 'updated',
    accessorFn: (row) => row.updated_at || row.published_at || '',
    meta: {
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(row.original.updated_at || row.original.published_at)}
      </span>
    ),
  },
]
