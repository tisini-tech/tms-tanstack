import { useEffect, useMemo } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'

import {
  buildParticipationColumns,
  IS_USED_QUESTION_ID,
  IS_USED_YES_CHOICE_ID,
  participationGlobalFilter,
  toParticipationRows,
} from '#/components/engagements/answer-columns'
import { DataTable } from '#/components/ui/data-table'
import { getEngAnswersFn, getEngQuestionsFn } from '#/data/engagements'

const POLL_MS = 8_000

export const Route = createFileRoute('/_dashboard/_content/engagements/')({
  loader: async () => {
    const engId = '24'
    const [participations, detail] = await Promise.all([
      getEngAnswersFn({ data: { engId } }),
      getEngQuestionsFn({ data: { engId } }),
    ])

    return {
      engId,
      participations: participations ?? [],
      questions: detail?.questions ?? [],
      title: detail?.title ?? 'Engagement answers',
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { engId, participations, questions, title } = Route.useLoaderData()

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void router.invalidate()
    }
    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [router])

  const rows = useMemo(
    () => toParticipationRows(participations, questions),
    [participations, questions],
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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-heading">
          {title}
        </h1>
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
