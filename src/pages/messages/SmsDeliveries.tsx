import { useState, useMemo } from 'react'
import { 
  Smartphone, 
  Send, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'

interface SmsDelivery {
  id: string
  recipient: string
  phone: string
  content: string
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sentAt: string
  deliveredAt?: string
  failureReason?: string
  cost: number
  messageLength: number
  parts: number
  provider: string
  campaignId?: string
  campaignName?: string
}

export default function SmsDeliveries() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedDelivery, setSelectedDelivery] = useState<SmsDelivery | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)

  // Mock SMS gönderim verileri
  const [smsDeliveries] = useState<SmsDelivery[]>([
    {
      id: 'SMS001',
      recipient: 'Ahmet Yılmaz',
      phone: '+90 532 123 4567',
      content: 'Merhaba Ahmet, randevunuz yarın saat 14:00\'da. Lütfen zamanında gelin.',
      status: 'delivered',
      sentAt: '2024-01-15 10:30:00',
      deliveredAt: '2024-01-15 10:30:15',
      cost: 0.05,
      messageLength: 65,
      parts: 1,
      provider: 'Turkcell',
      campaignId: 'CAMP001',
      campaignName: 'Randevu Hatırlatma'
    },
    {
      id: 'SMS002',
      recipient: 'Fatma Demir',
      phone: '+90 533 987 6543',
      content: 'Sayın Fatma, ödemenizin son tarihi yaklaşıyor. Lütfen en kısa sürede ödeme yapın.',
      status: 'sent',
      sentAt: '2024-01-15 11:15:00',
      cost: 0.05,
      messageLength: 78,
      parts: 1,
      provider: 'Vodafone',
      campaignId: 'CAMP002',
      campaignName: 'Ödeme Hatırlatma'
    },
    {
      id: 'SMS003',
      recipient: 'Mehmet Kaya',
      phone: '+90 534 555 1234',
      content: 'Acil: Sistem bakımı nedeniyle hizmetlerimiz geçici olarak durdurulmuştur. Detaylar için web sitemizi ziyaret edin.',
      status: 'failed',
      sentAt: '2024-01-15 12:00:00',
      failureReason: 'Geçersiz numara',
      cost: 0.00,
      messageLength: 115,
      parts: 1,
      provider: 'Turk Telekom',
      campaignId: 'CAMP003',
      campaignName: 'Acil Bilgilendirme'
    },
    {
      id: 'SMS004',
      recipient: 'Ayşe Özkan',
      phone: '+90 535 777 8888',
      content: 'Hoş geldiniz! Üyeliğiniz başarıyla oluşturuldu. Kullanıcı adınız: ayse.ozkan, şifrenizi e-posta adresinize gönderdik.',
      status: 'delivered',
      sentAt: '2024-01-15 13:45:00',
      deliveredAt: '2024-01-15 13:45:08',
      cost: 0.08,
      messageLength: 125,
      parts: 2,
      provider: 'Turkcell',
      campaignId: 'CAMP004',
      campaignName: 'Hoş Geldin Mesajı'
    },
    {
      id: 'SMS005',
      recipient: 'Ali Veli',
      phone: '+90 536 999 0000',
      content: 'Promosyon: %50 indirim fırsatı! Bugün sınırlı süre için tüm ürünlerde geçerli. Kod: INDIRIM50',
      status: 'pending',
      sentAt: '2024-01-15 14:20:00',
      cost: 0.05,
      messageLength: 95,
      parts: 1,
      provider: 'Vodafone',
      campaignId: 'CAMP005',
      campaignName: 'Promosyon Kampanyası'
    }
  ])

  const providers = ['Turkcell', 'Vodafone', 'Turk Telekom']

  const filtered = useMemo(() => {
    return smsDeliveries.filter(delivery => {
      const matchesSearch = delivery.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.phone.includes(searchTerm) ||
                           delivery.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           delivery.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter
      const matchesProvider = providerFilter === 'all' || delivery.provider === providerFilter
      
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
      
      return matchesSearch && matchesStatus && matchesProvider && matchesDate
    })
  }, [searchTerm, statusFilter, providerFilter, dateFilter, smsDeliveries])

  const handleViewDelivery = (delivery: SmsDelivery) => {
    setSelectedDelivery(delivery)
    setIsViewModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      sent: 'Gönderildi',
      delivered: 'Teslim Edildi',
      failed: 'Başarısız',
      pending: 'Beklemede'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getStats = () => {
    const total = smsDeliveries.length
    const delivered = smsDeliveries.filter(d => d.status === 'delivered').length
    const failed = smsDeliveries.filter(d => d.status === 'failed').length
    const pending = smsDeliveries.filter(d => d.status === 'pending').length
    const totalCost = smsDeliveries.reduce((sum, d) => sum + d.cost, 0)
    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0'
    
    return { total, delivered, failed, pending, totalCost, deliveryRate }
  }

  const stats = getStats()

  const columns: Column<SmsDelivery>[] = [
    {
      key: 'id',
      header: 'SMS ID',
      render: (_, delivery) => (
        <span className="font-mono text-sm text-gray-600">{delivery.id}</span>
      )
    },
    {
      key: 'recipient',
      header: 'Alıcı',
      render: (_, delivery) => (
        <div>
          <div className="font-medium text-sm">{delivery.recipient}</div>
          <div className="text-xs text-gray-500">{delivery.phone}</div>
        </div>
      )
    },
    {
      key: 'content',
      header: 'İçerik',
      render: (_, delivery) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={delivery.content}>
            {delivery.content}
          </p>
          <div className="text-xs text-gray-500 mt-1">
            {delivery.messageLength} karakter, {delivery.parts} parça
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_, delivery) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(delivery.status)}
          {getStatusBadge(delivery.status)}
        </div>
      )
    },
    {
      key: 'provider',
      header: 'Operatör',
      render: (_, delivery) => (
        <span className="text-sm">{delivery.provider}</span>
      )
    },
    {
      key: 'sentAt',
      header: 'Gönderim Zamanı',
      render: (_, delivery) => (
        <div className="text-sm">
          <div>{delivery.sentAt.split(' ')[0]}</div>
          <div className="text-gray-500">{delivery.sentAt.split(' ')[1]}</div>
        </div>
      )
    },
    {
      key: 'cost',
      header: 'Maliyet',
      render: (_, delivery) => (
        <span className="font-medium text-sm">₺{delivery.cost.toFixed(2)}</span>
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
          >
            <Eye className="h-4 w-4" />
          </button>
          {delivery.status === 'failed' && (
            <button
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Tekrar Gönder"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Gönderimleri</h1>
          <p className="text-gray-600 mt-1">SMS gönderim geçmişini ve durumlarını takip edin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            İstatistikler
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
            placeholder="SMS ID, alıcı, telefon veya içerik ara..."
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
            <option value="sent">Gönderildi</option>
            <option value="pending">Beklemede</option>
            <option value="failed">Başarısız</option>
          </select>
          
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Operatörler</option>
            {providers.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
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
            <Smartphone className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Toplam SMS</p>
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
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Başarısız</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Başarı Oranı</p>
              <p className="text-2xl font-bold text-gray-900">%{stats.deliveryRate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Toplam Maliyet</p>
              <p className="text-2xl font-bold text-gray-900">₺{stats.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Listesi */}
      <div className="bg-white rounded-lg border">
        <DataTable columns={columns} data={filtered} />
      </div>

      {/* SMS Detay Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="SMS Detayları"
      >
        {selectedDelivery && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMS ID</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <p className="text-sm text-gray-900">{selectedDelivery.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operatör</label>
                <p className="text-sm text-gray-900">{selectedDelivery.provider}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maliyet</label>
                <p className="text-sm text-gray-900">₺{selectedDelivery.cost.toFixed(2)}</p>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mesaj Uzunluğu</label>
                <p className="text-sm text-gray-900">{selectedDelivery.messageLength} karakter ({selectedDelivery.parts} parça)</p>
              </div>
              {selectedDelivery.campaignName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya</label>
                  <p className="text-sm text-gray-900">{selectedDelivery.campaignName}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj İçeriği</label>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedDelivery.content}</p>
              </div>
            </div>
            
            {selectedDelivery.failureReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hata Nedeni</label>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-sm text-red-800">{selectedDelivery.failureReason}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              {selectedDelivery.status === 'failed' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Tekrar Gönder
                </button>
              )}
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

      {/* İstatistikler Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="SMS İstatistikleri"
      >
        <div className="space-y-6">
          {/* Genel İstatistikler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Genel İstatistikler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-800">Toplam SMS</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
                <div className="text-sm text-green-800">Başarılı</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-red-800">Başarısız</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">%{stats.deliveryRate}</div>
                <div className="text-sm text-purple-800">Başarı Oranı</div>
              </div>
            </div>
          </div>
          
          {/* Operatör Bazında İstatistikler */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Operatör Bazında Dağılım</h3>
            <div className="space-y-3">
              {providers.map(provider => {
                const providerSms = smsDeliveries.filter(d => d.provider === provider)
                const providerDelivered = providerSms.filter(d => d.status === 'delivered').length
                const providerRate = providerSms.length > 0 ? ((providerDelivered / providerSms.length) * 100).toFixed(1) : '0'
                
                return (
                  <div key={provider} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{provider}</div>
                      <div className="text-sm text-gray-600">{providerSms.length} SMS</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">%{providerRate}</div>
                      <div className="text-sm text-gray-600">Başarı Oranı</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Maliyet Analizi */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Maliyet Analizi</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">₺{stats.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Toplam Maliyet</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₺{(stats.totalCost / Math.max(stats.total, 1)).toFixed(3)}</div>
                  <div className="text-sm text-gray-600">SMS Başına Ortalama</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">₺{(stats.totalCost / Math.max(stats.delivered, 1)).toFixed(3)}</div>
                  <div className="text-sm text-gray-600">Başarılı SMS Başına</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
