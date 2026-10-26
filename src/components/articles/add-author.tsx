import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Loader2Icon } from 'lucide-react'

import type { User } from '#/lib/types'
import { getUsersFn } from '#/data/users'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { createAuthorFn } from '#/data/articles'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'

function displayName(user: User) {
  const parts = [user.first_name, user.last_name, user.sir_name]
    .map((part) => part?.trim())
    .filter(Boolean)
  if (parts.length) return parts.join(' ')
  return user.name?.trim() || user.email
}

export default function AddAuthorModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const handle = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      void getUsersFn({ data: { search: query.trim() } })
        .then((page) => {
          if (!cancelled) setUsers(page.results ?? [])
        })
        .catch((cause: unknown) => {
          if (cancelled) return
          setUsers([])
          setError(
            cause instanceof Error ? cause.message : 'Failed to load users',
          )
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [open, query])

  async function addUser(user: User) {
    setAddingId(user.id)
    setError(null)
    try {
      await createAuthorFn({
        data: { userId: user.id, displayName: displayName(user) },
      })
      await router.invalidate()
      setOpen(false)
      setQuery('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to add author')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery('')
          setError(null)
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        Add author
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add author</DialogTitle>
          <DialogDescription>
            Search for a user and add them as an author. Only their name is
            saved.
          </DialogDescription>
        </DialogHeader>

        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search users…"
          aria-label="Search users"
          className="h-9"
        />

        <div className="scrollbar-thin max-h-72 overflow-y-auto">
          {loading ? (
            <p className="flex items-center gap-2 px-1 py-6 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Loading users
            </p>
          ) : users.length === 0 ? (
            <p className="px-1 py-6 text-sm text-muted-foreground">
              {query.trim()
                ? 'No users match that search.'
                : 'No users to show.'}
            </p>
          ) : (
            <ul className="flex flex-col">
              {users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {displayName(user)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={addingId !== null}
                    onClick={() => void addUser(user)}
                  >
                    {addingId === user.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </DialogContent>
    </Dialog>
  )
}
