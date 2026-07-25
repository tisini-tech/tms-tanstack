import { useAppSession } from '@/lib/session'

// Prevent multiple refresh requests at the same time
let refreshPromise: Promise<string> | null = null

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

    const url = process.env.API_URL
    if (!url) {
      throw new Error('API_URL is not set')
    }

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
  withApiKey = false,
  retried = false,
): Promise<Response> {
  const session = await useAppSession()
  const accessToken = session.data.accessToken

  // Public endpoints are guarded by the API key instead of a bearer token.
  if (!accessToken && !withApiKey) {
    throw new Error('No access token found')
  }

  const url = process.env.API_URL
  if (!url) {
    throw new Error('API_URL is not set')
  }

  const apiKey = process.env.API_KEY
  if (withApiKey && !apiKey) {
    throw new Error('API_KEY is not set')
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    'Content-Type': 'application/json',
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
    return apiFetch(path, options, withApiKey, true)
  }

  return res
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(
      error.detail || error.message || `Request failed (${res.status})`,
    )
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const apiService = {
  async get<T>(path: string, withApiKey = false) {
    return parseResponse<T>(await apiFetch(path, { method: 'GET' }, withApiKey))
  },

  async post<T>(path: string, data?: unknown, withApiKey = false) {
    return parseResponse<T>(
      await apiFetch(
        path,
        { method: 'POST', body: JSON.stringify(data) },
        withApiKey,
      ),
    )
  },

  async put<T>(path: string, data?: unknown, withApiKey = false) {
    return parseResponse<T>(
      await apiFetch(
        path,
        { method: 'PUT', body: JSON.stringify(data) },
        withApiKey,
      ),
    )
  },

  async patch<T>(path: string, data?: unknown, withApiKey = false) {
    return parseResponse<T>(
      await apiFetch(
        path,
        { method: 'PATCH', body: JSON.stringify(data) },
        withApiKey,
      ),
    )
  },

  async delete<T>(path: string, withApiKey = false) {
    return parseResponse<T>(
      await apiFetch(path, { method: 'DELETE' }, withApiKey),
    )
  },
}
