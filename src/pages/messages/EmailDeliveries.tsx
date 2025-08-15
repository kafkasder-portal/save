import { useState, useMemo } from 'react'
import { 
  Mail, 
  Send, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Paperclip,
  Star,
  Archive
} from 'lucide-react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'

interface EmailDelivery {
  id: string
  recipient: string
  email: string
  subject: string
  content: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'pending'
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  failureReason?: string
  hasAttachments: boolean
  attachmentCount?: number
  priority: 'low' | 'normal' | 'high' | 'urgent'
  campaignId?: string
  campaignName?: string
  templateId?: string
  templateName?: string
  size: number // KB cinsinden
}

export default function EmailDeliveries() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedDelivery, setSelectedDelivery] = useState<EmailDelivery | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

  // Mock e-posta gönderim verileri
  const [emailDeliveries] = useState<EmailDelivery[]>([
    {
      id: 'EMAIL001',
      recipient: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@email.com',
      subject: 'Randevu Hatırlatması - Yarın Saat 14:00',
      content: 'Sayın Ahmet Yılmaz,\n\nYarın (16 Ocak 2024) saat 14:00\'da randevunuz bulunmaktadır. Lütfen zamanında gelin.\n\nSaygılarımızla,\nKlinik Ekibi',
      status: 'opened',
      sentAt: '2024-01-15 10:30:00',
      deliveredAt: '2024-01-15 10:30:15',
      openedAt: '2024-01-15 11:45:22',
      hasAttachments: false,
      priority: 'normal',
      campaignId: 'CAMP001',
      campaignName: 'Randevu Hatırlatma',
      templateId: 'TEMP001',
      templateName: 'Randevu Hatırlatma Şablonu',
      size: 2.5
    },
    {
      id: 'EMAIL002',
      recipient: 'Fatma Demir',
      email: 'fatma.demir@email.com',
      subject: 'Ödeme Hatırlatması - Son Tarih Yaklaşıyor',
      content: 'Sayın Fatma Demir,\n\nÖdemenizin son tarihi 20 Ocak 2024\'tür. Lütfen en kısa sürede ödeme yapın.\n\nDetaylar için ekteki faturayı inceleyebilirsiniz.',
      status: 'clicked',
      sentAt: '2024-01-15 11:15:00',
      deliveredAt: '2024-01-15 11:15:08',
      openedAt: '2024-01-15 12:30:15',
      clickedAt: '2024-01-15 12:32:45',
      hasAttachments: true,
      attachmentCount: 1,
      priority: 'high',
      campaignId: 'CAMP002',
      campaignName: 'Ödeme Hatırlatma',
      templateId: 'TEMP002',
      templateName: 'Ödeme Hatırlatma Şablonu',
      size: 156.7
    },
    {
      id: 'EMAIL003',
      recipient: 'Mehmet Kaya',
      email: 'mehmet.kaya@email.com',
      subject: 'Sistem Bakımı Bildirimi',
      content: 'Sayın Mehmet Kaya,\n\n16 Ocak 2024 tarihinde 02:00-06:00 saatleri arasında sistem bakımı yapılacaktır.\n\nBu süre zarfında hizmetlerimize erişim sağlanamayacaktır.',
      status: 'bounced',
      sentAt: '2024-01-15 12:00:00',
      failureReason: 'Geçersiz e-posta adresi',
      hasAttachments: false,
      priority: 'urgent',
      campaignId: 'CAMP003',
      campaignName: 'Sistem Bakımı Bildirimi',
      templateId: 'TEMP003',
      templateName: 'Sistem Bildirimi Şablonu',
      size: 3.2
    },
    {
      id: 'EMAIL004',
      recipient: 'Ayşe Özkan',
      email: 'ayse.ozkan@email.com',
      subject: 'Hoş Geldiniz! Hesabınız Oluşturuldu',
      content: 'Sayın Ayşe Özkan,\n\nHesabınız başarıyla oluşturuldu. Giriş bilgileriniz:\n\nKullanıcı Adı: ayse.ozkan\nŞifre: Güvenlik nedeniyle SMS ile gönderilmiştir.\n\nİyi günler dileriz.',
      status: 'delivered',
      sentAt: '2024-01-15 13:45:00',
      deliveredAt: '2024-01-15 13:45:12',
      hasAttachments: true,
      attachmentCount: 2,
      priority: 'normal',
      campaignId: 'CAMP004',
      campaignName: 'Hoş Geldin Mesajı',
      templateId: 'TEMP004',
      templateName: 'Hoş Geldin Şablonu',
      size: 45.8
    },
    {
      id: 'EMAIL005',
      recipient: 'Ali Veli',
      email: 'ali.veli@email.com',
      subject: 'Özel Promosyon - %50 İndirim Fırsatı!',
      content: 'Sayın Ali Veli,\n\nSadece bugün geçerli %50 indirim fırsatını kaçırmayın!\n\nTüm ürünlerde geçerli promosyon kodu: INDIRIM50\n\nDetaylar için web sitemizi ziyaret edin.',
      status: 'pending',
      sentAt: '2024-01-15 14:20:00',
      hasAttachments: false,
      priority: 'low',
      campaignId: 'CAMP005',
      campaignName: 'Promosyon Kampanyası',
      templateId: 'TEMP005',
      templateName: 'Promosyon Şablonu',
      size: 4.1
    },
    {
      id: 'EMAIL006',
      recipient: 'Zeynep Ak',
      email: 'zeynep.ak@email.com',
      subject: 'Aylık Rapor - Ocak 2024',
      content: 'Sayın Zeynep Ak,\n\nOcak 2024 aylık raporunuz hazır. Ekteki dosyada detaylı bilgileri bulabilirsiniz.\n\nHerhangi bir sorunuz olursa lütfen bizimle iletişime geçin.',
      status: 'opened',
      sentAt: '2024-01-15 15:00:00',
      deliveredAt: '2024-01-15 15:00:05',
      openedAt: '2024-01-15 16:15:30',
      hasAttachments: true,
      attachmentCount: 3,
      priority: 'normal',
      campaignId: 'CAMP006',
      campaignName: 'Aylık Raporlar',
      templateId: 'TEMP006',
      templateName: 'Rapor Şablonu',
      size: 1024.5
    }
  ])

  const filtered = useMemo(() => {
    return emailDeliveries.filter(delivery => {
      const matchesSearch = delivery.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || delivery.priority === priorityFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const today = new Date()
        const deliveryDate = new Date(delivery.sentAt)
        
        switch (dateFilter) {
          case 'today': {
            matchesDate = deliveryDate.toDateString() === today.toDateString()
            break
          }
          case 'yesterday': {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            matchesDate = deliveryDate.toDateString() === yesterday.toDateString()
            break
          }
          case 'week': {
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            matchesDate = deliveryDate >= weekAgo
            break
          }
          case 'month': {
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            matchesDate = deliveryDate >= monthAgo
            break
          }
          default:
            break
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesDate
    })
  }, [searchTerm, statusFilter, priorityFilter, dateFilter, emailDeliveries])

  const handleViewDelivery = (delivery: EmailDelivery) => {
    setSelectedDelivery(delivery)
    setIsViewModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'opened': return <Mail className="h-4 w-4 text-purple-500" />
      case 'clicked': return <Star className="h-4 w-4 text-yellow-500" />
      case 'bounced': return <XCircle className="h-4 w-4 text-red-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      opened: 'bg-purple-100 text-purple-800',
      clicked: 'bg-yellow-100 text-yellow-800',
      bounced: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      sent: 'Gönderildi',
      delivered: 'Teslim Edildi',
      opened: 'Açıldı',
      clicked: 'Tıklandı',
      bounced: 'Geri Döndü',
      failed: 'Başarısız',
      pending: 'Beklemede'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    const labels = {
      low: 'Düşük',
      normal: 'Normal',
      high: 'Yüksek',
      urgent: 'Acil'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    )
  }

  const formatFileSize = (sizeKB: number) => {
    if (sizeKB < 1024) {
      return `${sizeKB.toFixed(1)} KB`
    } else {
      return `${(sizeKB / 1024).toFixed(1)} MB`
    }
  }

  const getStats = () => {
    const total = emailDeliveries.length
    const delivered = emailDeliveries.filter(d => d.status === 'delivered' || d.status === 'opened' || d.status === 'clicked').length
    const opened = emailDeliveries.filter(d => d.status === 'opened' || d.status === 'clicked').length
    const clicked = emailDeliveries.filter(d => d.status === 'clicked').length
    const bounced = emailDeliveries.filter(d => d.status === 'bounced' || d.status === 'failed').length
    const pending = emailDeliveries.filter(d => d.status === 'pending').length
    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0'
    const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0'
    const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0'
    
    return { total, delivered, opened, clicked, bounced, pending, deliveryRate, openRate, clickRate }
  }

  const stats = getStats()

  const columns: Column<EmailDelivery>[] = [
    {
      key: 'id',
      header: 'E-posta ID',
      render: (_, delivery) => (
        <span className="font-mono text-sm text-gray-600">{delivery?.id || '-'}</span>
      )
    },
    {
      key: 'recipient',
      header: 'Alıcı',
      render: (_, delivery) => (
        <div>
          <div className="font-medium text-sm">{delivery?.recipient || '-'}</div>
          <div className="text-xs text-gray-500">{delivery?.email || '-'}</div>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Konu',
      render: (_, delivery) => (
        <div className="max-w-xs">
          <p className="text-sm font-medium truncate" title={delivery?.subject || ''}>
            {delivery?.subject || '-'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {delivery?.hasAttachments && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Paperclip className="h-3 w-3" />
                {delivery.attachmentCount} ek
              </div>
            )}
            <span className="text-xs text-gray-500">{formatFileSize(delivery?.size || 0)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_, delivery) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(delivery?.status || 'pending')}
          {getStatusBadge(delivery?.status || 'pending')}
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Öncelik',
      render: (_, delivery) => getPriorityBadge(delivery?.priority || 'normal')
    },
    {
      key: 'campaign',
      header: 'Kampanya',
      render: (_, delivery) => (
        <div className="text-sm">
          <div className="font-medium">{delivery?.campaignName || '-'}</div>
          {delivery?.templateName && (
            <div className="text-xs text-gray-500">{delivery.templateName}</div>
          )}
        </div>
      )
    },
    {
      key: 'sentAt',
      header: 'Gönderim Zamanı',
      render: (_, delivery) => (
        <div className="text-sm">
          <div>{delivery?.sentAt?.split(' ')[0] || '-'}</div>
          <div className="text-gray-500">{delivery?.sentAt?.split(' ')[1] || '-'}</div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, delivery) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDelivery(delivery)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Detayları Görüntüle"
            disabled={!delivery}
          >
            <Eye className="h-4 w-4" />
          </button>
          {(delivery?.status === 'failed' || delivery?.status === 'bounced') && (
            <button
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Tekrar Gönder"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <button
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Arşivle"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">e-Posta Gönderimleri</h1>
          <p className="text-gray-600 mt-1">E-posta gönderim geçmişini ve performansını takip edin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Analitik
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            Rapor Al
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="E-posta ID, alıcı, e-posta adresi veya konu ara..."
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtreler:</span>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="delivered">Teslim Edildi</option>
            <option value="opened">Açıldı</option>
            <option value="clicked">Tıklandı</option>
            <option value="sent">Gönderildi</option>
            <option value="pending">Beklemede</option>
            <option value="bounced">Geri Döndü</option>
            <option value="failed">Başarısız</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="urgent">Acil</option>
            <option value="high">Yüksek</option>
            <option value="normal">Normal</option>
            <option value="low">Düşük</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Tarihler</option>
            <option value="today">Bugün</option>
            <option value="yesterday">Dün</option>
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
          </select>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Toplam E-posta</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Teslim Edildi</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-500">%{stats.deliveryRate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Açıldı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.opened}</p>
              <p className="text-xs text-gray-500">%{stats.openRate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Tıklandı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clicked}</p>
              <p className="text-xs text-gray-500">%{stats.clickRate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Başarısız</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bounced}</p>
            </div>
          </div>
        </div>
      </div>

      {/* E-posta Listesi */}
      <div className="bg-white rounded-lg border">
        <DataTable columns={columns} data={filtered} />
      </div>

      {/* E-posta Detay Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="E-posta Detayları"
      >
        {selectedDelivery && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta ID</label>
                <p className="text-sm text-gray-900 font-mono">{selectedDelivery.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedDelivery.status)}
                  {getStatusBadge(selectedDelivery.status)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alıcı</label>
                <p className="text-sm text-gray-900">{selectedDelivery.recipient}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                <p className="text-sm text-gray-900">{selectedDelivery.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                {getPriorityBadge(selectedDelivery.priority)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosya Boyutu</label>
                <p className="text-sm text-gray-900">{formatFileSize(selectedDelivery.size)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gönderim Zamanı</label>
                <p className="text-sm text-gray-900">{selectedDelivery.sentAt}</p>
              </div>
              {selectedDelivery.deliveredAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teslim Zamanı</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.deliveredAt}</p>
                </div>
              )}
              {selectedDelivery.openedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açılma Zamanı</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.openedAt}</p>
                </div>
              )}
              {selectedDelivery.clickedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tıklanma Zamanı</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.clickedAt}</p>
                </div>
              )}
              {selectedDelivery.campaignName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.campaignName}</p>
                </div>
              )}
              {selectedDelivery.templateName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şablon</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.templateName}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-sm text-gray-900 font-medium">{selectedDelivery.subject}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta İçeriği</label>
              <div className="bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDelivery.content}</p>
              </div>
            </div>
            
            {selectedDelivery.hasAttachments && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ekler</label>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {selectedDelivery.attachmentCount} dosya eklendi
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedDelivery.failureReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hata Nedeni</label>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm text-red-800">{selectedDelivery.failureReason}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              {(selectedDelivery.status === 'failed' || selectedDelivery.status === 'bounced') && (
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Gönder
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Archive className="h-4 w-4" />
                Arşivle
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Analitik Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="E-posta Analitikleri"
      >
        <div className="space-y-6">
          {/* Genel Performans */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Genel Performans</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">Toplam E-posta</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">%{stats.deliveryRate}</div>
                <div className="text-sm text-green-800">Teslim Oranı</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">%{stats.openRate}</div>
                <div className="text-sm text-purple-800">Açılma Oranı</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">%{stats.clickRate}</div>
                <div className="text-sm text-yellow-800">Tıklama Oranı</div>
              </div>
            </div>
          </div>
          
          {/* Durum Dağılımı */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Durum Dağılımı</h3>
            <div className="space-y-3">
              {[
                { status: 'delivered', label: 'Teslim Edildi', count: stats.delivered, color: 'green' },
                { status: 'opened', label: 'Açıldı', count: stats.opened, color: 'purple' },
                { status: 'clicked', label: 'Tıklandı', count: stats.clicked, color: 'yellow' },
                { status: 'bounced', label: 'Geri Döndü/Başarısız', count: stats.bounced, color: 'red' },
                { status: 'pending', label: 'Beklemede', count: stats.pending, color: 'gray' }
              ].map(item => {
                const percentage = stats.total > 0 ? ((item.count / stats.total) * 100).toFixed(1) : '0'
                return (
                  <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.count}</div>
                      <div className="text-sm text-gray-600">%{percentage}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Öncelik Dağılımı */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Öncelik Dağılımı</h3>
            <div className="space-y-3">
              {['urgent', 'high', 'normal', 'low'].map(priority => {
                const count = emailDeliveries.filter(d => d.priority === priority).length
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0'
                const labels = { urgent: 'Acil', high: 'Yüksek', normal: 'Normal', low: 'Düşük' }
                
                return (
                  <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{labels[priority as keyof typeof labels]}</div>
                      <div className="text-sm text-gray-600">{count} e-posta</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">%{percentage}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
