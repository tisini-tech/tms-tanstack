/** Strip timestamp query params from a video URL. */
export function stripVideoTimestamp(url: string) {
  if (!url?.trim()) return ''
  return url.split(/[?&]t=/)[0]?.replace(/\?$/, '') ?? ''
}

export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null
      }
      return parsed.searchParams.get('v')
    }
  } catch {
    return null
  }

  return null
}

export function isYouTubeUrl(url: string) {
  return extractYouTubeId(url) != null
}

/** Embed URL that starts playback at `startSeconds`. */
export function toYouTubeEmbedUrl(
  url: string,
  startSeconds = 0,
  options?: { autoplay?: boolean },
) {
  const id = extractYouTubeId(url)
  if (!id) return null

  const start = Math.max(0, Math.floor(startSeconds))
  const params = new URLSearchParams({
    start: String(start),
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })

  if (options?.autoplay) {
    params.set('autoplay', '1')
    // Browsers often block unmuted autoplay.
    params.set('mute', '1')
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

export function parseTimestampFromUrl(url: string): number | null {
  const match = url.match(/[?&]t=(\d+(?:\.\d+)?)/)
  if (!match?.[1]) return null
  const value = Number(match[1])
  return Number.isFinite(value) ? value : null
}

export function isSecondHalfMoment(moment: string) {
  const normalized = moment.trim().toLowerCase().replace(/[\s_-]+/g, '')
  return (
    normalized === 'secondhalf' ||
    normalized === '2ndhalf' ||
    normalized === 'second' ||
    normalized === 'h2'
  )
}
