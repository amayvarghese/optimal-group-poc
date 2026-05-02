const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

const AUTH_TOKEN_KEY = 'optimal_ai_ops_token'

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  // `headers` must be last: `...init` after an earlier `headers` would replace it and drop `Content-Type`.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  let data: { message?: string } = {}
  try {
    data = await response.json()
  } catch {
    data = { message: response.statusText || `HTTP ${response.status}` }
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data as T
}

/** Same as `apiFetch` but sends `Authorization: Bearer` from localStorage when present. */
export const apiFetchAuth = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null
  return apiFetch<T>(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
