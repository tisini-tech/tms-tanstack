'use client'

import type { NodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'

import { cn } from '#/lib/utils'

export function ImageWithCaptionView({ node, selected }: NodeViewProps) {
  const { src, alt, title, width, height } = node.attrs

  return (
    <NodeViewWrapper
      as="figure"
      className={cn(
        'tiptap-image-figure',
        selected && 'tiptap-image-figure--selected',
      )}
    >
      <img
        src={src}
        alt={alt ?? ''}
        title={title ?? undefined}
        width={width ?? undefined}
        height={height ?? undefined}
        draggable={false}
        data-drag-handle
        className="tiptap-image-figure__img"
      />
      <NodeViewContent
        className="tiptap-image-caption"
        data-placeholder="Add a caption…"
      />
    </NodeViewWrapper>
  )
}
