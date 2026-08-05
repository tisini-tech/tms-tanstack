import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MODULE_ROUTES } from './module-routes'
import type { EventSequence, Module, TeamStats } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePath(pathname: string) {
  if (pathname === '/') return '/'
  return pathname.replace(/\/$/, '')
}

export function safeInternalPath(path: string | undefined, fallback = '/home') {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return fallback
  }
  return path
}

export function resolvePostLoginPath(
  redirect: string | undefined,
  modules: Module[],
  lastPath?: string,
) {
  const homes = modules
    .map((m) => MODULE_ROUTES[m.name])
    .filter(Boolean)
  const defaultHome = homes[0] ?? '/home'

  const pickAllowed = (path: string | undefined) => {
    const safe = safeInternalPath(path, '')
    if (!safe) return undefined
    const allowed = homes.some(
      (home) => safe === home || safe.startsWith(`${home}/`),
    )
    return allowed ? safe : undefined
  }

  // 1) ?redirect= (session expiry / deep link)
  // 2) last module the user was in before logout
  // 3) first allowed module
  return pickAllowed(redirect) ?? pickAllowed(lastPath) ?? defaultHome
}

export function formatE164Phone(
  countryCode: string,
  localPhone: string,
): string {
  const code = countryCode.trim().startsWith('+')
    ? countryCode.trim()
    : `+${countryCode.trim()}`
  const digits = localPhone.trim().replace(/\D/g, '').replace(/^0+/, '')
  return `${code}${digits}`
}

export function formatApiError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const body = error as {
    detail?: unknown
    message?: unknown
    error?: unknown
  }

  if (typeof body.detail === 'string') return body.detail
  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error

  // Django/DRF field errors: { field: ["msg"] } or detail: [{ msg, loc }]
  if (Array.isArray(body.detail)) {
    const parts = body.detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return null
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' ')
  }

  const fieldMessages = Object.entries(body)
    .flatMap(([key, value]) => {
      if (key === 'detail' || key === 'message' || key === 'error') return []
      if (typeof value === 'string') return [`${key}: ${value}`]
      if (Array.isArray(value)) return value.map((v) => `${key}: ${String(v)}`)
      return []
    })
    .filter(Boolean)

  if (fieldMessages.length) return fieldMessages.join(' ')

  return fallback
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function getPercent(total: number, stat: number) {
  if (total === 0) {
    return 0
  }

  return Math.round((stat / total) * 100)
}

export const getEventCount = (
  id: string,
  stats: TeamStats[],
  isHome: boolean,
) => {
  return (
    stats.find((event) => event.event_id === Number(id))?.[
      isHome ? 'home_count' : 'away_count'
    ] || 0
  )
}

export const getSubEventCount = (
  id: string,
  subId: string,
  stats: TeamStats[],
  isHome: boolean,
) => {
  return (
    stats
      .find((event) => event.event_id === Number(id))
      ?.sub_events.find((subEvent) => subEvent.subevent_id === Number(subId))?.[
      isHome ? 'home_count' : 'away_count'
    ] || 0
  )
}

export const getPassSeqs = (sequences: EventSequence[]) => {
  const sequencesOver10 = sequences.filter(
    (item) => item.pass_count >= 10,
  ).length
  const sequences7to9 = sequences.filter(
    (item) => item.pass_count >= 7 && item.pass_count <= 9,
  ).length
  const sequences4to6 = sequences.filter(
    (item) => item.pass_count >= 4 && item.pass_count <= 6,
  ).length
  const sequencesBelow3 = sequences.filter((item) => item.pass_count < 4).length

  return {
    title: 'Passing Sequences',
    below3: sequencesBelow3,
    btwn4to6: sequences4to6,
    btwn7to9: sequences7to9,
    over10: sequencesOver10,
    total: sequences.length,
  }
}
