import { createFileRoute, getRouteApi } from '@tanstack/react-router'

import { DownloadQuestions } from '#/components/engagements/download-questions'
import type { EngagementQuestion } from '#/lib/types'

const engRoute = getRouteApi('/_dashboard/_content/engagements/$engId')

export const Route = createFileRoute(
  '/_dashboard/_content/engagements/$engId/',
)({
  component: RouteComponent,
})

const ANSWER_TYPE_LABELS: Record<string, string> = {
  SA: 'Single choice',
  MA: 'Multiple choice',
  FT: 'Free text',
}

function byOrder(left: EngagementQuestion, right: EngagementQuestion) {
  return left.order - right.order || left.id - right.id
}

function unlockLabel(
  question: EngagementQuestion,
  questions: EngagementQuestion[],
) {
  if (question.parent_question_id == null) return null

  const parent = questions.find(
    (item) => item.id === question.parent_question_id,
  )
  const answers = (question.show_when_choice_ids ?? [])
    .map(
      (choiceId) =>
        parent?.choices.find((choice) => choice.id === choiceId)?.text,
    )
    .filter((text): text is string => Boolean(text))

  if (!answers.length) return 'Follow-up question'
  return `Shown when ${answers.join(' or ')}`
}

function RouteComponent() {
  const { engagement } = engRoute.useLoaderData()

  const ordered = [...(engagement?.questions ?? [])].sort(byOrder)

  if (!ordered.length) {
    return (
      <p className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No questions for this engagement.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DownloadQuestions
          engagement={engagement}
          questions={ordered}
        />
      </div>
    <ol className="space-y-3">
      {ordered.map((question, index) => {
        const followUp = unlockLabel(question, ordered)
        const choices = [...(question.choices ?? [])]

        return (
          <li
            key={question.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-heading">{question.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {ANSWER_TYPE_LABELS[question.answer_type] ??
                      question.answer_type}
                    {followUp ? ` · ${followUp}` : ''}
                  </p>
                </div>

                {question.image_url ? (
                  <img
                    src={question.image_url}
                    alt=""
                    className="max-h-48 rounded-lg border border-border object-contain"
                  />
                ) : null}

                {question.answer_type === 'FT' ? (
                  <p className="rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                    Written answer
                  </p>
                ) : choices.length ? (
                  <ul className="space-y-1.5">
                    {choices.map((choice, choiceIndex) => (
                      <li
                        key={choice.id}
                        className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-muted-foreground">
                          {String.fromCharCode(65 + choiceIndex)}.
                        </span>
                        <span>{choice.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No answers.</p>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
    </div>
  )
}
