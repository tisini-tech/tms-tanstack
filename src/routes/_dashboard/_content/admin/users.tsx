import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import type { User } from '#/lib/types'
import { getUsersFn } from '#/data/users'
import { DataTable } from '#/components/ui/data-table'
import { userColumns } from '#/components/admin/user-columns'

export const Route = createFileRoute('/_dashboard/_content/admin/users')({
  loader: async () => {
    const users = await getUsersFn()

    return { users: users.results }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { users } = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState<User[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setSearched(null)
      setSearching(false)
      setSearchError(null)
      return
    }

    let cancelled = false
    const handle = window.setTimeout(() => {
      setSearching(true)
      setSearchError(null)
      void getUsersFn({ data: { search: trimmed } })
        .then((page) => {
          if (!cancelled) setSearched(page.results)
        })
        .catch((cause: unknown) => {
          if (cancelled) return
          setSearched([])
          setSearchError(
            cause instanceof Error ? cause.message : 'Failed to search users',
          )
        })
        .finally(() => {
          if (!cancelled) setSearching(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [query])

  const filtering = query.trim().length > 0
  const rows = searched ?? users

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          {filtering
            ? searched
              ? `${searched.length} result${searched.length === 1 ? '' : 's'}`
              : 'Searching…'
            : `Latest ${users.length} users`}
        </p>
      </div>

      {searchError ? (
        <p className="text-sm text-destructive">{searchError}</p>
      ) : null}

      <DataTable
        columns={userColumns}
        data={rows}
        searchPlaceholder="Search name, email, phone…"
        emptyMessage={
          filtering ? 'No users match your search.' : 'No users yet.'
        }
        onSearchChange={setQuery}
        searching={searching}
      />
    </div>
  )
}
