import { api } from './api'

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

const ACCESS_TOKEN_KEY = 'nestconnect_access_token'
const REFRESH_TOKEN_KEY = 'nestconnect_refresh_token'
const USER_KEY = 'nestconnect_user'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

export function setAuth(res: AuthResponse): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, res.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(res.user))
}

export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}
