export const initialEvents = [19, 238, 155, 154, 203, 240, 7, 25, 31]

export function parseEventIdsSearch(
  value: string | undefined,
): number[] | null {
  if (value == null || value.trim() === '') return null
  const ids = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
  return ids.length > 0 ? [...new Set(ids)] : null
}

export function serializeEventIdsSearch(ids: number[]): string {
  return [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))].join(
    ',',
  )
}

export function resolveDashboardEventIds(
  searchValue: string | undefined,
): number[] {
  return parseEventIdsSearch(searchValue) ?? initialEvents
}
