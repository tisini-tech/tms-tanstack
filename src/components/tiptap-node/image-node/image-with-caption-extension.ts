import { mergeAttributes } from '@tiptap/core'
import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { ImageWithCaptionView } from '#/components/tiptap-node/image-node/image-with-caption-view'

/**
 * Block image as <figure> with an editable <figcaption>.
 * Keeps the node name `image` so ImageUploadNode / setImage keep working.
 */
export const ImageWithCaption = Image.extend({
  name: 'image',

  content: 'inline*',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const img = el.querySelector('img')
          if (!img?.getAttribute('src')) return false

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
          }
        },
      },
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, height } = HTMLAttributes

    return [
      'figure',
      { class: 'tiptap-image-figure' },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, {
          src,
          alt,
          title,
          width,
          height,
        }),
      ],
      ['figcaption', { class: 'tiptap-image-caption' }, 0],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageWithCaptionView)
  },
})

export default ImageWithCaption
