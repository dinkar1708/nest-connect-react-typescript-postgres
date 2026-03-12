import { api } from './api'

export interface User {
  id: string
  name: string
  email: string
  createdAt?: string
}

export function getUsers(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  return api<User[]>(`/users${q}`)
}
