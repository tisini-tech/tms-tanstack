import { useState } from 'react'
import {
  CheckIcon,
  ChevronDown,
  Loader2,
  PencilIcon,
  XIcon,
} from 'lucide-react'

import { AddReviewCommentsModal } from '#/components/fixtures/review/add-comments'
import { Button } from '#/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { Textarea } from '#/components/ui/textarea'
import { saveReviewCommentsFn, updateReviewCommentsFn } from '#/data/fixtures'
import { cn } from '#/lib/utils'

type ReviewComment = {
  id: string
  text: string
}

type ReviewCommentsListProps = {
  title: string
  fixtureId: string
  teamId: number
  agentId: number
  reviewId?: number
  initialComments?: string[]
}

function toLocalComments(review: string[]): ReviewComment[] {
  return review.map((text, index) => ({
    id: `initial-${index}`,
    text,
  }))
}

export function ReviewCommentsList({
  title,
  fixtureId,
  teamId,
  agentId,
  reviewId,
  initialComments = [],
}: ReviewCommentsListProps) {
  const [comments, setComments] = useState<ReviewComment[]>(() =>
    toLocalComments(initialComments),
  )
  const [savedReviewId, setSavedReviewId] = useState<number | undefined>(reviewId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  const handleAdd = (text: string) => {
    setComments((current) => [...current, { id: crypto.randomUUID(), text }])
    setSaveMessage(null)
  }

  const startEdit = (comment: ReviewComment) => {
    setEditingId(comment.id)
    setEditDraft(comment.text)
    setSaveMessage(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft('')
  }

  const saveEdit = (id: string) => {
    const trimmed = editDraft.trim()
    if (!trimmed) return

    setComments((current) =>
      current.map((comment) =>
        comment.id === id ? { ...comment, text: trimmed } : comment,
      ),
    )
    cancelEdit()
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    
    try {
      const payload = {
        fixtureId,
        agentId,
        teamId,
        review: comments.map((comment) => comment.text),
      }

      if (savedReviewId != null) {
        await updateReviewCommentsFn({
          data: { ...payload, reviewId: savedReviewId },
        })
      } else {
        const created = await saveReviewCommentsFn({ data: payload })
        setSavedReviewId(created.id)
      }
      setSaveMessage('Comments saved.')
    } catch (error) {
      console.error(error)
      const message =
        error instanceof Error ? error.message : 'Failed to save comments.'
      setSaveMessage(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-lg border border-border p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-1">
          <CollapsibleTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={isOpen ? 'Collapse comments' : 'Expand comments'}
              />
            }
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
            />
          </CollapsibleTrigger>
          <AddReviewCommentsModal onAdd={handleAdd} />
        </div>
      </div>

      <CollapsibleContent className="space-y-3 pt-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ol className="space-y-2">
            {comments.map((comment, index) => {
              const isEditing = editingId === comment.id

              return (
                <li
                  key={comment.id}
                  className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 font-medium text-muted-foreground">
                      {index + 1}.
                    </span>

                    <div className="min-w-0 flex-1 space-y-2">
                      {isEditing ? (
                        <Textarea
                          value={editDraft}
                          onChange={(event) => setEditDraft(event.target.value)}
                          rows={3}
                          aria-label={`Edit comment ${index + 1}`}
                        />
                      ) : (
                        <p>{comment.text}</p>
                      )}

                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Save edit"
                              onClick={() => saveEdit(comment.id)}
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Cancel edit"
                              onClick={cancelEdit}
                            >
                              <XIcon className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label="Edit comment"
                            onClick={() => startEdit(comment)}
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <Button
            type="button"
            className="w-full"
            disabled={comments.length === 0 || isSaving || editingId !== null}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save comments'
            )}
          </Button>
          {saveMessage ? (
            <p className="text-center text-sm text-muted-foreground">
              {saveMessage}
            </p>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
