const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
const TOKEN_KEY = 'nestconnect_access_token'

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
  }
  return data as T
}
