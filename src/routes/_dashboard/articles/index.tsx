import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/core'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'

import {
  ARTICLE_AUTHORS,
  ArticleEditorHeader,
  ArticleEditorSidebar,
  ArticleTitleFields,
} from '#/components/articles/editor-shell'
import { SimpleEditor } from '#/components/tiptap-templates/simple/simple-editor'
import { articleSchema, type ArticleSchema } from '#/lib/schemas'
import { rememberLastModulePath } from '#/lib/last-module'

export const Route = createFileRoute('/_dashboard/articles/')({
  component: RouteComponent,
})

const defaultValues: ArticleSchema = {
  title: '',
  slug: '',
  authorId: ARTICLE_AUTHORS[0]?.id ?? '',
  categoryIds: [],
  tags: '',
  excerpt: '',
  visibility: 'public',
  status: 'draft',
  featuredImage: null,
}

function RouteComponent() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const submitIntent = useRef<'draft' | 'publish'>('publish')

  useEffect(() => {
    rememberLastModulePath('/articles')
  }, [])

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: articleSchema,
    },
    onSubmit: async ({ value }) => {
      const contentHtml = editor?.getHTML() ?? ''
      const contentJson = editor?.getJSON() ?? null

      const payload = {
        ...value,
        status:
          submitIntent.current === 'publish'
            ? ('published' as const)
            : ('draft' as const),
        tags: value.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        contentHtml,
        contentJson,
      }

      // Replace with createArticle server fn when ready
      console.log(payload)
    },
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/40">
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          submitIntent.current = 'publish'
          form.setFieldValue('status', 'published')
          void form.handleSubmit()
        }}
      >
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <ArticleEditorHeader
              isSubmitting={isSubmitting}
              onSaveDraft={() => {
                submitIntent.current = 'draft'
                form.setFieldValue('status', 'draft')
                void form.handleSubmit()
              }}
            />
          )}
        </form.Subscribe>

        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <form.Field name="title">
              {(titleField) => (
                <form.Field name="slug">
                  {(slugField) => (
                    <ArticleTitleFields
                      titleField={titleField}
                      slugField={slugField}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>

            <div className="border-t border-border">
              <SimpleEditor embedded onEditorReady={setEditor} />
            </div>
          </main>

          <div className="lg:sticky lg:top-4 lg:self-start">
            <form.Field name="authorId">
              {(authorField) => (
                <form.Field name="categoryIds">
                  {(categoryField) => (
                    <form.Field name="tags">
                      {(tagsField) => (
                        <form.Field name="excerpt">
                          {(excerptField) => (
                            <form.Field name="visibility">
                              {(visibilityField) => (
                                <form.Field name="status">
                                  {(statusField) => (
                                    <form.Field name="featuredImage">
                                      {(featuredImageField) => (
                                        <ArticleEditorSidebar
                                          authorField={authorField}
                                          categoryField={categoryField}
                                          tagsField={tagsField}
                                          excerptField={excerptField}
                                          visibilityField={visibilityField}
                                          statusField={statusField}
                                          featuredImageField={
                                            featuredImageField
                                          }
                                        />
                                      )}
                                    </form.Field>
                                  )}
                                </form.Field>
                              )}
                            </form.Field>
                          )}
                        </form.Field>
                      )}
                    </form.Field>
                  )}
                </form.Field>
              )}
            </form.Field>
          </div>
        </div>
      </form>
    </div>
  )
}
