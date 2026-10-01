import { useState } from 'react'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { useRouter } from '@tanstack/react-router'
import { ArrowUpDownIcon, Loader2Icon } from 'lucide-react'

import type {
  Engagement,
  EngagementAnswer,
  EngagementQuestion,
  UpdateEngagementAnswerPayload,
} from '#/lib/types'
import { Button } from '#/components/ui/button'
import { updateAnswerFn } from '#/data/engagements'

/** "Is used" question — Yes choice from the engagement questions API */
export const IS_USED_QUESTION_ID = 207
export const IS_USED_YES_CHOICE_ID = 746
export const IS_USED_NO_CHOICE_ID = 747
export const AGE_QUESTION_ID = 206

export type ParticipationRow = {
  participation_id: number
  values: Record<number, string>
  answersByQuestion: Record<number, EngagementAnswer>
}

function ageFromDate(raw: string) {
  const value = raw.trim()
  // Ignore legacy numeric ages like "24", "30"
  if (/^\d{1,3}$/.test(value)) return '—'

  const birth = new Date(value)
  if (Number.isNaN(birth.getTime())) return '—'

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age -= 1
  }

  if (age < 0 || age > 120) return '—'
  return String(age)
}

function answerValue(
  answer: EngagementAnswer | undefined,
  choiceLabels: Map<number, string>,
  questionId?: number,
) {
  if (!answer) return '—'
  if (answer.text_answer?.trim()) {
    const text = answer.text_answer.trim()
    if (questionId === AGE_QUESTION_ID) return ageFromDate(text)
    return text
  }
  if (answer.choice_id != null) {
    return choiceLabels.get(answer.choice_id) ?? `Choice ${answer.choice_id}`
  }
  if (answer.selected_choice_ids?.length) {
    return answer.selected_choice_ids
      .map((id) => choiceLabels.get(id) ?? `Choice ${id}`)
      .join(', ')
  }
  return '—'
}

export function buildChoiceLabels(questions: EngagementQuestion[]) {
  const labels = new Map<number, string>()
  for (const question of questions) {
    for (const choice of question.choices ?? []) {
      labels.set(choice.id, choice.text)
    }
  }
  return labels
}

export function toParticipationRows(
  engagements: Engagement[],
  questions: EngagementQuestion[],
): ParticipationRow[] {
  const choiceLabels = buildChoiceLabels(questions)

  return engagements.map((engagement) => {
    const byQuestion = new Map(
      (engagement.answers ?? []).map((answer) => [answer.question_id, answer]),
    )
    const values: Record<number, string> = {}
    const answersByQuestion: Record<number, EngagementAnswer> = {}
    for (const question of questions) {
      const answer = byQuestion.get(question.id)
      if (answer) answersByQuestion[question.id] = answer
      values[question.id] = answerValue(answer, choiceLabels, question.id)
    }
    return {
      participation_id: engagement.participation_id,
      values,
      answersByQuestion,
    }
  })
}

function toUpdatePayload(
  answer: EngagementAnswer,
  choiceId: number,
): UpdateEngagementAnswerPayload {
  return {
    id: answer.id,
    question_id: answer.question_id,
    choice_id: choiceId,
    selected_choice_ids: [],
    text_answer: null,
    response_ms: answer.response_ms ?? 0,
    surveyer: null,
    local_id: answer.local_id,
    sync_status: answer.sync_status ?? 0,
  }
}

function MarkUsedButton({
  engId,
  answer,
}: {
  engId: string
  answer: EngagementAnswer
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMarkUsed() {
    setError(null)
    setIsLoading(true)
    try {
      await updateAnswerFn({
        data: {
          engId,
          answerId: answer.id,
          answer: toUpdatePayload(answer, IS_USED_YES_CHOICE_ID),
        },
      })
      await router.invalidate()
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Failed to update answer',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">No</span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => void handleMarkUsed()}
        >
          {isLoading ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : null}
          Mark used
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function sortQuestions(questions: EngagementQuestion[]) {
  return [...questions].sort((a, b) => a.order - b.order || a.id - b.id)
}

export function buildParticipationColumns(
  questions: EngagementQuestion[],
  engId: string,
): ColumnDef<ParticipationRow>[] {
  const sorted = sortQuestions(questions)

  return [
    {
      id: 'id',
      accessorKey: 'participation_id',
      header: ({ column }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium text-foreground">
          {row.original.participation_id}
        </span>
      ),
    },
    ...sorted.map(
      (question): ColumnDef<ParticipationRow> => ({
        id: `q-${question.id}`,
        accessorFn: (row) => row.values[question.id] ?? '',
        meta: {
          cellClassName:
            question.answer_type === 'FT'
              ? 'max-w-[min(20rem,40vw)] whitespace-normal'
              : undefined,
        },
        header: question.text,
        cell: ({ row }) => {
          const answer = row.original.answersByQuestion[question.id]
          const isUsedQuestion = question.id === IS_USED_QUESTION_ID
          const isNo =
            answer?.choice_id === IS_USED_NO_CHOICE_ID ||
            row.original.values[question.id]?.toLowerCase() === 'no'

          if (isUsedQuestion && isNo && answer) {
            return <MarkUsedButton engId={engId} answer={answer} />
          }

          return (
            <span className="text-muted-foreground">
              {row.original.values[question.id] ?? '—'}
            </span>
          )
        },
      }),
    ),
  ]
}

export const participationGlobalFilter: FilterFn<ParticipationRow> = (
  row,
  _columnId,
  filterValue,
) => {
  const q = String(filterValue ?? '')
    .trim()
    .toLowerCase()
  if (!q) return true

  const haystack = [
    String(row.original.participation_id),
    ...Object.values(row.original.values),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}
