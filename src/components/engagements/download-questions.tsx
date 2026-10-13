import { DownloadIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import type { Engagement, EngagementQuestion } from '#/lib/types'

const ANSWER_TYPE_LABELS: Record<string, string> = {
  SA: 'Single choice',
  MA: 'Multiple choice',
  FT: 'Free text',
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function fileName(title: string) {
  const safe = title.replace(/[\\/:*?"<>|]/g, '').trim()
  return `${safe || 'questions'}.doc`
}

function questionHtml(question: EngagementQuestion, index: number, questions: EngagementQuestion[]) {
  const type = ANSWER_TYPE_LABELS[question.answer_type] ?? question.answer_type
  const parent = questions.find((item) => item.id === question.parent_question_id)
  const unlocks = (question.show_when_choice_ids ?? [])
    .map((choiceId) => parent?.choices.find((choice) => choice.id === choiceId)?.text)
    .filter((text): text is string => Boolean(text))
  const followUp = question.parent_question_id == null
    ? ''
    : unlocks.length
      ? `Shown when ${unlocks.join(' or ')}`
      : 'Follow-up question'

  const choices =
    question.answer_type === 'FT'
      ? '<p class="meta">Written answer</p>'
      : question.choices?.length
        ? `<ol class="choices">${question.choices
            .map(
              (choice, choiceIndex) =>
                `<li><strong>${String.fromCharCode(65 + choiceIndex)}.</strong> ${escapeHtml(choice.text)}</li>`,
            )
            .join('')}</ol>`
        : '<p class="meta">No answers</p>'

  return `
    <h2>${index + 1}. ${escapeHtml(question.text)}</h2>
    <p class="meta">${escapeHtml(type)}${followUp ? ` · ${escapeHtml(followUp)}` : ''}</p>
    ${choices}
  `
}

function documentHtml(engagement: Engagement, questions: EngagementQuestion[]) {
  const title = engagement.title || 'Questions'
  const description = engagement.description?.trim()

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; color: #1a1a1a; line-height: 1.4; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin: 18px 0 2px; }
    .meta { color: #555; font-size: 12px; margin: 0 0 6px; }
    ol.choices { margin: 4px 0 0 18px; padding: 0; }
    li { margin: 2px 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${description ? `<p>${escapeHtml(description)}</p>` : ''}
  ${questions.map((question, index) => questionHtml(question, index, questions)).join('')}
</body>
</html>`
}

export function DownloadQuestions({
  engagement,
  questions,
}: {
  engagement: Engagement
  questions: EngagementQuestion[]
}) {
  function handleDownload() {
    const html = documentHtml(engagement, questions)
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName(engagement.title || 'Questions')
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button type="button" size="lg" variant="outline" onClick={handleDownload}>
      <DownloadIcon className="size-4" data-icon="inline-start" />
      Export doc
    </Button>
  )
}
