export function formatAgentName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return name
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }

  const first = parts[0]
  const last = parts[parts.length - 1]
  const initial = first.charAt(0).toUpperCase()
  const lastName = last.charAt(0).toUpperCase() + last.slice(1)

  return `${initial}. ${lastName}`
}
