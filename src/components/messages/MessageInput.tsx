import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Send, Paperclip, Smile } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
  replyTo?: { id: string; content: string; sender_name: string } | null
  onCancelReply?: () => void
}

export default function MessageInput({ 
  onSendMessage, 
  placeholder = "Mesajınızı yazın...", 
  disabled = false,
  replyTo,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <div className="border-t bg-white p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800">
                Yanıtlanıyor: {replyTo.sender_name}
              </div>
              <div className="text-sm text-blue-600 truncate">
                {replyTo.content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={1}
            maxRows={4}
          />
          
          {/* Emoji Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-2 h-6 w-6 p-0"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="text-xs text-gray-500 mt-1">
          Yazıyor...
        </div>
      )}
    </div>
  )
}
