export async function ensurePdfPolyfills() {
  if (typeof window === 'undefined') {
    return
  }

  if (typeof globalThis.Buffer !== 'undefined') {
    return
  }

  const { Buffer } = await import('buffer')
  globalThis.Buffer = Buffer
}
