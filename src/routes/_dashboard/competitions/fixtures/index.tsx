import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import type { Fixture } from '#/lib/types'
import SearchBar from '#/components/general/search'
import { columns } from '#/components/fixtures/columns'
import { DataTable } from '#/components/fixtures/fixtures-table'
import { getFixturesFn, searchFixturesFn } from '#/data/fixtures'

export const Route = createFileRoute('/_dashboard/competitions/fixtures/')({
  loader: async () => {
    const fixturesData = await getFixturesFn()

    return { fixturesData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixturesData } = Route.useLoaderData()

  // null = show loader data; array = show search results
  const [searchResults, setSearchResults] = useState<Fixture[] | null>(null)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fixtures = searchResults ?? fixturesData.results ?? []

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    if (!value.trim()) {
      setSearchResults(null)
    }
  }

  const handleSearchClick = async () => {
    if (!search.trim()) {
      setSearchResults(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchFixturesFn({ data: { search } })
      setSearchResults(response.results)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <SearchBar
        search={search}
        handleSearch={handleSearch}
        handleSearchClick={handleSearchClick}
        isLoading={isLoading}
      />

      <DataTable columns={columns} data={fixtures} />
    </div>
  )
}
