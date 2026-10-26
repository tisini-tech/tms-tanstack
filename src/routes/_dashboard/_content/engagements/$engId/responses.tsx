import { z } from 'zod'
import { useEffect } from 'react'
import { format } from 'date-fns'
import {
  createFileRoute,
  getRouteApi,
  useRouterState,
} from '@tanstack/react-router'

import { getEngResponsesFn } from '#/data/engagements'
import { ResponseResults } from '#/components/engagements/response-results'

const engRoute = getRouteApi('/_dashboard/_content/engagements/$engId')

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function todayDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

const responseSearchSchema = z.object({
  date: z.string().regex(datePattern).optional(),
  from: z.string().regex(datePattern).optional(),
  to: z.string().regex(datePattern).optional(),
  all: z.literal(true).optional(),
})

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/responses',
)({
  validateSearch: responseSearchSchema,
  loaderDeps: ({ search }) => {
    if (search.all) return {}
    if (search.from && search.to) {
      return { dateFrom: search.from, dateTo: search.to }
    }
    return { date: search.date ?? todayDate() }
  },
  loader: async ({ params: { engId }, deps }) => {
    if (!engId) {
      throw new Error('Engagement ID is required')
    }

    const responses = await getEngResponsesFn({
      data: { engId, ...deps },
    })

    return { responses: responses.results }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { engagement } = engRoute.useLoaderData()
  const { responses } = Route.useLoaderData() ?? {}
  const { date: searchDate, from, to, all } = Route.useSearch()
  const navigate = Route.useNavigate()
  const isLoading = useRouterState({ select: (state) => state.isLoading })
  const hasRange = Boolean(from && to)
  const date = searchDate ?? todayDate()

  useEffect(() => {
    if (searchDate || hasRange || all) return
    void navigate({
      search: { date: todayDate() },
      replace: true,
    })
  }, [all, hasRange, navigate, searchDate])

  return (
    <ResponseResults
      title={engagement?.title || 'Engagement'}
      questions={engagement?.questions ?? []}
      responses={responses ?? []}
      date={date}
      from={from}
      to={to}
      all={all}
      isLoading={isLoading}
      onDayChange={(next) => {
        void navigate({ search: { date: next } })
      }}
      onRangeChange={(nextFrom, nextTo) => {
        void navigate({ search: { from: nextFrom, to: nextTo } })
      }}
      onShowAll={() => {
        void navigate({
          search: all ? { date: todayDate() } : { all: true },
        })
      }}
    />
  )
}
