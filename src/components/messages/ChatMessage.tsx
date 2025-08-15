import React from 'react'
import { Message } from '@/types/internal-messages'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { MoreVertical, Edit, Trash2, Reply } from 'lucide-react'
import { Button } from '@components/ui/button'

interface ChatMessageProps {
  message: Message
  isOwnMessage: boolean
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onReply?: (message: Message) => void
}

export default function ChatMessage({ 
  message, 
  isOwnMessage, 
  onEdit, 
  onDelete, 
  onReply 
}: ChatMessageProps) {
  const [showActions, setShowActions] = React.useState(false)

  const handleActionClick = (action: 'edit' | 'delete' | 'reply') => {
    setShowActions(false)
    switch (action) {
      case 'edit':
        onEdit?.(message)
        break
      case 'delete':
        onDelete?.(message.id)
        break
      case 'reply':
        onReply?.(message)
        break
    }
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium ${
            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
          }`}>
            {message.sender_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Message Content */}
          <div className={`flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {/* Message Header */}
            <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <span className="text-sm font-medium text-gray-900">
                {message.sender_name || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {format(new Date(message.created_at), 'HH:mm', { locale: tr })}
              </span>
              {isOwnMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Message Body */}
            <div className={`relative ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg px-3 py-2`}>
              {message.content}
              
              {/* Message Actions Dropdown */}
              {showActions && isOwnMessage && (
                <div className="absolute top-0 right-0 mt-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                  <div className="py-1">
                    <button
                      onClick={() => handleActionClick('edit')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleActionClick('reply')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Yanıtla
                    </button>
                    <button
                      onClick={() => handleActionClick('delete')}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Message Status */}
            {isOwnMessage && (
              <div className="text-xs text-gray-500 mt-1">
                {message.read_at ? '✓✓ Okundu' : '✓ Gönderildi'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
