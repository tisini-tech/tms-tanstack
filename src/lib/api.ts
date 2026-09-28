import { useAppSession } from '@/lib/session'

export type ApiBase = 'manage' | 'scores'

export type ApiRequestOptions = {
  /** Defaults to `manage` (`API_URL`). Use `scores` for `API_SCORES_URL`. */
  base?: ApiBase
  withApiKey?: boolean
}

// Prevent multiple refresh requests at the same time
let refreshPromise: Promise<string> | null = null

function resolveApiBaseUrl(base: ApiBase = 'manage') {
  if (base === 'scores') {
    const url = process.env.API_SCORES_URL
    if (!url) {
      throw new Error('API_SCORES_URL is not set')
    }
    return url.replace(/\/$/, '')
  }

  const url = process.env.API_URL
  if (!url) {
    throw new Error('API_URL is not set')
  }
  return url.replace(/\/$/, '')
}

// Function to refresh the access token
// Returns a promise that resolves to the new access token
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const session = await useAppSession()
    const refreshToken = session.data.refreshToken

    if (!refreshToken) {
      throw new Error('No refresh token found')
    }

    const url = resolveApiBaseUrl('manage')

    const res = await fetch(`${url}/auth/refresh-token`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(
        `Failed to refresh access token: ${error.detail || 'Failed to refresh access token'}`,
      )
    }

    const data = await res.json()

    await session.update({
      ...session.data,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    })

    return data.access_token as string
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  requestOptions: ApiRequestOptions = {},
  retried = false,
): Promise<Response> {
  const { base = 'manage', withApiKey = false } = requestOptions
  const session = await useAppSession()
  const accessToken = session.data.accessToken

  // Public endpoints are guarded by the API key instead of a bearer token.
  if (!accessToken && !withApiKey) {
    throw new Error('No access token found')
  }

  const url = resolveApiBaseUrl(base)

  const apiKey = process.env.API_KEY
  if (withApiKey && !apiKey) {
    throw new Error('API_KEY is not set')
  }

  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  // Let the runtime set multipart boundary for FormData.
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (withApiKey && apiKey) {
    headers['X-API-Key'] = apiKey
  }

  const res = await fetch(`${url}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && accessToken && !retried) {
    await refreshAccessToken()
    return apiFetch(path, options, requestOptions, true)
  }

  return res
}

function formatErrorItem(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(formatErrorItem).filter(Boolean).join(', ')
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.msg === 'string') return record.msg
    if (typeof record.message === 'string') return record.message
    if (typeof record.detail === 'string') return record.detail
  }
  return ''
}

function formatErrorBody(error: unknown, status: number): string {
  if (!error || typeof error !== 'object') {
    return `Request failed (${status})`
  }

  const body = error as Record<string, unknown>
  const detail = formatErrorItem(body.detail)
  if (detail) return detail

  const message = formatErrorItem(body.message)
  if (message) return message

  const fieldErrors = Object.entries(body)
    .map(([key, value]) => {
      const text = formatErrorItem(value)
      return text ? `${key}: ${text}` : ''
    })
    .filter(Boolean)

  return fieldErrors.join('. ') || `Request failed (${status})`
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(formatErrorBody(error, res.status))
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const apiService = {
  async get<T>(path: string, options: ApiRequestOptions = {}) {
    return parseResponse<T>(await apiFetch(path, { method: 'GET' }, options))
  },

  async post<T>(
    path: string,
    data?: unknown,
    options: ApiRequestOptions = {},
  ) {
    const body = data instanceof FormData ? data : JSON.stringify(data ?? {})

    return parseResponse<T>(
      await apiFetch(path, { method: 'POST', body }, options),
    )
  },

  async put<T>(
    path: string,
    data?: unknown,
    options: ApiRequestOptions = {},
  ) {
    return parseResponse<T>(
      await apiFetch(
        path,
        { method: 'PUT', body: JSON.stringify(data) },
        options,
      ),
    )
  },

  async patch<T>(
    path: string,
    data?: unknown,
    options: ApiRequestOptions = {},
  ) {
    return parseResponse<T>(
      await apiFetch(
        path,
        { method: 'PATCH', body: JSON.stringify(data) },
        options,
      ),
    )
  },

  async delete<T>(path: string, options: ApiRequestOptions = {}) {
    return parseResponse<T>(
      await apiFetch(path, { method: 'DELETE' }, options),
    )
  },
}
