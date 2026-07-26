import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'

import { useAppSession } from '#/lib/session'
import { normalizePath } from '#/lib/utils'

const PUBLIC_PATHS = new Set(['/', '/about', '/login', '/register'])

function isPublicRoute(pathname: string) {
  return PUBLIC_PATHS.has(normalizePath(pathname))
}

function isInternalRequest(pathname: string) {
  return (
    pathname.startsWith('/_tanstack') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  )
}

export const authMiddleware = createMiddleware().server(
  async ({ next, pathname, handlerType }) => {
    // Server function RPC (loginFn, etc.) — auth is enforced per-function, not here.
    if (handlerType === 'serverFn') {
      return next()
    }

    if (isPublicRoute(pathname) || isInternalRequest(pathname)) {
      return next()
    }

    const session = await useAppSession()

    if (!session.data.user) {
      throw redirect({
        to: '/login',
        search: { redirect: pathname },
      })
    }

    return next({ context: { session } })
  },
)

export const authFnMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await useAppSession()

    if (!session.data.user) {
      throw redirect({ to: '/login' })
    }

    return next({ context: { session } })
  },
)
