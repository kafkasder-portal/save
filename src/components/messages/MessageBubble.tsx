import { memo, useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/avatar'
import { 
  File, 
  Image, 
  Download,
  Reply,
  Edit3,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  Heart,
  ThumbsUp,
  Smile
} from 'lucide-react'
import type { MessageWithDetails } from '../../types/internal-messages'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MessageBubbleProps {
  message: MessageWithDetails
  isOwn: boolean
  showAvatar?: boolean
  onReply?: (message: MessageWithDetails) => void
  onEdit?: (message: MessageWithDetails) => void
  onDelete?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  currentUserId: string
}

const commonReactions = ['❤️', '👍', '😊', '😂', '😮', '😢']

export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  currentUserId
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getMessageContent = () => {
    switch (message.message_type) {
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <File className="h-8 w-8 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {message.file_name}
              </p>
              {message.file_size && (
                <p className="text-sm text-gray-500">
                  {formatFileSize(message.file_size)}
                </p>
              )}
            </div>
            {message.file_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(message.file_url!, message.file_name!)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="max-w-sm">
            {message.file_url ? (
              <img
                src={message.file_url}
                alt={message.file_name || 'Resim'}
                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.file_url, '_blank')}
              />
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Image className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {message.file_name || 'Resim'}
                  </p>
                  <p className="text-sm text-gray-500">Resim yüklenemedi</p>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )
    }
  }

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar 
          className="h-8 w-8 shrink-0"
          fallback={message.sender.full_name.charAt(0).toUpperCase()}
        />
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name (for non-own messages) */}
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-500 mb-1 px-3">
            {message.sender.full_name}
          </p>
        )}

        {/* Reply indicator */}
        {message.reply_to_message && (
          <div className={`text-xs p-2 mb-1 bg-gray-100 dark:bg-gray-700 rounded-lg border-l-2 ${
            isOwn ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-400'
          }`}>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Yanıtlanan: {message.reply_to_message.sender?.full_name}
            </p>
            <p className="text-gray-600 dark:text-gray-400 truncate">
              {message.reply_to_message.content.length > 50
                ? message.reply_to_message.content.substring(0, 50) + '...'
                : message.reply_to_message.content
              }
            </p>
          </div>
        )}

        <div className="relative">
          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            }`}
          >
            {getMessageContent()}

            {/* Message actions menu */}
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1 ml-2">
                {onReaction && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowReactions(!showReactions)}
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                )}
                
                {onReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onReply(message)}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </div>

              {/* Reaction picker */}
              {showReactions && onReaction && (
                <div className="absolute top-8 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                  {commonReactions.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReaction(message.id, emoji)
                        setShowReactions(false)
                      }}
                      className="w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions menu */}
              {showMenu && (
                <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                  {isOwn && onEdit && (
                    <button
                      onClick={() => {
                        onEdit(message)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Düzenle
                    </button>
                  )}
                  
                  {isOwn && onDelete && (
                    <button
                      onClick={() => {
                        onDelete(message.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction?.(message.id, emoji)}
                  className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    message.reactions.some(r => r.emoji === emoji && r.user_id === currentUserId)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          
          {message.edited_at && (
            <span className="italic">(düzenlendi)</span>
          )}

          {isOwn && (
            <div className="flex items-center">
              {message.read_at ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
