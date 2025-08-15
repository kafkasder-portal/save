import axios from 'axios'
import { Meeting } from '@/types/collaboration'

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

export interface CreateMeetingData {
  title: string
  description?: string
  start_date: string
  end_date: string
  location?: string
  meeting_type: 'in_person' | 'virtual' | 'hybrid'
  max_participants?: number
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  organizer_id?: string
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  id: string
}

export interface MeetingFilters {
  status?: string
  date_from?: string
  date_to?: string
  organizer_id?: string
  search?: string
}

export const meetingsApi = {
  // Get all meetings with optional filters
  async getMeetings(filters?: MeetingFilters): Promise<Meeting[]> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }
    
    const response = await api.get(`/api/meetings${params.toString() ? `?${params.toString()}` : ''}`)
    return response.data
  },

  // Get a single meeting by ID
  async getMeeting(id: string): Promise<Meeting> {
    const response = await api.get(`/api/meetings/${id}`)
    return response.data
  },

  // Create a new meeting
  async createMeeting(data: CreateMeetingData): Promise<Meeting> {
    const response = await api.post('/api/meetings', data)
    return response.data
  },

  // Update an existing meeting
  async updateMeeting(id: string, data: Partial<CreateMeetingData>): Promise<Meeting> {
    const response = await api.put(`/api/meetings/${id}`, data)
    return response.data
  },

  // Delete a meeting
  async deleteMeeting(id: string): Promise<void> {
    await api.delete(`/api/meetings/${id}`)
  },

  // Get meeting attendees
  async getAttendees(meetingId: string): Promise<any[]> {
    const response = await api.get(`/api/meetings/${meetingId}/attendees`)
    return response.data
  },

  // Add attendee to meeting
  async addAttendee(meetingId: string, userId: string): Promise<void> {
    await api.post(`/api/meetings/${meetingId}/attendees`, { user_id: userId })
  },

  // Remove attendee from meeting
  async removeAttendee(meetingId: string, userId: string): Promise<void> {
    await api.delete(`/api/meetings/${meetingId}/attendees/${userId}`)
  },

  // Update meeting status
  async updateStatus(meetingId: string, status: string): Promise<Meeting> {
    const response = await api.patch(`/api/meetings/${meetingId}/status`, { status })
    return response.data
  },

  // Get meetings for current user
  async getMyMeetings(): Promise<Meeting[]> {
    const response = await api.get('/api/meetings/my-meetings')
    return response.data
  },

  // Get upcoming meetings
  async getUpcomingMeetings(): Promise<Meeting[]> {
    const response = await api.get('/api/meetings/upcoming')
    return response.data
  },

  // Get meeting statistics
  async getMeetingStats(): Promise<any> {
    const response = await api.get('/api/meetings/stats')
    return response.data
  }
}

export default meetingsApi
