import { useState, useEffect, useRef } from 'react'
import { Users, Send, Phone, Video, Info, ArrowLeft } from 'lucide-react'
import { Button } from '@components/ui/button'
import ConversationList from '@components/messages/ConversationList'
import ChatMessage from '@components/messages/ChatMessage'
import MessageInput from '@components/messages/MessageInput'
import { messagesApi } from '../../api/messages'
// import { supabase } from '@lib/supabase' // Removed - file deleted
import { 
  Conversation, 
  InternalMessage, 
  ConversationParticipant,
  SendMessageData 
} from '@/types/collaboration'
// import { usePermissions } from '@hooks/usePermissions'
import { useAuthStore } from '@store/auth'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

export default function InternalMessagesIndex() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<InternalMessage[]>([])
  const [participants, setParticipants] = useState<ConversationParticipant[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<InternalMessage | null>(null)
  // TODO: Implement editing functionality
  const [showMobileConversations, setShowMobileConversations] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // const permissions = usePermissions()
  const { user } = useAuthStore()
  const currentUserId = user?.id
  const canViewMessages = true
  const canSendMessages = true

  useEffect(() => {
    if (canViewMessages) {
      fetchConversations()
    }
  }, [canViewMessages])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      fetchParticipants(selectedConversation.id)
      setShowMobileConversations(false)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const data = await messagesApi.getConversations()
      setConversations(data)
    } catch (error) {
      log.error('Failed to fetch conversations:', error)
      toast.error('Konuşmalar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const data = await messagesApi.getMessages(conversationId)
      setMessages(data)
      
      // Mark conversation as read
      await messagesApi.markConversationAsRead(conversationId)
    } catch (error) {
      log.error('Failed to fetch messages:', error)
      toast.error('Mesajlar yüklenirken hata oluştu')
    } finally {
      setMessagesLoading(false)
    }
  }

  const fetchParticipants = async (conversationId: string) => {
    try {
      const data = await messagesApi.getConversationParticipants(conversationId)
      setParticipants(data)
    } catch (error) {
      log.error('Failed to fetch participants:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string, messageType: 'text' | 'file' | 'image' = 'text') => {
    if (!selectedConversation || !canSendMessages) return

    try {
      const messageData: SendMessageData = {
        conversation_id: selectedConversation.id,
        content,
        message_type: messageType,
        reply_to: replyingTo?.id
      }

      const newMessage = await messagesApi.sendMessage(messageData)
      setMessages(prev => [...prev, newMessage])
      setReplyingTo(null)
      
      // Update conversation last message time
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, last_message_at: newMessage.created_at }
            : conv
        )
      )
    } catch (error) {
      log.error('Failed to send message:', error)
      toast.error('Mesaj gönderilirken hata oluştu')
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      // File validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (file.size > maxSize) {
        throw new Error('Dosya boyutu 10MB\'den küçük olmalıdır');
      }

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Desteklenmeyen dosya türü');
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `internal-messages/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        path: filePath
      };
    } catch (error) {
      log.error('File upload error:', error);
      throw error;
    }
  }

  const handleEditMessage = async () => {
    // TODO: Implement message editing UI
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return

    try {
      await messagesApi.deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success('Mesaj silindi')
    } catch (error) {
      log.error('Failed to delete message:', error)
      toast.error('Mesaj silinirken hata oluştu')
    }
  }

  const handleReply = (_message: InternalMessage) => {
    setReplyingTo(_message)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setMessages([])
    setReplyingTo(null)
  }

  const handleBackToConversations = () => {
    setShowMobileConversations(true)
    setSelectedConversation(null)
  }

  const getParticipantCount = () => {
    return participants.filter(p => !p.left_at).length
  }

  const getConversationTitle = () => {
    if (!selectedConversation) return ''
    
    if (selectedConversation.conversation_type === 'group') {
      return selectedConversation.name || 'İsimsiz Grup'
    }
    
    // For direct messages, show the other participant's name
    return 'Direkt Mesaj'
  }

  if (!canViewMessages) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Erişim Engellendi</h1>
        <p className="text-muted-foreground mt-2">
          Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.
        </p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-background">
      {/* Conversation List - Desktop always visible, Mobile conditionally */}
      <div className={`${showMobileConversations ? 'block' : 'hidden'} md:block`}>
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={() => {/* TODO: Implement create conversation */}}
          loading={loading}
          currentUserId={currentUserId}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${showMobileConversations ? 'hidden' : 'flex'} md:flex`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Mobile back button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={handleBackToConversations}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                {/* Avatar */}
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                  {selectedConversation.conversation_type === 'group' ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    'U'
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-semibold">{getConversationTitle()}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.conversation_type === 'group' 
                      ? `${getParticipantCount()} katılımcı`
                      : 'Aktif'
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Mesajlar yükleniyor...</p>
                </div>
              ) : messages.length > 0 ? (
                <>
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender_id === currentUserId
                    const showSender = index === 0 || 
                      messages[index - 1].sender_id !== message.sender_id ||
                      (new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime()) > 5 * 60 * 1000 // 5 minutes

                    return (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={isCurrentUser}
                        showSender={showSender && selectedConversation.conversation_type === 'group'}
                        onReply={handleReply}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onFileDownload={(_url, name) => {
                          const link = document.createElement('a')
                          link.href = _url
                          link.download = name
                          link.click()
                        }}
                      />
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Henüz mesaj yok</p>
                  <p className="text-sm">İlk mesajı göndererek konuşmayı başlatın</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            {canSendMessages && (
              <MessageInput
                onSendMessage={handleSendMessage}
                onFileUpload={handleFileUpload}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                placeholder="Mesajınızı yazın..."
              />
            )}
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center text-center bg-muted/20">
            <div>
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground">Konuşma Seçin</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mesajlaşmaya başlamak için soldaki listeden bir konuşma seçin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
