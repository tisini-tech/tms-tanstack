import { DownloadIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { EngResponse, EngagementQuestion } from '#/lib/types'

type DownloadEngagementsProps = {
  title: string
  questions: EngagementQuestion[]
  responses: EngResponse[]
}

function answerText(question: EngagementQuestion, response: EngResponse) {
  const answer = response.answers?.find(
    (item) => item.question_id === question.id,
  )
  if (!answer) return ''

  if (question.answer_type === 'FT') {
    return answer.text_answer?.trim() ?? ''
  }

  const labels = new Map(
    (question.choices ?? []).map((choice) => [choice.id, choice.text]),
  )
  const selected =
    question.answer_type === 'MA'
      ? answer.selected_choice_ids ?? []
      : answer.choice_id != null
        ? [answer.choice_id]
        : []

  return selected
    .map((choiceId) => labels.get(choiceId) ?? '')
    .filter(Boolean)
    .join(', ')
}

function formatCreatedAt(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function fileName(title: string) {
  const safe = title.replace(/[\\/:*?"<>|]/g, '').trim()
  return `${safe || 'engagement'}.xlsx`
}

export default function DownloadEngagements({
  title,
  questions,
  responses,
}: DownloadEngagementsProps) {
  async function handleDownload() {
    const XLSX = await import('xlsx')
    const headers = [
      'Participant ID',
      'Surveyer',
      'Date Created',
      ...questions.map((question, index) => `${index + 1}. ${question.text}`),
    ]
    const rows = responses.map((response) => [
      response.participation_id,
      response.surveyer?.trim() || '',
      formatCreatedAt(response.created_at),
      ...questions.map((question) => answerText(question, response)),
    ])
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'Responses')
    XLSX.writeFile(book, fileName(title))
  }

  return (
    <Button type="button" size="lg" variant="outline" onClick={handleDownload}>
      <DownloadIcon className="size-4" data-icon="inline-start" />
      Export xlsx
    </Button>
  )
}
