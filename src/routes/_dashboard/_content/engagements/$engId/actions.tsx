import { DataTable } from '#/components/ui/data-table'
import { getEngResponsesFn } from '#/data/engagements'
import {
  createFileRoute,
  getRouteApi,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'

import {
  buildParticipationColumns,
  IS_USED_QUESTION_ID,
  IS_USED_YES_CHOICE_ID,
  participationGlobalFilter,
  toParticipationRows,
} from '#/components/engagements/answer-columns'

const engRoute = getRouteApi('/_dashboard/_content/engagements/$engId')

const POLL_MS = 8_000

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/actions',
)({
  loader: async ({ parentMatchPromise, params }) => {
    const parent = await parentMatchPromise
    const engagement = (
      parent?.loaderData as
        { engagement?: { is_responses_editable?: boolean } } | undefined
    )?.engagement

    if (!engagement?.is_responses_editable) {
      throw redirect({
        to: '/engagements/$engId',
        params,
      })
    }

    const { engId } = params
    if (!engId) {
      throw new Error('Engagement ID is required')
    }

    const responses = await getEngResponsesFn({ data: { engId } })

    return { responses }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { engId } = Route.useParams()

  const { engagement } = engRoute.useLoaderData()
  const { responses } = Route.useLoaderData() ?? {}

  const questions = engagement?.questions ?? []
  const submissions = responses ?? []

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void router.invalidate()
    }
    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [router])

  const rows = useMemo(
    () => toParticipationRows(submissions, questions),
    [submissions, questions],
  )
  const usedCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.answersByQuestion[IS_USED_QUESTION_ID]?.choice_id ===
          IS_USED_YES_CHOICE_ID,
      ).length,
    [rows],
  )
  const columns = useMemo(
    () => buildParticipationColumns(questions, engId),
    [questions, engId],
  )

  return (
    <div className="w-full min-w-0 max-w-full space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {rows.length} response{rows.length === 1 ? '' : 's'} · {usedCount}{' '}
          used
        </p>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search name, phone, gender…"
        emptyMessage="No responses found for this engagement."
        globalFilterFn={participationGlobalFilter}
      />
    </div>
  )
}
