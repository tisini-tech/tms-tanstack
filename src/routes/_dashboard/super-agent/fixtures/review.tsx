import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { AgentsReviewButton } from '#/components/fixtures/agents-btn'
import { AgentsReviewTable } from '#/components/fixtures/review/agents-table'
import {
  getTeamsFromReviewStats,
  transformReviewStats,
} from '#/components/fixtures/review/transform-review-stats'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { getFixtureReviewStatsFn } from '#/data/fixtures'

export const Route = createFileRoute('/_dashboard/super-agent/fixtures/review')(
  {
    validateSearch: z.object({
      ids: z.string().optional(),
    }),
    loaderDeps: ({ search: { ids } }) => ({ ids }),
    loader: async ({ deps: { ids } }) => {
      const parsedIds =
        ids
          ?.split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => Number.isFinite(id) && id > 0) ?? []

      const reviewStats = await Promise.all(
        parsedIds.map((id) => getFixtureReviewStatsFn({ data: { id } })),
      )

      return {
        reviewStats: reviewStats.filter(
          (entry): entry is NonNullable<typeof entry> => entry != null,
        ),
      }
    },
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { reviewStats } = Route.useLoaderData()
  const [selectedTeam, setSelectedTeam] = useState('')

  const teams = useMemo(
    () => getTeamsFromReviewStats(reviewStats),
    [reviewStats],
  )

  useEffect(() => {
    if (!selectedTeam && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [selectedTeam, teams])

  const tableData = useMemo(() => {
    if (!selectedTeam || reviewStats.length === 0) return null
    return transformReviewStats(reviewStats[0], selectedTeam)
  }, [reviewStats, selectedTeam])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Fixture Review</h1>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <AgentsReviewButton tableData={tableData} teamName={selectedTeam} />
        </div>
      </div>

      <AgentsReviewTable tableData={tableData} teamName={selectedTeam} />
    </div>
  )
}
