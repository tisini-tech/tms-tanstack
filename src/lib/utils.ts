import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeInternalPath(
  path: string | undefined,
  fallback = '/dashboard',
) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return fallback
  }
  return path
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
