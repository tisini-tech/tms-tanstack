import { useState } from 'react'
import { z } from 'zod'
import { Link, createFileRoute } from '@tanstack/react-router'

import type { Fixture } from '#/lib/types'
import SearchBar from '#/components/general/search'
import { columns } from '#/components/fixtures/columns'
import { DataTable } from '#/components/fixtures/fixtures-table'
import { getFixturesFn, searchFixturesFn } from '#/data/fixtures'

function filterFixturesByTeam(fixtures: Fixture[], teamId: number) {
  return fixtures.filter(
    (fixture) =>
      fixture.home_team.id === teamId || fixture.away_team.id === teamId,
  )
}

function filterFixturesByContext(
  fixtures: Fixture[],
  filters: {
    compId: string
    seasonId?: number
    divisionId?: number
    categoryId?: number
  },
) {
  return fixtures.filter((fixture) => {
    if (String(fixture.competition.id) !== String(filters.compId)) return false
    if (filters.seasonId != null && fixture.season?.id !== filters.seasonId) {
      return false
    }
    if (
      filters.divisionId != null &&
      fixture.division?.id !== filters.divisionId
    ) {
      return false
    }
    if (
      filters.categoryId != null &&
      fixture.category?.id !== filters.categoryId
    ) {
      return false
    }
    return true
  })
}

export const Route = createFileRoute('/_dashboard/_content/competitions/$compId/fixtures/')({
  validateSearch: z.object({
    teamId: z.coerce.number().optional(),
    teamName: z.string().optional(),
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { teamId, teamName } }) => ({
    teamId,
    teamName,
  }),
  loader: async ({ deps: { teamId, teamName } }) => {
    const fixturesData = await getFixturesFn({ data: { pageSize: 100 } })
    let fixtures = fixturesData.results ?? []

    if (teamId) {
      fixtures = filterFixturesByTeam(fixtures, teamId)
    }

    return {
      fixturesData: { ...fixturesData, results: fixtures },
      teamId,
      teamName,
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { fixturesData, teamId, teamName } = Route.useLoaderData()
  const { compId } = Route.useParams()
  const { seasonId, divisionId, categoryId } = Route.useSearch()

  // null = show loader data; array = show search results
  const [searchResults, setSearchResults] = useState<Fixture[] | null>(null)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fixtures = filterFixturesByContext(
    searchResults ?? fixturesData.results ?? [],
    { compId, seasonId, divisionId, categoryId },
  )

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
      let results = response.results ?? []
      if (teamId) {
        results = filterFixturesByTeam(results, teamId)
      }
      setSearchResults(results)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {teamId && teamName ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing fixtures for{' '}
            <span className="font-medium text-foreground">{teamName}</span>
          </p>
          <Link
            to="/competitions/$compId/fixtures"
            params={{ compId }}
            search={{}}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filter
          </Link>
        </div>
      ) : null}

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
