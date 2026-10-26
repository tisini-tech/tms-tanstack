import type { ColumnDef } from '@tanstack/react-table'

import EditUserModal, {
  roleName,
  userName,
  userPhone,
} from '#/components/admin/edit-user'
import type { User } from '#/lib/types'

export const userColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorFn: (row) => userName(row),
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium">{userName(row.original)}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '—',
  },
  {
    id: 'phone',
    accessorFn: (row) => userPhone(row),
    header: 'Phone',
    cell: ({ row }) => userPhone(row.original),
  },
  {
    id: 'role',
    accessorFn: (row) => roleName(row.role),
    header: 'Role',
    cell: ({ row }) => roleName(row.original.role),
  },
  {
    id: 'status',
    accessorFn: (row) =>
      `${row.is_active ? 'Active' : 'Inactive'} ${row.is_verified ? 'Verified' : 'Unverified'}`,
    header: 'Status',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.is_active ? 'Active' : 'Inactive'}
        {' · '}
        {row.original.is_verified ? 'Verified' : 'Unverified'}
      </span>
    ),
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
      <div className="flex justify-end">
        <EditUserModal user={row.original} />
      </div>
    ),
  },
]
