import axios from 'axios'
import { Message } from '@/types/internal-messages'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface CreateMessageData {
  content: string
  recipient_id?: string
  room_id?: string
  message_type?: 'text' | 'file' | 'image'
  parent_message_id?: string
}

export interface MessageFilters {
  room_id?: string
  user_id?: string
  message_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

export const messagesApi = {
  // Get all messages with optional filters
  async getMessages(filters?: MessageFilters): Promise<Message[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/api/messages${params.toString() ? `?${params.toString()}` : ''}`)
    return response.data
  },

  // Get a single message by ID
  async getMessage(id: string): Promise<Message> {
    const response = await api.get(`/api/messages/${id}`)
    return response.data
  },

  // Create a new message
  async createMessage(data: CreateMessageData): Promise<Message> {
    const response = await api.post('/api/messages', data)
    return response.data
  },

  // Update an existing message
  async updateMessage(id: string, data: Partial<CreateMessageData>): Promise<Message> {
    const response = await api.put(`/api/messages/${id}`, data)
    return response.data
  },

  // Delete a message
  async deleteMessage(id: string): Promise<void> {
    await api.delete(`/api/messages/${id}`)
  },

  // Get messages for a specific room
  async getRoomMessages(roomId: string): Promise<Message[]> {
    const response = await api.get(`/api/messages/room/${roomId}`)
    return response.data
  },

  // Get direct messages between two users
  async getDirectMessages(userId: string): Promise<Message[]> {
    const response = await api.get(`/api/messages/direct/${userId}`)
    return response.data
  },

  // Get chat rooms for current user
  async getChatRooms(): Promise<any[]> {
    const response = await api.get('/api/messages/rooms')
    return response.data
  },

  // Create a new chat room
  async createChatRoom(data: { name: string; participants: string[] }): Promise<any> {
    const response = await api.post('/api/messages/rooms', data)
    return response.data
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    await api.patch(`/api/messages/${messageId}/read`)
  },

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/api/messages/unread-count')
    return response.data.count
  },

  // Search messages
  async searchMessages(query: string, filters?: MessageFilters): Promise<Message[]> {
    const params = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/api/messages/search?${params.toString()}`)
    return response.data
  },

  // Get message statistics
  async getMessageStats(): Promise<any> {
    const response = await api.get('/api/messages/stats')
    return response.data
  }
}

export default messagesApi
