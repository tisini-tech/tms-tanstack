import { SearchIcon } from 'lucide-react'
import { Suspense, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

import { Input } from '#/components/ui/input'
import { competitionQueryOptions } from '#/data/competitions'
import { CompetitionCard } from '#/components/competitions/competition-card'

export const Route = createFileRoute('/_dashboard/competitions/_competitions/')(
  {
    loader: async ({ context }) => {
      await context.queryClient.ensureQueryData(competitionQueryOptions)
    },
    component: competitionsPage,
  },
)

function competitionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompetitionsGrid />
    </Suspense>
  )
}

function CompetitionsGrid() {
  const { data: competitions } = useSuspenseQuery(competitionQueryOptions)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return competitions

    return competitions.filter((competition) => {
      const haystack = [
        competition.name,
        competition.country?.name,
        competition.country?.iso_code2,
        competition.description,
        ...competition.seasons.map((season) => season.name),
        ...competition.divisions.map((division) => division.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [competitions, search])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            Competitions
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length}
            {search.trim() ? ` of ${competitions.length}` : ''}{' '}
            {filtered.length === 1 ? 'competition' : 'competitions'}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search competitions"
            className="h-10 rounded-xl pl-9"
            aria-label="Search competitions"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {search.trim()
            ? 'No competitions match your search.'
            : 'No competitions found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      )}
    </div>
  )
}
