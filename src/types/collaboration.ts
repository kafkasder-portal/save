// =====================================================
// Collaboration Module Types
// =====================================================

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  meeting_type: 'physical' | 'online' | 'hybrid';
  meeting_url?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'maybe' | 'attended' | 'absent';
  response_date?: string;
  notes?: string;
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  order_index: number;
  presenter_id?: string;
}

export interface MeetingMinutes {
  id: string;
  meeting_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface MeetingActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface MeetingNotification {
  id: string;
  meeting_id: string;
  user_id: string;
  type: 'invitation' | 'reminder' | 'update' | 'cancellation';
  sent_at: string;
  read_at?: string;
}

// =====================================================
// Internal Messages Types
// =====================================================

export interface Conversation {
  id: string;
  name?: string;
  conversation_type: 'direct' | 'group';
  created_by: string;
  description?: string;
  avatar_url?: string;
  is_archived: boolean;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  left_at?: string;
  is_muted: boolean;
  last_read_at?: string;
}

export interface InternalMessage {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
  edited_at?: string;
  deleted_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface MessageNotification {
  id: string;
  user_id: string;
  conversation_id: string;
  message_id: string;
  type: 'new_message' | 'mention' | 'reply';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// =====================================================
// Tasks Types
// =====================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_by: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface TaskNotification {
  id: string;
  task_id: string;
  user_id: string;
  type: 'assignment' | 'due_reminder' | 'completion' | 'comment' | 'status_change';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: 'created' | 'assigned' | 'status_changed' | 'commented' | 'completed' | 'due_date_changed';
  old_value?: string;
  new_value?: string;
  description: string;
  created_at: string;
}

// =====================================================
// API Response Types
// =====================================================

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
  completion_rate: number;
}

// =====================================================
// Form Types
// =====================================================

export interface CreateMeetingData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  meeting_type: 'physical' | 'online' | 'hybrid';
  meeting_url?: string;
  attendees?: string[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigned_to: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  estimated_hours?: number;
}

export interface CreateConversationData {
  name?: string;
  conversation_type: 'direct' | 'group';
  description?: string;
  participants: string[];
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
}