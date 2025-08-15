import axios from 'axios'
import { Task } from '@/types/collaboration'

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

export interface CreateTaskData {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assigned_to?: string
  due_date?: string
  estimated_hours?: number
  project_id?: string
  tags?: string[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}

export interface TaskFilters {
  status?: string
  priority?: string
  assigned_to?: string
  project_id?: string
  due_date_from?: string
  due_date_to?: string
  search?: string
}

export const tasksApi = {
  // Get all tasks with optional filters
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/api/tasks${params.toString() ? `?${params.toString()}` : ''}`)
    return response.data
  },

  // Get a single task by ID
  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/api/tasks/${id}`)
    return response.data
  },

  // Create a new task
  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/api/tasks', data)
    return response.data
  },

  // Update an existing task
  async updateTask(id: string, data: Partial<CreateTaskData>): Promise<Task> {
    const response = await api.put(`/api/tasks/${id}`, data)
    return response.data
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/api/tasks/${id}`)
  },

  // Get tasks for current user
  async getMyTasks(): Promise<Task[]> {
    const response = await api.get('/api/tasks/my-tasks')
    return response.data
  },

  // Get tasks assigned to a specific user
  async getTasksByAssignee(userId: string): Promise<Task[]> {
    const response = await api.get(`/api/tasks/assignee/${userId}`)
    return response.data
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: string): Promise<Task> {
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status })
    return response.data
  },

  // Add comment to task
  async addComment(taskId: string, comment: string): Promise<any> {
    const response = await api.post(`/api/tasks/${taskId}/comments`, { content: comment })
    return response.data
  },

  // Get task comments
  async getTaskComments(taskId: string): Promise<any[]> {
    const response = await api.get(`/api/tasks/${taskId}/comments`)
    return response.data
  },

  // Add attachment to task
  async addAttachment(taskId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`/api/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get task attachments
  async getTaskAttachments(taskId: string): Promise<any[]> {
    const response = await api.get(`/api/tasks/${taskId}/attachments`)
    return response.data
  },

  // Get task activities
  async getTaskActivities(taskId: string): Promise<any[]> {
    const response = await api.get(`/api/tasks/${taskId}/activities`)
    return response.data
  },

  // Get task statistics
  async getTaskStats(): Promise<any> {
    const response = await api.get('/api/tasks/stats')
    return response.data
  },

  // Search tasks
  async searchTasks(query: string, filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams({ q: query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/api/tasks/search?${params.toString()}`)
    return response.data
  }
}

export default tasksApi
