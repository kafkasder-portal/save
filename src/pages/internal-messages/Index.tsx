import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Plus, 
  Users, 
  MessageSquare,
  Phone,
  Video,
  Info,
  Settings,
  Filter,
  Archive,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import type { 
  ConversationWithDetails, 
  MessageWithDetails
} from '../../types/internal-messages'
import { ConversationCard } from '../../components/messages/ConversationCard'
import { MessageBubble } from '../../components/messages/MessageBubble'
import { MessageInput } from '../../components/messages/MessageInput'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/avatar'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { log } from '@/utils/logger'

export default function InternalMessagesIndex() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileConversations, setShowMobileConversations] = useState(true)
  const [replyingTo, setReplyingTo] = useState<MessageWithDetails | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = "user-id" // Mock user ID

  // Mock data
  const mockConversations: ConversationWithDetails[] = [
    {
      id: '1',
      name: 'Proje Ekibi',
      conversation_type: 'group',
      created_by: currentUserId,
      description: 'Proje geliştirme sohbeti',
      is_archived: false,
      last_message_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      participants: [
        {
          id: '1',
          conversation_id: '1',
          user_id: currentUserId,
          role: 'admin',
          joined_at: new Date().toISOString(),
          is_muted: false,
          last_read_at: new Date().toISOString(),
          user: {
            id: currentUserId,
            full_name: 'Sen',
            status: 'online'
          }
        },
        {
          id: '2',
          conversation_id: '1',
          user_id: '2',
          role: 'member',
          joined_at: new Date().toISOString(),
          is_muted: false,
          user: {
            id: '2',
            full_name: 'Ahmet Yılmaz',
            status: 'online'
          }
        },
        {
          id: '3',
          conversation_id: '1',
          user_id: '3',
          role: 'member',
          joined_at: new Date().toISOString(),
          is_muted: false,
          user: {
            id: '3',
            full_name: 'Ayşe Demir',
            status: 'away'
          }
        }
      ],
      last_message: {
        id: '1',
        sender_id: '2',
        conversation_id: '1',
        content: 'Toplantı için hazır mıyız?',
        message_type: 'text',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: '2',
          full_name: 'Ahmet Yılmaz'
        }
      },
      unread_count: 2
    },
    {
      id: '2',
      conversation_type: 'direct',
      created_by: '4',
      is_archived: false,
      last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      participants: [
        {
          id: '4',
          conversation_id: '2',
          user_id: currentUserId,
          role: 'member',
          joined_at: new Date().toISOString(),
          is_muted: false,
          user: {
            id: currentUserId,
            full_name: 'Sen',
            status: 'online'
          }
        },
        {
          id: '5',
          conversation_id: '2',
          user_id: '4',
          role: 'member',
          joined_at: new Date().toISOString(),
          is_muted: false,
          user: {
            id: '4',
            full_name: 'Mehmet Kaya',
            status: 'online'
          }
        }
      ],
      last_message: {
        id: '2',
        sender_id: '4',
        conversation_id: '2',
        content: 'Merhaba, nasılsın?',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: '4',
          full_name: 'Mehmet Kaya'
        }
      },
      unread_count: 0
    }
  ]

  const mockMessages: MessageWithDetails[] = [
    {
      id: '1',
      sender_id: '2',
      conversation_id: '1',
      content: 'Merhaba ekip! Bugünkü toplantıya hazır mıyız?',
      message_type: 'text',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sender: {
        id: '2',
        full_name: 'Ahmet Yılmaz',
        avatar_url: undefined
      },
      reactions: [
        {
          id: '1',
          message_id: '1',
          user_id: currentUserId,
          emoji: '👍',
          created_at: new Date().toISOString(),
          user: {
            id: currentUserId,
            full_name: 'Sen'
          }
        }
      ]
    },
    {
      id: '2',
      sender_id: currentUserId,
      conversation_id: '1',
      content: 'Evet, ben hazırım. Sunumu da tamamladım.',
      message_type: 'text',
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      reply_to: '1',
      sender: {
        id: currentUserId,
        full_name: 'Sen',
        avatar_url: undefined
      },
      reply_to_message: {
        id: '1',
        sender_id: '2',
        conversation_id: '1',
        content: 'Merhaba ekip! Bugünkü toplantıya hazır mıyız?',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: {
          full_name: 'Ahmet Yılmaz'
        }
      },
      reactions: []
    },
    {
      id: '3',
      sender_id: '3',
      conversation_id: '1',
      content: 'Ben de hazırım! 🚀',
      message_type: 'text',
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      sender: {
        id: '3',
        full_name: 'Ayşe Demir',
        avatar_url: undefined
      },
      reactions: []
    }
  ]

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setConversations(mockConversations)
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      setMessages(mockMessages.filter(m => m.conversation_id === conversationId))
    } catch (error) {
      log.error('Failed to fetch messages:', error)
      toast.error('Mesajlar yüklenirken hata oluştu')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (content: string, file?: File, replyTo?: string) => {
    if (!selectedConversation) return

    try {
      const newMessage: MessageWithDetails = {
        id: Date.now().toString(),
        sender_id: currentUserId,
        conversation_id: selectedConversation.id,
        content,
        message_type: file ? (file.type.startsWith('image/') ? 'image' : 'file') : 'text',
        file_url: file ? URL.createObjectURL(file) : undefined,
        file_name: file?.name,
        file_size: file?.size,
        reply_to: replyTo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: currentUserId,
          full_name: 'Sen'
        },
        reply_to_message: replyTo ? messages.find(m => m.id === replyTo) : undefined,
        reactions: []
      }

      setMessages(prev => [...prev, newMessage])
      setReplyingTo(null)
      
      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              last_message: {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                conversation_id: newMessage.conversation_id,
                content: newMessage.content,
                message_type: newMessage.message_type,
                created_at: newMessage.created_at,
                updated_at: newMessage.updated_at,
                sender: newMessage.sender
              },
              last_message_at: newMessage.created_at
            }
          : conv
      ))

      toast.success('Mesaj gönderildi')
    } catch (error) {
      log.error('Failed to send message:', error)
      toast.error('Mesaj gönderilemedi')
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          const existingReaction = message.reactions.find(r => r.user_id === currentUserId && r.emoji === emoji)
          
          if (existingReaction) {
            // Remove reaction
            return {
              ...message,
              reactions: message.reactions.filter(r => r.id !== existingReaction.id)
            }
          } else {
            // Add reaction
            return {
              ...message,
              reactions: [
                ...message.reactions,
                {
                  id: Date.now().toString(),
                  message_id: messageId,
                  user_id: currentUserId,
                  emoji,
                  created_at: new Date().toISOString(),
                  user: {
                    id: currentUserId,
                    full_name: 'Sen'
                  }
                }
              ]
            }
          }
        }
        return message
      }))
    } catch (error) {
      log.error('Failed to toggle reaction:', error)
      toast.error('Reaksiyon eklenirken hata oluştu')
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success('Mesaj silindi')
    } catch (error) {
      log.error('Failed to delete message:', error)
      toast.error('Mesaj silinemedi')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    // Search in conversation name
    if (conv.name?.toLowerCase().includes(searchLower)) return true
    
    // Search in participant names for direct conversations
    if (conv.conversation_type === 'direct') {
      const otherParticipant = conv.participants.find(p => p.user_id !== currentUserId)
      if (otherParticipant?.user.full_name.toLowerCase().includes(searchLower)) return true
    }
    
    // Search in last message
    if (conv.last_message?.content.toLowerCase().includes(searchLower)) return true
    
    return false
  })

  const getConversationTitle = (conversation: ConversationWithDetails) => {
    if (conversation.name) {
      return conversation.name
    }
    
    if (conversation.conversation_type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.user_id !== currentUserId)
      return otherParticipant?.user.full_name || 'Bilinmeyen Kullanıcı'
    }
    
    return 'Grup Sohbeti'
  }

  return (
    <div className="h-screen flex bg-white dark:bg-gray-900">
      {/* Conversations List - Desktop */}
      <div className={`w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
        showMobileConversations ? 'block' : 'hidden'
      } lg:block`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Mesajlar
            </h1>
            <Button size="sm" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Yeni
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Konuşma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="spinner h-6 w-6 mx-auto mb-4" />
              <p className="text-gray-500">Konuşmalar yükleniyor...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                onClick={(conv) => {
                  setSelectedConversation(conv)
                  setShowMobileConversations(false)
                }}
                isSelected={selectedConversation?.id === conversation.id}
                currentUserId={currentUserId}
              />
            ))
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Konuşma bulunamadı' : 'Henüz konuşma yok'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${
        !showMobileConversations ? 'block' : 'hidden'
      } lg:block`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="lg:hidden"
                    onClick={() => setShowMobileConversations(true)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    {selectedConversation.conversation_type === 'direct' ? (
                      <Avatar 
                        className="h-10 w-10"
                        fallback={getConversationTitle(selectedConversation).charAt(0).toUpperCase()}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    
                    <div>
                      <h2 className="font-medium text-gray-900 dark:text-gray-100">
                        {getConversationTitle(selectedConversation)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.conversation_type === 'group' 
                          ? `${selectedConversation.participants.length} katılımcı`
                          : 'Çevrimiçi'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="spinner h-6 w-6 mx-auto mb-4" />
                  <p className="text-gray-500">Mesajlar yükleniyor...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) => {
                  const isOwn = message.sender_id === currentUserId
                  const showAvatar = index === 0 || 
                    messages[index - 1].sender_id !== message.sender_id ||
                    new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 5 * 60 * 1000 // 5 minutes

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onReply={setReplyingTo}
                      onReaction={handleReaction}
                      onDelete={handleDeleteMessage}
                      currentUserId={currentUserId}
                    />
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz mesaj yok</p>
                  <p className="text-sm text-gray-400 mt-1">İlk mesajı göndererek konuşmaya başlayın</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              placeholder={`${getConversationTitle(selectedConversation)} için mesaj yazın...`}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Mesajlaşmaya başlayın
              </h3>
              <p className="text-gray-500 max-w-sm">
                Sol taraftan bir konuşma seçin veya yeni bir konuşma başlatın
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}