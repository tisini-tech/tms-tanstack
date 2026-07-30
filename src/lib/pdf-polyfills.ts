/**
 * @react-pdf/renderer expects Node's Buffer in the browser.
 * Only run in the client — the `buffer` package is CJS and breaks SSR.
 */
export async function ensurePdfPolyfills() {
  if (typeof window === 'undefined') {
    return
  }

  const globalScope = globalThis as typeof globalThis & {
    Buffer?: unknown
  }

  if (typeof globalScope.Buffer !== 'undefined') {
    return
  }

  const { Buffer } = await import('buffer')
  globalScope.Buffer = Buffer
}
