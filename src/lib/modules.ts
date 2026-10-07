/** API module `name` → app home path */
export const MODULE_ROUTES: Record<string, string> = {
  Competition: '/competitions',
  Content: '/articles',
  Administration: '/super-agent',
  Engagement: '/engagements',
  Voting: '/voting',
  Payment: '/wallet',
}

const LAST_MODULE_PATH_KEY = 'tisini:last-module-path'

function isModulePath(path: string) {
  const pathname = path.split('?')[0] ?? path
  return Object.values(MODULE_ROUTES).some(
    (home) => pathname === home || pathname.startsWith(`${home}/`),
  )
}

/** Persist last module URL, including search, so it survives logout. */
export function rememberLastModulePath(path: string) {
  if (typeof window === 'undefined') return
  if (!isModulePath(path)) return
  localStorage.setItem(LAST_MODULE_PATH_KEY, path)
}

export function getLastModulePath(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return localStorage.getItem(LAST_MODULE_PATH_KEY) ?? undefined
}
