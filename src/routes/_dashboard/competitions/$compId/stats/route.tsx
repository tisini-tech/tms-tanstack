import { z } from 'zod'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { getCompetitionRoundsFn } from '#/data/competitions'
import { MonthPicker } from '#/components/stats/month-picker'
import { RoundMultiSelect } from '#/components/stats/round-multi-select'

const roundsSearchSchema = z.preprocess((value) => {
  if (value == null || value === '') return undefined
  return Array.isArray(value) ? value : [value]
}, z.array(z.string()).optional())

export const Route = createFileRoute('/_dashboard/competitions/$compId/stats')({
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    divisionId: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    rounds: roundsSearchSchema,
    month: z.string().optional(),
  }),
  loaderDeps: ({ search: { seasonId, divisionId } }) => ({
    seasonId,
    divisionId,
  }),
  loader: async ({ params: { compId }, deps: { seasonId, divisionId } }) => {
    const rounds =
      seasonId != null
        ? await getCompetitionRoundsFn({
            data: {
              competitionId: compId,
              seasonId: String(seasonId),
              ...(divisionId != null && { divisionId: String(divisionId) }),
            },
          })
        : []

    return { rounds }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { rounds } = Route.useLoaderData()
  const { seasonId, rounds: selectedRounds, month } = Route.useSearch()
  const navigate = Route.useNavigate()
  const selected = selectedRounds ?? []

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <RoundMultiSelect
          options={rounds}
          value={selected}
          disabled={!seasonId}
          onChange={(nextRounds) =>
            navigate({
              search: (prev) => ({
                ...prev,
                rounds: nextRounds.length > 0 ? nextRounds : undefined,
              }),
              replace: true,
            })
          }
        />

        <MonthPicker
          value={month}
          onChange={(nextMonth) =>
            navigate({
              search: (prev) => ({
                ...prev,
                month: nextMonth,
              }),
              replace: true,
            })
          }
        />
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}
