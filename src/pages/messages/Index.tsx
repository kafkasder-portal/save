import { useState, useEffect } from 'react'
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Send,
  Mail,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Copy,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, SelectOption } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { TemplateCard } from '../../components/messages/TemplateCard'
import { TemplateForm } from '../../components/messages/TemplateForm'
import { TemplatePreviewModal } from '../../components/messages/TemplatePreviewModal'
import { BulkMessageForm } from '../../components/messages/BulkMessageForm'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

interface MessageTemplate {
  id: string
  name: string
  subject?: string
  content: string
  type: 'email' | 'sms' | 'notification'
  category: string
  variables: string[]
  usage_count: number
  created_at: string
  updated_at: string
  is_active: boolean
}

interface BulkMessage {
  id: string
  title: string
  type: 'email' | 'sms'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  recipient_count: number
  sent_count: number
  failed_count: number
  scheduled_time?: string
  created_at: string
  template_id?: string
}

export default function MessagesIndex() {
  const [activeTab, setActiveTab] = useState('templates')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Modals
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showBulkMessageForm, setShowBulkMessageForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)

  // Data
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [bulkMessages, setBulkMessages] = useState<BulkMessage[]>([])

  // Mock data
  const mockTemplates: MessageTemplate[] = [
    {
      id: '1',
      name: 'Hoş Geldin Mesajı',
      subject: 'Platforma Hoş Geldiniz!',
      content: 'Merhaba {{name}},\n\nPlatformuza hoş geldiniz! Hesabınız başarıyla oluşturuldu.\n\nGiriş bilgileriniz:\nE-posta: {{email}}\n\nEkibimiz size yardımcı olmak için burada.\n\nİyi günler,\n{{company}} Ekibi',
      type: 'email',
      category: 'Hoş Geldin',
      variables: ['{{name}}', '{{email}}', '{{company}}'],
      usage_count: 156,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '2',
      name: 'Şifre Sıfırlama',
      subject: 'Şifre Sıfırlama Talebi',
      content: 'Merhaba {{name}},\n\nŞifre sıfırlama talebiniz alındı. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:\n\n{{link}}\n\nBu bağlantı 1 saat geçerlidir.\n\nEğer bu talebi siz yapmadıysanız, bu mesajı görmezden gelebilirsiniz.',
      type: 'email',
      category: 'Şifre Sıfırlama',
      variables: ['{{name}}', '{{link}}'],
      usage_count: 89,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '3',
      name: 'Toplantı Hatırlatması',
      content: 'Merhaba {{name}}, {{date}} tarihinde saat {{time}}\'de {{title}} toplantınız bulunmaktadır. Lütfen zamanında katılım sağlayınız.',
      type: 'sms',
      category: 'Hatırlatma',
      variables: ['{{name}}', '{{date}}', '{{time}}', '{{title}}'],
      usage_count: 234,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: '4',
      name: 'Promosyon Bildirimi',
      subject: 'Özel İndirim Fırsatı!',
      content: 'Merhaba {{name}},\n\n%50\'ye varan indirimler başladı! {{date}} tarihine kadar geçerli olan bu özel fırsatı kaçırmayın.\n\nHemen alışverişe başlayın: {{link}}\n\nİyi alışverişler!',
      type: 'email',
      category: 'Promosyon',
      variables: ['{{name}}', '{{date}}', '{{link}}'],
      usage_count: 45,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      is_active: false
    }
  ]

  const mockBulkMessages: BulkMessage[] = [
    {
      id: '1',
      title: 'Hoş Geldin Kampanyası',
      type: 'email',
      status: 'sent',
      recipient_count: 150,
      sent_count: 148,
      failed_count: 2,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      template_id: '1'
    },
    {
      id: '2',
      title: 'Toplantı Hatırlatması',
      type: 'sms',
      status: 'sending',
      recipient_count: 25,
      sent_count: 15,
      failed_count: 0,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      template_id: '3'
    },
    {
      id: '3',
      title: 'Aylık Bülten',
      type: 'email',
      status: 'scheduled',
      recipient_count: 500,
      sent_count: 0,
      failed_count: 0,
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500))
      setTemplates(mockTemplates)
      setBulkMessages(mockBulkMessages)
    } catch (error) {
      log.error('Failed to fetch data:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (data: any) => {
    try {
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        ...data,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setTemplates(prev => [newTemplate, ...prev])
      toast.success('Template başarıyla oluşturuldu')
    } catch (error) {
      log.error('Failed to create template:', error)
      toast.error('Template oluşturulurken hata oluştu')
    }
  }

  const handleEditTemplate = async (data: any) => {
    if (!editingTemplate) return
    
    try {
      const updatedTemplate: MessageTemplate = {
        ...editingTemplate,
        ...data,
        updated_at: new Date().toISOString(),
      }
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t))
      setEditingTemplate(null)
      toast.success('Template başarıyla güncellendi')
    } catch (error) {
      log.error('Failed to update template:', error)
      toast.error('Template güncellenirken hata oluştu')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Bu template\'i silmek istediğinizden emin misiniz?')) return
    
    try {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      toast.success('Template başarıyla silindi')
    } catch (error) {
      log.error('Failed to delete template:', error)
      toast.error('Template silinirken hata oluştu')
    }
  }

  const handleDuplicateTemplate = async (template: MessageTemplate) => {
    try {
      const duplicatedTemplate: MessageTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Kopya)`,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setTemplates(prev => [duplicatedTemplate, ...prev])
      toast.success('Template başarıyla kopyalandı')
    } catch (error) {
      log.error('Failed to duplicate template:', error)
      toast.error('Template kopyalanırken hata oluştu')
    }
  }

  const handleUseTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setShowBulkMessageForm(true)
  }

  const handleSendBulkMessage = async (data: any) => {
    try {
      const newBulkMessage: BulkMessage = {
        id: Date.now().toString(),
        title: selectedTemplate?.name || 'Özel Mesaj',
        type: data.type,
        status: data.send_immediately ? 'sending' : 'scheduled',
        recipient_count: data.recipients.length,
        sent_count: 0,
        failed_count: 0,
        scheduled_time: data.scheduled_time,
        created_at: new Date().toISOString(),
        template_id: selectedTemplate?.id
      }
      
      setBulkMessages(prev => [newBulkMessage, ...prev])
      setSelectedTemplate(null)
      
      // Update template usage count
      if (selectedTemplate) {
        setTemplates(prev => prev.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, usage_count: t.usage_count + 1 }
            : t
        ))
      }
      
      toast.success(data.send_immediately ? 'Mesaj gönderiliyor' : 'Mesaj zamanlandı')
    } catch (error) {
      log.error('Failed to send bulk message:', error)
      toast.error('Mesaj gönderilemedi')
    }
  }

  // Filters
  const filteredTemplates = templates.filter(template => {
    if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !template.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && template.type !== typeFilter) {
      return false
    }
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false
    }
    return true
  })

  const filteredBulkMessages = bulkMessages.filter(message => {
    if (searchTerm && !message.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && message.type !== typeFilter) {
      return false
    }
    if (statusFilter !== 'all' && message.status !== statusFilter) {
      return false
    }
    return true
  })

  // Stats
  const templateStats = {
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    email: templates.filter(t => t.type === 'email').length,
    sms: templates.filter(t => t.type === 'sms').length
  }

  const bulkMessageStats = {
    total: bulkMessages.length,
    sent: bulkMessages.filter(m => m.status === 'sent').length,
    sending: bulkMessages.filter(m => m.status === 'sending').length,
    scheduled: bulkMessages.filter(m => m.status === 'scheduled').length
  }

  const typeOptions: SelectOption[] = [
    { value: 'all', label: 'Tüm Türler' },
    { value: 'email', label: 'E-posta' },
    { value: 'sms', label: 'SMS' },
    { value: 'notification', label: 'Bildirim' }
  ]

  const categoryOptions: SelectOption[] = [
    { value: 'all', label: 'Tüm Kategoriler' },
    { value: 'Hoş Geldin', label: 'Hoş Geldin' },
    { value: 'Hatırlatma', label: 'Hatırlatma' },
    { value: 'Promosyon', label: 'Promosyon' },
    { value: 'Şifre Sıfırlama', label: 'Şifre Sıfırlama' }
  ]

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'draft', label: 'Taslak' },
    { value: 'scheduled', label: 'Zamanlanmış' },
    { value: 'sending', label: 'Gönderiliyor' },
    { value: 'sent', label: 'Gönderildi' },
    { value: 'failed', label: 'Başarısız' }
  ]

  const getStatusBadge = (status: BulkMessage['status']) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Taslak' },
      scheduled: { variant: 'info' as const, label: 'Zamanlanmış' },
      sending: { variant: 'warning' as const, label: 'Gönderiliyor' },
      sent: { variant: 'success' as const, label: 'Gönderildi' },
      failed: { variant: 'destructive' as const, label: 'Başarısız' }
    }
    const statusConfig = config[status]
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Mesaj Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Template'leri yönetin ve toplu mesaj gönderin
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkMessageForm(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Toplu Gönder
          </Button>
          <Button
            onClick={() => setShowTemplateForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Template
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Template'ler ({templateStats.total})
          </TabsTrigger>
          <TabsTrigger value="bulk-messages">
            <Send className="h-4 w-4 mr-2" />
            Toplu Mesajlar ({bulkMessageStats.total})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analitik
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {templateStats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Toplam Template</p>
            </div>
            
            <div className="card text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {templateStats.active}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Aktif Template</p>
            </div>
            
            <div className="card text-center">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {templateStats.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">E-posta</p>
            </div>
            
            <div className="card text-center">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {templateStats.sms}
              </p>
              <p className="text-gray-600 dark:text-gray-400">SMS</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Template ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Tür"
            />
            
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Kategori"
            />
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-500">Template'ler yükleniyor...</p>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={(template) => {
                    setEditingTemplate(template)
                    setShowTemplateForm(true)
                  }}
                  onDelete={handleDeleteTemplate}
                  onDuplicate={handleDuplicateTemplate}
                  onUse={handleUseTemplate}
                  onPreview={(template) => {
                    setPreviewTemplate(template)
                    setShowPreviewModal(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Template bulunamadı' 
                  : 'Henüz template yok'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
                  : 'İlk template\'inizi oluşturun'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && categoryFilter === 'all' && (
                <Button
                  onClick={() => setShowTemplateForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Template'inizi Oluşturun
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Bulk Messages Tab */}
        <TabsContent value="bulk-messages" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card text-center">
              <Send className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {bulkMessageStats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Toplam Gönderim</p>
            </div>
            
            <div className="card text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {bulkMessageStats.sent}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Gönderildi</p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {bulkMessageStats.sending}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Gönderiliyor</p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {bulkMessageStats.scheduled}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Zamanlanmış</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder="Mesaj ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <Select
              options={typeOptions}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Tür"
            />
            
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Durum"
            />
          </div>

          {/* Bulk Messages List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner h-8 w-8 mx-auto mb-4" />
              <p className="text-gray-500">Mesajlar yükleniyor...</p>
            </div>
          ) : filteredBulkMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredBulkMessages.map((message) => (
                <div key={message.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {message.type === 'email' ? (
                        <Mail className="h-8 w-8 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-8 w-8 text-green-600" />
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {message.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(message.status)}
                          <span className="text-sm text-gray-500">
                            {message.recipient_count} alıcı
                          </span>
                          {message.scheduled_time && (
                            <span className="text-sm text-gray-500">
                              • {new Date(message.scheduled_time).toLocaleString('tr-TR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {message.status === 'sent' && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {message.sent_count} / {message.recipient_count} gönderildi
                          </p>
                          {message.failed_count > 0 && (
                            <p className="text-sm text-red-600">
                              {message.failed_count} başarısız
                            </p>
                          )}
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Mesaj bulunamadı'
                  : 'Henüz toplu mesaj gönderilmedi'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Arama kriterlerinizi değiştirip tekrar deneyin'
                  : 'İlk toplu mesajınızı gönderin'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                <Button
                  onClick={() => setShowBulkMessageForm(true)}
                  className="btn-primary"
                >
                  <Send className="h-4 w-4 mr-2" />
                  İlk Mesajınızı Gönderin
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Analitik Modülü
            </h3>
            <p className="text-gray-500">
              Mesaj gönderim istatistikleri ve raporlar burada görüntülenecek
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TemplateForm
        isOpen={showTemplateForm}
        onClose={() => {
          setShowTemplateForm(false)
          setEditingTemplate(null)
        }}
        onSubmit={editingTemplate ? handleEditTemplate : handleCreateTemplate}
        template={editingTemplate}
        title={editingTemplate ? 'Template Düzenle' : 'Yeni Template'}
      />

      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setPreviewTemplate(null)
        }}
        template={previewTemplate}
        onEdit={(template) => {
          setEditingTemplate(template)
          setShowTemplateForm(true)
          setShowPreviewModal(false)
        }}
        onUse={handleUseTemplate}
        onDuplicate={handleDuplicateTemplate}
      />

      <BulkMessageForm
        isOpen={showBulkMessageForm}
        onClose={() => {
          setShowBulkMessageForm(false)
          setSelectedTemplate(null)
        }}
        onSubmit={handleSendBulkMessage}
        template={selectedTemplate}
      />
    </div>
  )
}
