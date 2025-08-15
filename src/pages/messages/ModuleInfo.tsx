import React, { useState, FormEvent } from 'react'
import { 
  Info, 
  Settings, 
  Users, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react'
import { Modal } from '@components/Modal'

interface ModuleFeature {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'maintenance'
  version: string
  lastUpdate: string
  icon: React.ReactNode
}

interface SystemInfo {
  version: string
  buildDate: string
  environment: string
  uptime: string
  totalMessages: number
  totalUsers: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

export default function ModuleInfo() {
  const [selectedFeature, setSelectedFeature] = useState<ModuleFeature | null>(null)
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false)
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false)

  // Sistem bilgileri
  const systemInfo: SystemInfo = {
    version: '2.1.4',
    buildDate: '2024-01-15',
    environment: 'Production',
    uptime: '15 gün 8 saat 32 dakika',
    totalMessages: 15847,
    totalUsers: 1256,
    systemHealth: 'healthy'
  }

  // Modül özellikleri
  const moduleFeatures: ModuleFeature[] = [
    {
      id: 'bulk-messaging',
      name: 'Toplu Mesaj Gönderimi',
      description: 'Birden fazla alıcıya aynı anda mesaj gönderme özelliği. SMS ve e-posta desteği ile gelişmiş filtreleme seçenekleri.',
      status: 'active',
      version: '1.3.2',
      lastUpdate: '2024-01-10',
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      id: 'message-groups',
      name: 'Mesaj Grupları',
      description: 'Kullanıcıları gruplara ayırarak hedefli mesajlaşma imkanı. Dinamik grup yönetimi ve üye kontrolü.',
      status: 'active',
      version: '1.2.1',
      lastUpdate: '2024-01-08',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'message-templates',
      name: 'Mesaj Şablonları',
      description: 'Önceden hazırlanmış mesaj şablonları ile hızlı mesaj oluşturma. Değişken desteği ve kategori yönetimi.',
      status: 'active',
      version: '1.4.0',
      lastUpdate: '2024-01-12',
      icon: <Settings className="h-6 w-6" />
    },
    {
      id: 'sms-delivery',
      name: 'SMS Gönderimleri',
      description: 'SMS gönderim sistemi ile anlık mesajlaşma. Operatör entegrasyonu ve teslim raporları.',
      status: 'active',
      version: '2.0.1',
      lastUpdate: '2024-01-14',
      icon: <Smartphone className="h-6 w-6" />
    },
    {
      id: 'email-delivery',
      name: 'e-Posta Gönderimleri',
      description: 'Gelişmiş e-posta gönderim sistemi. HTML desteği, ek dosya gönderimi ve açılma takibi.',
      status: 'active',
      version: '2.1.0',
      lastUpdate: '2024-01-15',
      icon: <Mail className="h-6 w-6" />
    },
    {
      id: 'analytics',
      name: 'Mesaj Analitikleri',
      description: 'Detaylı mesaj istatistikleri ve performans raporları. Grafik gösterimler ve trend analizi.',
      status: 'maintenance',
      version: '1.1.5',
      lastUpdate: '2024-01-05',
      icon: <BarChart3 className="h-6 w-6" />
    },
    {
      id: 'security',
      name: 'Güvenlik Modülü',
      description: 'Mesaj güvenliği ve şifreleme sistemi. Kullanıcı yetkilendirme ve erişim kontrolü.',
      status: 'active',
      version: '1.0.8',
      lastUpdate: '2024-01-09',
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: 'scheduler',
      name: 'Zamanlayıcı',
      description: 'Mesajları belirli tarihlerde otomatik gönderme. Tekrarlayan mesaj programları.',
      status: 'inactive',
      version: '0.9.2',
      lastUpdate: '2023-12-28',
      icon: <Clock className="h-6 w-6" />
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'inactive': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    }
    const labels = {
      active: 'Aktif',
      maintenance: 'Bakımda',
      inactive: 'Pasif'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getSystemHealthBadge = (health: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    }
    const labels = {
      healthy: 'Sağlıklı',
      warning: 'Uyarı',
      critical: 'Kritik'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[health as keyof typeof colors]}`}>
        {labels[health as keyof typeof labels]}
      </span>
    )
  }

  const handleFeatureClick = (feature: ModuleFeature) => {
    setSelectedFeature(feature)
    setIsFeatureModalOpen(true)
  }

  const activeFeatures = moduleFeatures.filter(f => f.status === 'active').length
  const maintenanceFeatures = moduleFeatures.filter(f => f.status === 'maintenance').length
  const inactiveFeatures = moduleFeatures.filter(f => f.status === 'inactive').length

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modül Bilgilendirme</h1>
          <p className="text-gray-600 mt-1">Sistem modülleri ve özellikler hakkında detaylı bilgiler</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSystemModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Info className="h-4 w-4" />
            Sistem Bilgileri
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            Sistem Raporu
          </button>
        </div>
      </div>

      {/* Sistem Durumu */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sistem Durumu</h2>
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <RefreshCw className="h-4 w-4" />
            Yenile
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Sistem Sürümü</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemInfo.version}</p>
            <p className="text-sm text-gray-600">Son güncelleme: {systemInfo.buildDate}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="font-medium">Çalışma Süresi</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{systemInfo.uptime}</p>
            <p className="text-sm text-gray-600">Kesintisiz hizmet</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Toplam Mesaj</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemInfo.totalMessages.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Gönderilen mesaj sayısı</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Aktif Kullanıcı</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{systemInfo.totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Kayıtlı kullanıcı sayısı</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sistem Sağlığı:</span>
            {getSystemHealthBadge(systemInfo.systemHealth)}
          </div>
          <div className="text-sm text-gray-600">
            Ortam: <span className="font-medium">{systemInfo.environment}</span>
          </div>
        </div>
      </div>

      {/* Modül İstatistikleri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Aktif Modüller</p>
              <p className="text-2xl font-bold text-gray-900">{activeFeatures}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Bakımda</p>
              <p className="text-2xl font-bold text-gray-900">{maintenanceFeatures}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Pasif Modüller</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveFeatures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modül Listesi */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Sistem Modülleri</h2>
          <p className="text-gray-600 mt-1">Mevcut modüller ve durumları</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleFeatures.map((feature) => (
              <div
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{feature.name}</h3>
                      <p className="text-sm text-gray-600">v{feature.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(feature.status)}
                    {getStatusBadge(feature.status)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Son güncelleme: {feature.lastUpdate}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modül Detay Modal */}
      <Modal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        title="Modül Detayları"
      >
        {selectedFeature && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                {selectedFeature.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedFeature.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedFeature.status)}
                  {getStatusBadge(selectedFeature.status)}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sürüm</label>
                <p className="text-sm text-gray-900">v{selectedFeature.version}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Son Güncelleme</label>
                <p className="text-sm text-gray-900">{selectedFeature.lastUpdate}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <p className="text-sm text-gray-900 leading-relaxed">{selectedFeature.description}</p>
            </div>
            
            {selectedFeature.status === 'maintenance' && (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Bakım Bildirimi</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Bu modül şu anda bakım modundadır. Bazı özellikler geçici olarak kullanılamayabilir.
                </p>
              </div>
            )}
            
            {selectedFeature.status === 'inactive' && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Modül Pasif</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Bu modül şu anda pasif durumdadır. Kullanmak için sistem yöneticisi ile iletişime geçin.
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              {selectedFeature.status === 'active' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Modülü Kullan
                </button>
              )}
              <button
                onClick={() => setIsFeatureModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sistem Bilgileri Modal */}
      <Modal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        title="Detaylı Sistem Bilgileri"
      >
        <div className="space-y-6">
          {/* Sistem Özellikleri */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistem Özellikleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sistem Sürümü</label>
                <p className="text-lg font-semibold">{systemInfo.version}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">Yapı Tarihi</label>
                <p className="text-lg font-semibold">{systemInfo.buildDate}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ortam</label>
                <p className="text-lg font-semibold">{systemInfo.environment}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Süresi</label>
                <p className="text-lg font-semibold">{systemInfo.uptime}</p>
              </div>
            </div>
          </div>
          
          {/* Kullanım İstatistikleri */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kullanım İstatistikleri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <label className="block text-sm font-medium text-blue-700 mb-1">Toplam Mesaj</label>
                <p className="text-2xl font-bold text-blue-900">{systemInfo.totalMessages.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <label className="block text-sm font-medium text-green-700 mb-1">Aktif Kullanıcı</label>
                <p className="text-2xl font-bold text-green-900">{systemInfo.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          {/* Sistem Sağlığı */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sistem Sağlığı</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center justify-between">
                <span className="font-medium">Genel Durum</span>
                {getSystemHealthBadge(systemInfo.systemHealth)}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Kullanımı</span>
                  <span className="font-medium">%23</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '23%'}}></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Bellek Kullanımı</span>
                  <span className="font-medium">%67</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '67%'}}></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Disk Kullanımı</span>
                  <span className="font-medium">%45</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
