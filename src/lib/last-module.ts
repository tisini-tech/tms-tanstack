import { MODULE_ROUTES } from './module-routes'

const LAST_MODULE_PATH_KEY = 'tisini:last-module-path'

function isModulePath(pathname: string) {
  return Object.values(MODULE_ROUTES).some(
    (home) => pathname === home || pathname.startsWith(`${home}/`),
  )
}

/** Persist last module URL so it survives logout (session is cleared). */
export function rememberLastModulePath(pathname: string) {
  if (typeof window === 'undefined') return
  if (!isModulePath(pathname)) return
  localStorage.setItem(LAST_MODULE_PATH_KEY, pathname)
}

export function getLastModulePath(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem(LAST_MODULE_PATH_KEY) ?? undefined
}
