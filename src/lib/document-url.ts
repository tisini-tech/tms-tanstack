/** Sync check for URLs that already advertise PDF (extension, query, or hash). */
export function looksLikePdfUrl(url: string) {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (/\.pdf(?:$|[?#])/i.test(trimmed)) return true
  if (/[?#][^#]*pdf/i.test(trimmed)) return true
  return false
}

/**
 * UploadThing (and similar CDNs) often omit the original extension.
 * Probe Content-Type; fall back to sync URL heuristics.
 */
export async function isPdfDocument(url: string): Promise<boolean> {
  const trimmed = url.trim()
  if (!trimmed) return false
  if (looksLikePdfUrl(trimmed)) return true

  try {
    const response = await fetch(trimmed, {
      method: 'HEAD',
      mode: 'cors',
    })
    const type = response.headers.get('content-type') ?? ''
    if (type.toLowerCase().includes('application/pdf')) return true
  } catch {
    // CORS or network — try a tiny ranged GET as fallback
  }

  try {
    const response = await fetch(trimmed, {
      method: 'GET',
      headers: { Range: 'bytes=0-4' },
      mode: 'cors',
    })
    const type = response.headers.get('content-type') ?? ''
    if (type.toLowerCase().includes('application/pdf')) return true

    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    // %PDF-
    if (
      bytes.length >= 4 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    ) {
      return true
    }
  } catch {
    return false
  }

  return false
}

/** Tag PDF uploads so we can detect them even when the CDN URL has no .pdf. */
export function tagPdfUploadUrl(url: string) {
  if (looksLikePdfUrl(url)) return url
  const hash = url.includes('#') ? '' : '#pdf'
  return `${url}${hash}`
}
