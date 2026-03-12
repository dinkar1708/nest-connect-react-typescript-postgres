const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
  }
  return data as T
}
