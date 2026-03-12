import { api } from './api'

export interface User {
  id: string
  name: string
  email: string
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: string
  sender?: User
  receiver?: User
}

export function getFriends() {
  return api<User[]>('/friends')
}

export function getPendingReceived() {
  return api<FriendRequest[]>('/friends/requests/received')
}

export function acceptRequest(requestId: string) {
  return api<{ message: string }>(`/friends/request/${requestId}/accept`, {
    method: 'POST',
  })
}

export function rejectRequest(requestId: string) {
  return api<{ message: string }>(`/friends/request/${requestId}/reject`, {
    method: 'POST',
  })
}

export function sendFriendRequest(receiverId: string) {
  return api<unknown>('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ receiverId }),
  })
}
