export function formatAgentName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  if (parts.length === 1) return parts[0]

  const first = parts[0]
  const last = parts[parts.length - 1]
  return `${first[0].toLowerCase()}. ${last}`
}
