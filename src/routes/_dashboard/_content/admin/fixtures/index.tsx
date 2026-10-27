import { useEffect, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { adminFixtureColumns } from '#/components/admin/fixture-columns'
import { Button } from '#/components/ui/button'
import { DataTable } from '#/components/ui/data-table'
import { getFixturesFn, searchFixturesFn } from '#/data/fixtures'
import type { Fixture } from '#/lib/types'

export const Route = createFileRoute('/_dashboard/_content/admin/fixtures/')({
  loader: async () => {
    const fixtures = await getFixturesFn()

    return { fixtures: fixtures.results }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixtures } = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState<Fixture[] | null>(null)
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
      void searchFixturesFn({ data: { search: trimmed } })
        .then((page) => {
          if (!cancelled) setSearched(page.results)
        })
        .catch((cause: unknown) => {
          if (cancelled) return
          setSearched([])
          setSearchError(
            cause instanceof Error ? cause.message : 'Failed to search fixtures',
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
  const rows = searched ?? fixtures

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Fixtures
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtering
              ? searched
                ? `${searched.length} result${searched.length === 1 ? '' : 's'}`
                : 'Searching…'
              : `Latest ${fixtures.length} fixtures`}
          </p>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link to="/admin/fixtures/add" />}
        >
          <PlusIcon className="size-4" />
          Add Fixture
        </Button>
      </div>

      {searchError ? (
        <p className="text-sm text-destructive">{searchError}</p>
      ) : null}

      <DataTable
        columns={adminFixtureColumns}
        data={rows}
        searchPlaceholder="Search teams, competition, season, or id…"
        emptyMessage={
          filtering ? 'No fixtures match your search.' : 'No fixtures yet.'
        }
        onSearchChange={setQuery}
        searching={searching}
      />
    </div>
  )
}
