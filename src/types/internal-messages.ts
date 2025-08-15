export interface InternalMessage {
  id: string
  sender_id: string
  conversation_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  reply_to?: string
  edited_at?: string
  deleted_at?: string
  read_at?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  name?: string
  conversation_type: 'direct' | 'group'
  created_by: string
  description?: string
  avatar_url?: string
  is_archived: boolean
  last_message_at?: string
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  left_at?: string
  is_muted: boolean
  last_read_at?: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface MessageNotification {
  id: string
  user_id: string
  conversation_id: string
  message_id: string
  type: 'new_message' | 'mention' | 'reply'
  is_read: boolean
  created_at: string
  read_at?: string
}

export interface MessageSearch {
  query: string
  conversation_id?: string
  sender_id?: string
  message_type?: InternalMessage['message_type']
  date_from?: string
  date_to?: string
}

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & {
    user: {
      id: string
      full_name: string
      avatar_url?: string
      role: string
    }
  })[]
  last_message?: InternalMessage & {
    sender: {
      full_name: string
    }
  }
  unread_count: number
}

export interface MessageWithDetails extends InternalMessage {
  sender: {
    id: string
    full_name: string
    avatar_url?: string
  }
  reply_to_message?: InternalMessage & {
    sender: {
      full_name: string
    }
  }
  reactions: (MessageReaction & {
    user: {
      full_name: string
    }
  })[]
}

export type MessageFormData = {
  content: string
  conversation_id: string
  reply_to?: string
  file?: File
}

export type ConversationFormData = {
  name?: string
  conversation_type: 'direct' | 'group'
  participant_ids: string[]
  description?: string
}

export type ConversationType = Conversation['conversation_type']
export type MessageType = InternalMessage['message_type']
export type ParticipantRole = ConversationParticipant['role']
