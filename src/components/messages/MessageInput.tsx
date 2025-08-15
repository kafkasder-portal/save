import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { Button } from '../ui/Button'
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  X,
  Smile,
  Reply,
  Mic
} from 'lucide-react'
import type { MessageWithDetails } from '../../types/internal-messages'

interface MessageInputProps {
  onSendMessage: (content: string, file?: File, replyTo?: string) => void
  replyingTo?: MessageWithDetails | null
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
}

export function MessageInput({
  onSendMessage,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = "Mesaj yazın..."
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File, type: 'file' | 'image') => {
    if (file.size > MAX_FILE_SIZE) {
      alert('Dosya boyutu 10MB\'dan büyük olamaz')
      return
    }

    const allowedTypes = type === 'image' 
      ? ALLOWED_FILE_TYPES.image 
      : [...ALLOWED_FILE_TYPES.image, ...ALLOWED_FILE_TYPES.document]

    if (!allowedTypes.includes(file.type)) {
      alert('Desteklenmeyen dosya türü')
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }, [])

  const handleSend = useCallback(() => {
    if ((!message.trim() && !selectedFile) || disabled) return

    onSendMessage(
      message.trim(),
      selectedFile || undefined,
      replyingTo?.id
    )

    // Reset form
    setMessage('')
    setSelectedFile(null)
    setFilePreview(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [message, selectedFile, disabled, onSendMessage, replyingTo])

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }, [])

  const removeFile = useCallback(() => {
    setSelectedFile(null)
    setFilePreview(null)
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <Reply className="h-4 w-4 text-gray-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {replyingTo.sender.full_name} kullanıcısına yanıt veriliyor
              </p>
              <p className="text-xs text-gray-500 truncate">
                {replyingTo.content.length > 100 
                  ? replyingTo.content.substring(0, 100) + '...'
                  : replyingTo.content
                }
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-start gap-3">
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <Paperclip className="h-6 w-6 text-gray-500" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={removeFile}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* File attachment buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white max-h-[120px]"
              rows={1}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && !selectedFile)}
            className="h-8 w-8 p-0 btn-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept={[...ALLOWED_FILE_TYPES.document, ...ALLOWED_FILE_TYPES.image].join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file, 'file')
          }
          e.target.value = ''
        }}
      />
      
      <input
        ref={imageInputRef}
        type="file"
        hidden
        accept={ALLOWED_FILE_TYPES.image.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file, 'image')
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}