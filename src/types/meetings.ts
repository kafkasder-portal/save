export interface Meeting {
  id: string
  title: string
  description?: string
  type: 'meeting' | 'conference' | 'workshop' | 'interview'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  start_time: string
  end_time: string
  location?: string
  meeting_url?: string
  organizer_id: string
  created_at: string
  updated_at: string
  tags?: string[]
  participants?: Array<{
    id: string
    full_name: string
  }>
  organizer?: {
    full_name: string
  }
}

export interface CreateMeetingData {
  title: string
  description?: string
  type: 'meeting' | 'conference' | 'workshop' | 'interview'
  start_time: string
  end_time: string
  location?: string
  meeting_url?: string
  participants?: string
  tags?: string
}

export interface MeetingActivity {
  id: string
  meeting_id: string
  user_id: string
  action: string
  details?: any
  created_at: string
  user?: {
    full_name: string
  }
}

export interface MeetingComment {
  id: string
  meeting_id: string
  user_id: string
  content: string
  created_at: string
  user?: {
    full_name: string
  }
}

export interface MeetingAttachment {
  id: string
  meeting_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_at: string
  uploaded_by: string
  uploader?: {
    full_name: string
  }
}