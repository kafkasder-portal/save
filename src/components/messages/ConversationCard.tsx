import { memo } from 'react'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/avatar'
import { 
  Users, 
  User, 
  Clock,
  Pin,
  Archive,
  Volume2,
  VolumeX
} from 'lucide-react'
import type { ConversationWithDetails } from '../../types/internal-messages'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface ConversationCardProps {
  conversation: ConversationWithDetails
  onClick: (conversation: ConversationWithDetails) => void
  isSelected?: boolean
  currentUserId: string
}

export const ConversationCard = memo(function ConversationCard({
  conversation,
  onClick,
  isSelected = false,
  currentUserId
}: ConversationCardProps) {
  const getConversationName = () => {
    if (conversation.name) {
      return conversation.name
    }
    
    if (conversation.conversation_type === 'direct') {
      const otherParticipant = conversation.participants.find(
        p => p.user_id !== currentUserId
      )
      return otherParticipant?.user.full_name || 'Bilinmeyen Kullanıcı'
    }
    
    return 'Grup Sohbeti'
  }

  const getLastMessagePreview = () => {
    if (!conversation.last_message) {
      return 'Henüz mesaj yok'
    }

    const message = conversation.last_message
    const isOwn = message.sender_id === currentUserId
    const senderName = isOwn ? 'Sen' : message.sender?.full_name || 'Bilinmeyen'

    if (message.message_type === 'file') {
      return `${senderName}: 📎 Dosya gönderdi`
    }
    if (message.message_type === 'image') {
      return `${senderName}: 🖼️ Resim gönderdi`
    }

    const preview = message.content.length > 50 
      ? message.content.substring(0, 50) + '...'
      : message.content

    return conversation.conversation_type === 'group' 
      ? `${senderName}: ${preview}`
      : preview
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'away': return 'bg-yellow-500'
      default: return 'bg-gray-300'
    }
  }

  const isOnline = conversation.conversation_type === 'direct' 
    ? conversation.participants.find(p => p.user_id !== currentUserId)?.user.status === 'online'
    : false

  return (
    <div
      onClick={() => onClick(conversation)}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {conversation.conversation_type === 'direct' ? (
            <div className="relative">
              <Avatar 
                className="h-12 w-12"
                fallback={getConversationName().charAt(0).toUpperCase()}
              />
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
              )}
            </div>
          ) : (
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {getConversationName()}
              </h3>
              
              {conversation.conversation_type === 'group' && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {conversation.participants.length}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {conversation.last_message_at && (
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(conversation.last_message_at), { 
                    addSuffix: false, 
                    locale: tr 
                  })}
                </span>
              )}
              
              {conversation.unread_count > 0 && (
                <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center">
                  {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                </Badge>
              )}
            </div>
          </div>

          {/* Last Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {getLastMessagePreview()}
          </p>

          {/* Status indicators */}
          <div className="flex items-center gap-2 mt-2">
            {conversation.is_archived && (
              <Archive className="h-3 w-3 text-gray-400" />
            )}
            
            {/* Muted indicator - check if current user has muted this conversation */}
            {conversation.participants.find(p => p.user_id === currentUserId)?.is_muted && (
              <VolumeX className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
