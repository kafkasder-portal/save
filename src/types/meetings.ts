export interface Meeting {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location?: string
  meeting_type: 'physical' | 'online' | 'hybrid'
  meeting_url?: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  updated_at: string
}

export interface MeetingAttendee {
  id: string
  meeting_id: string
  user_id: string
  status: 'invited' | 'accepted' | 'declined' | 'maybe' | 'attended' | 'absent'
  response_date?: string
  notes?: string
}

export interface MeetingAgenda {
  id: string
  meeting_id: string
  title: string
  description?: string
  duration_minutes?: number
  order_index: number
  presenter_id?: string
}

export interface MeetingMinutes {
  id: string
  meeting_id: string
  content: string
  action_items?: ActionItem[]
  created_by: string
  created_at: string
}

export interface ActionItem {
  id: string
  meeting_id: string
  title: string
  description?: string
  assigned_to: string
  due_date?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

// Alias for ActionItem to fix import issues
export type MeetingActionItem = ActionItem

export interface MeetingNotification {
  id: string
  meeting_id: string
  user_id: string
  type: 'invitation' | 'reminder' | 'update' | 'cancellation'
  sent_at: string
  read_at?: string
}

export type MeetingFormData = Omit<Meeting, 'id' | 'created_at' | 'updated_at'> & {
  attendee_ids: string[]
  agenda_items?: Omit<MeetingAgenda, 'id' | 'meeting_id'>[]
}

// Alias for MeetingFormData to fix import issues
export type CreateMeetingData = MeetingFormData

export type MeetingStatus = Meeting['status']
export type AttendeeStatus = MeetingAttendee['status']
export type MeetingType = Meeting['meeting_type']
