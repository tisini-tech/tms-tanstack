export function formatStatDisplay(
  value: string | number | undefined | null,
): string {
  if (value === undefined || value === null || value === '') {
    return '—'
  }

  if (typeof value === 'number') {
    return value === 0 ? '—' : String(value)
  }

  const str = String(value).trim()
  if (str === '0' || str === '-') {
    return '—'
  }

  // e.g. "0 / 0 0%" — no non-zero digits
  if (!/[1-9]/.test(str)) {
    return '—'
  }

  return str
}
