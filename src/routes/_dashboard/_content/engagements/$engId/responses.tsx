import { useEffect } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { getEngResponsesFn } from '#/data/engagements'
import { ResponseResults } from '#/components/engagements/response-results'

const engRoute = getRouteApi('/_dashboard/_content/engagements/$engId')

const datePattern = /^\d{4}-\d{2}-\d{2}$/

function todayDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

const responseSearchSchema = z.object({
  date: z.string().regex(datePattern).optional(),
})

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/responses',
)({
  validateSearch: responseSearchSchema,
  loaderDeps: ({ search }) => ({ date: search.date ?? todayDate() }),
  loader: async ({ params: { engId }, deps }) => {
    if (!engId) {
      throw new Error('Engagement ID is required')
    }

    const responses = await getEngResponsesFn({
      data: { engId, date: deps.date },
    })

    return { responses }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { engagement } = engRoute.useLoaderData()
  const { responses } = Route.useLoaderData() ?? {}
  const { date: searchDate } = Route.useSearch()
  const navigate = Route.useNavigate()
  const date = searchDate ?? todayDate()

  useEffect(() => {
    if (searchDate) return
    void navigate({
      search: { date: todayDate() },
      replace: true,
    })
  }, [navigate, searchDate])

  return (
    <ResponseResults
      title={engagement?.title || 'Engagement'}
      questions={engagement?.questions ?? []}
      responses={responses ?? []}
      date={date}
      onDateChange={(next) => {
        void navigate({
          search: (prev) => ({ ...prev, date: next }),
        })
      }}
    />
  )
}
