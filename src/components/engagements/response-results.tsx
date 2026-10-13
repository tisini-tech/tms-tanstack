import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import DownloadEngagements from '#/components/engagements/download-eng'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { EngAnswer, EngResponse, EngagementQuestion } from '#/lib/types'

const BAR_COLORS = [
  '#3498db',
  '#e74c3c',
  '#2ecc71',
  '#f1c40f',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#5dade2',
  '#fd79a8',
  '#6c5ce7',
]

function byOrder(left: EngagementQuestion, right: EngagementQuestion) {
  return left.order - right.order || left.id - right.id
}

type ChoiceTally = {
  id: number
  label: string
  count: number
}

function talliesForQuestion(
  question: EngagementQuestion,
  answers: EngAnswer[],
): { total: number; rows: ChoiceTally[] } {
  const counts = new Map<number, number>()
  for (const choice of question.choices ?? []) {
    counts.set(choice.id, 0)
  }

  let total = 0
  for (const answer of answers) {
    const selected =
      question.answer_type === 'MA'
        ? answer.selected_choice_ids ?? []
        : answer.choice_id != null
          ? [answer.choice_id]
          : []
    if (!selected.length) continue
    total += 1
    for (const choiceId of selected) {
      counts.set(choiceId, (counts.get(choiceId) ?? 0) + 1)
    }
  }

  const known = new Set((question.choices ?? []).map((choice) => choice.id))
  const rows: ChoiceTally[] = (question.choices ?? []).map((choice) => ({
    id: choice.id,
    label: choice.text,
    count: counts.get(choice.id) ?? 0,
  }))

  for (const [choiceId, count] of counts) {
    if (known.has(choiceId) || count === 0) continue
    rows.push({ id: choiceId, label: `Choice ${choiceId}`, count })
  }

  return { total, rows }
}

function responseMoments(responses: EngResponse[]) {
  return responses
    .map((response) => response.created_at || response.completed_at)
    .map((value) => (value ? new Date(value) : null))
    .filter((date): date is Date => date != null && !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime())
}

function hourStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
  ).getTime()
}

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function formatMoment(date: Date) {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ResponseTiming({ responses }: { responses: EngResponse[] }) {
  const moments = responseMoments(responses)
  if (moments.length < 2) return null

  const first = moments[0]
  const last = moments[moments.length - 1]
  const spanHours = (last.getTime() - first.getTime()) / (60 * 60 * 1000)
  const byDay = spanHours > 36
  const step = byDay ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
  const start = byDay ? dayStart(first) : hourStart(first)
  const end = byDay ? dayStart(last) : hourStart(last)
  const counts = new Map<number, number>()

  for (const moment of moments) {
    const key = byDay ? dayStart(moment) : hourStart(moment)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const buckets: Array<{ key: number; count: number }> = []
  for (let key = start; key <= end; key += step) {
    buckets.push({ key, count: counts.get(key) ?? 0 })
  }

  const busiest = buckets.reduce((best, bucket) =>
    bucket.count > best.count ? bucket : best,
  )
  const peak = Math.max(1, ...buckets.map((bucket) => bucket.count))
  const busiestLabel = new Date(busiest.key).toLocaleString(undefined, {
    month: byDay ? 'short' : undefined,
    day: byDay ? 'numeric' : undefined,
    hour: byDay ? undefined : 'numeric',
  })

  return (
    <section className="shrink-0 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">First </span>
          <span className="font-medium">{formatMoment(first)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Last </span>
          <span className="font-medium">{formatMoment(last)}</span>
        </p>
        <p>
          <span className="text-muted-foreground">Busiest </span>
          <span className="font-medium">
            {busiestLabel} · {busiest.count}
          </span>
        </p>
      </div>
      <div className="mt-3 flex h-10 items-end gap-1">
        {buckets.map((bucket) => {
          const height = bucket.count === 0 ? 4 : Math.max(8, (bucket.count / peak) * 100)
          const label = new Date(bucket.key).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
          })

          return (
            <div
              key={bucket.key}
              className="flex h-full min-w-0 flex-1 items-end"
              title={`${label}: ${bucket.count}`}
            >
              <div
                className="w-full rounded-sm bg-primary"
                style={{
                  height: `${height}%`,
                  opacity: bucket.key === busiest.key ? 1 : 0.55,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {buckets.map((bucket, index) => {
          const text = axisLabel(bucket.key, byDay, index, buckets)
          if (!text) return null
          return <span key={bucket.key}>{text}</span>
        })}
      </div>
    </section>
  )
}

function axisLabel(
  key: number,
  byDay: boolean,
  index: number,
  buckets: Array<{ key: number }>,
) {
  const every = buckets.length <= 16 ? 1 : Math.ceil(buckets.length / 8)
  const isTick =
    index === 0 || index === buckets.length - 1 || index % every === 0
  if (!isTick) return ''

  const date = new Date(key)
  if (byDay) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return date.toLocaleTimeString(undefined, { hour: 'numeric' })
}

function answersFor(
  questionId: number,
  responses: EngResponse[],
): Array<{ answer: EngAnswer; surveyer: string }> {
  const rows = []
  for (const response of responses) {
    for (const answer of response.answers ?? []) {
      if (answer.question_id === questionId) {
        rows.push({
          answer,
          surveyer: response.surveyer?.trim() || 'Anonymous',
        })
      }
    }
  }
  return rows
}

export function ResponseResults({
  title,
  questions,
  responses,
}: {
  title: string
  questions: EngagementQuestion[]
  responses: EngResponse[]
}) {
  const ordered = [...questions].sort(byOrder)

  if (!responses.length) {
    return (
      <p className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No responses for this engagement.
      </p>
    )
  }

  if (!ordered.length) {
    return (
      <p className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No questions for this engagement.
      </p>
    )
  }

  return (
    <QuestionFocus
      title={title}
      questions={ordered}
      responses={responses}
    />
  )
}

function QuestionFocus({
  title,
  questions,
  responses,
}: {
  title: string
  questions: EngagementQuestion[]
  responses: EngResponse[]
}) {
  const [index, setIndex] = useState(0)
  const [chart, setChart] = useState<'bar' | 'pie'>('bar')
  const current = Math.min(index, questions.length - 1)
  const question = questions[current]
  const matched = answersFor(question.id, responses)
  const items = questions.map((item, itemIndex) => ({
    value: String(item.id),
    label: `${itemIndex + 1}. ${item.text}`,
  }))

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex shrink-0 flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-medium tabular-nums text-foreground">
            {responses.length} response{responses.length === 1 ? '' : 's'}
          </p>
          <DownloadEngagements
            title={title}
            questions={questions}
            responses={responses}
          />
        </div>
        <ResponseTiming responses={responses} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={String(question.id)}
            items={items}
            onValueChange={(value) => {
              const next = questions.findIndex(
                (item) => String(item.id) === value,
              )
              if (next >= 0) setIndex(next)
            }}
          >
            <SelectTrigger className="h-11 w-full min-w-0 text-base">
              <SelectValue placeholder="Select a question" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex shrink-0 items-center gap-2">
            <p className="mr-1 text-sm tabular-nums text-muted-foreground">
              {current + 1} of {questions.length}
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={current === 0}
              onClick={() => setIndex(current - 1)}
            >
              <ChevronLeftIcon className="size-4" data-icon="inline-start" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={current === questions.length - 1}
              onClick={() => setIndex(current + 1)}
            >
              Next
              <ChevronRightIcon className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>

      <section className="w-full rounded-xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <p className="text-lg font-medium text-heading">{question.text}</p>
        </div>
        <div className="p-6">
          {question.answer_type === 'FT' ? (
            <FreeTextAnswers rows={matched} />
          ) : (
            <ChoiceBreakdown
              question={question}
              answers={matched.map((row) => row.answer)}
              chart={question.answer_type === 'SA' ? chart : 'bar'}
              onChartChange={
                question.answer_type === 'SA' ? setChart : undefined
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}

function ChoiceBreakdown({
  question,
  answers,
  chart,
  onChartChange,
}: {
  question: EngagementQuestion
  answers: EngAnswer[]
  chart: 'bar' | 'pie'
  onChartChange?: (chart: 'bar' | 'pie') => void
}) {
  const { total, rows } = talliesForQuestion(question, answers)
  const widest = Math.max(1, ...rows.map((row) => row.count))
  const colored = rows.map((row, rowIndex) => ({
    ...row,
    color: BAR_COLORS[rowIndex % BAR_COLORS.length],
    share: total === 0 ? 0 : Math.round((row.count / total) * 100),
  }))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total} response{total === 1 ? '' : 's'}
          {question.answer_type === 'MA'
            ? ' · people can select more than one'
            : ''}
        </p>
        {onChartChange ? (
          <div className="flex rounded-2xl border border-border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={chart === 'bar' ? 'secondary' : 'ghost'}
              onClick={() => onChartChange('bar')}
            >
              Bar
            </Button>
            <Button
              type="button"
              size="sm"
              variant={chart === 'pie' ? 'secondary' : 'ghost'}
              onClick={() => onChartChange('pie')}
            >
              Pie
            </Button>
          </div>
        ) : null}
      </div>
      {colored.length ? (
        chart === 'pie' ? (
          <PieBreakdown rows={colored} />
        ) : (
          <ul className="space-y-5">
            {colored.map((row) => {
              const width =
                total === 0 ? 0 : Math.round((row.count / widest) * 100)

              return (
                <li key={row.id} className="space-y-1.5">
                  <ChoiceLabel row={row} />
                  <div className="h-4 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${width}%`, background: row.color }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )
      ) : (
        <p className="text-sm text-muted-foreground">No answer choices.</p>
      )}
    </div>
  )
}

function ChoiceLabel({
  row,
}: {
  row: { label: string; count: number; share: number; color: string }
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: row.color }}
        />
        <span className="truncate">{row.label}</span>
      </span>
      <span className="shrink-0 tabular-nums text-muted-foreground">
        {row.count} · {row.share}%
      </span>
    </div>
  )
}

function PieBreakdown({
  rows,
}: {
  rows: Array<{
    id: number
    label: string
    count: number
    share: number
    color: string
  }>
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  let cursor = 0
  const stops =
    total === 0
      ? ['var(--muted) 0% 100%']
      : rows
          .filter((row) => row.count > 0)
          .map((row) => {
            const start = cursor
            cursor += (row.count / total) * 100
            return `${row.color} ${start}% ${cursor}%`
          })

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div
        className="aspect-square w-full max-w-72 shrink-0 rounded-full sm:size-[min(100%,20rem)]"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
        role="img"
        aria-label="Answer share"
      />
      <ul className="w-full min-w-0 space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <ChoiceLabel row={row} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function FreeTextAnswers({
  rows,
}: {
  rows: Array<{ answer: EngAnswer; surveyer: string }>
}) {
  const written = rows.filter((row) => row.answer.text_answer?.trim())

  if (!written.length) {
    return (
      <p className="text-sm text-muted-foreground">No written answers yet.</p>
    )
  }

  return (
    <div className="flex max-h-96 flex-col gap-3">
      <p className="shrink-0 text-sm text-muted-foreground">
        {written.length} written answer{written.length === 1 ? '' : 's'}
      </p>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
        {written.map((row) => (
          <li
            key={row.answer.id}
            className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
          >
            <p>{row.answer.text_answer}</p>
            <p className="mt-1 text-xs text-muted-foreground">{row.surveyer}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
