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

export const Route = createFileRoute('/_dashboard/competitions/$compId/fixtures/')({
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
  loader: async ({ params: { compId }, deps: { teamId, teamName } }) => {
    const fixturesData = await getFixturesFn()
    let fixtures = (fixturesData.results ?? []).filter(
      (fixture) => String(fixture.competition.id) === String(compId),
    )

    if (teamId) {
      if (teamName?.trim()) {
        const searchData = await searchFixturesFn({
          data: { search: teamName.trim() },
        }).catch(() => null)
        if (searchData?.results?.length) {
          const byId = new Map<number, Fixture>()
          for (const fixture of [
            ...fixtures,
            ...searchData.results.filter(
              (fixture) => String(fixture.competition.id) === String(compId),
            ),
          ]) {
            byId.set(fixture.id, fixture)
          }
          fixtures = [...byId.values()]
        }
      }

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
