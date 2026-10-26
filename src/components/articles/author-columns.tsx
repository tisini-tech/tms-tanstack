import type { ColumnDef } from '@tanstack/react-table'

import DeleteAuthorButton from '#/components/articles/delete-author'
import EditAuthorModal from '#/components/articles/edit-author'
import type { Author } from '#/lib/types'

const SOCIALS: Array<{ label: string; key: keyof Author }> = [
  { label: 'Twitter', key: 'twitter' },
  { label: 'Facebook', key: 'facebook' },
  { label: 'Instagram', key: 'instagram' },
  { label: 'LinkedIn', key: 'linkedin' },
  { label: 'YouTube', key: 'youtube' },
]

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function hrefFor(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

function socialsFor(author: Author) {
  return SOCIALS.flatMap((item) => {
    const value = text(author[item.key])
    if (!value) return []
    return [{ label: item.label, href: value }]
  })
}

export const authorColumns: ColumnDef<Author>[] = [
  {
    id: 'name',
    accessorFn: (row) => text(row.display_name),
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium">
        {text(row.original.display_name) || '—'}
      </span>
    ),
  },
  {
    id: 'bio',
    accessorFn: (row) => text(row.bio),
    header: 'Bio',
    meta: { cellClassName: 'max-w-md whitespace-normal' },
    cell: ({ row }) => (
      <span className="line-clamp-2 text-muted-foreground">
        {text(row.original.bio) || '—'}
      </span>
    ),
  },
  {
    id: 'website',
    accessorFn: (row) => text(row.website),
    header: 'Website',
    cell: ({ row }) => {
      const website = text(row.original.website)
      if (!website) return <span className="text-muted-foreground">—</span>
      return (
        <a
          href={hrefFor(website)}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          {website}
        </a>
      )
    },
  },
  {
    id: 'social',
    accessorFn: (row) =>
      socialsFor(row)
        .map((social) => `${social.label} ${social.href}`)
        .join(' '),
    header: 'Social',
    meta: { cellClassName: 'whitespace-normal' },
    cell: ({ row }) => {
      const socials = socialsFor(row.original)
      if (!socials.length) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {socials.map((social) => (
            <a
              key={social.label}
              href={hrefFor(social.href)}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              {social.label}
            </a>
          ))}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    enableGlobalFilter: false,
    meta: {
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <EditAuthorModal author={row.original} />
        <DeleteAuthorButton author={row.original} />
      </div>
    ),
  },
]
