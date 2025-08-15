import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  X, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  Phone,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react'
// import { supabase } from '@lib/supabase' // Removed - file deleted
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

interface ServiceTracking {
  id: string
  beneficiary_id: string
  service_type: string
  service_category: string
  description: string
  assigned_to?: string
  start_date: string
  end_date?: string
  expected_completion?: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  location?: string
  contact_person?: string
  contact_phone?: string
  progress_percentage: number
  notes?: string
  created_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
    address?: string
  }
  assigned_user?: {
    name: string
    email: string
  }
}

interface ServiceStats {
  totalServices: number
  inProgress: number
  completed: number
  overdue: number
}

interface Beneficiary {
  id: string
  name: string
  surname: string
  category: string
  phone: string
  address: string
}

const serviceSchema = z.object({
  beneficiary_id: z.string().min(1, 'İhtiyaç sahibi seçiniz'),
  service_type: z.string().min(1, 'Hizmet türü seçiniz'),
  service_category: z.string().min(1, 'Hizmet kategorisi seçiniz'),
  description: z.string().min(1, 'Açıklama giriniz'),
  assigned_to: z.string().optional(),
  start_date: z.string().min(1, 'Başlangıç tarihi seçiniz'),
  expected_completion: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    message: 'Öncelik seçiniz'
  }),
  location: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional()
})

type ServiceFormData = z.infer<typeof serviceSchema>

const serviceTypes = [
  'Ev Ziyareti',
  'Sağlık Hizmeti',
  'Eğitim Desteği',
  'Hukuki Danışmanlık',
  'Psikolojik Destek',
  'Mesleki Eğitim',
  'İş Bulma Desteği',
  'Ev Onarımı',
  'Temizlik Hizmeti',
  'Ulaşım Desteği',
  'Tercümanlık',
  'Diğer'
]

const serviceCategories: Record<string, string[]> = {
  'Ev Ziyareti': ['Durum Tespiti', 'Takip Ziyareti', 'Kontrol Ziyareti'],
  'Sağlık Hizmeti': ['Doktor Randevusu', 'Hastane Sevki', 'İlaç Desteği', 'Tıbbi Malzeme'],
  'Eğitim Desteği': ['Okul Kaydı', 'Ders Desteği', 'Kırtasiye Yardımı', 'Okul Servisi'],
  'Hukuki Danışmanlık': ['Hukuki Bilgilendirme', 'Dava Takibi', 'Belge Düzenleme'],
  'Psikolojik Destek': ['Bireysel Görüşme', 'Grup Terapisi', 'Aile Danışmanlığı'],
  'Mesleki Eğitim': ['Kurs Kaydı', 'Sertifika Programı', 'Staj Desteği'],
  'İş Bulma Desteği': ['İş Arama', 'Mülakat Hazırlığı', 'CV Hazırlama'],
  'Ev Onarımı': ['Elektrik', 'Su Tesisatı', 'Boyama', 'Genel Onarım'],
  'Temizlik Hizmeti': ['Genel Temizlik', 'Dezenfeksiyon', 'Bahçe Bakımı'],
  'Ulaş��m Desteği': ['Hastane Ulaşımı', 'Okul Ulaşımı', 'Resmi Kurum Ulaşımı'],
  'Tercümanlık': ['Resmi Kurum', 'Hastane', 'Okul', 'Hukuki İşlemler'],
  'Diğer': ['Özel Durum']
}

const assignedUsers = [
  { id: 'user1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com' },
  { id: 'user2', name: 'Fatma Demir', email: 'fatma@example.com' },
  { id: 'user3', name: 'Mehmet Kaya', email: 'mehmet@example.com' },
  { id: 'user4', name: 'Ayşe Öztürk', email: 'ayse@example.com' }
]

export default function ServiceTracking() {
  const [services, setServices] = useState<ServiceTracking[]>([])
  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceTracking | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema)
  })

  const watchedServiceType = watch('service_type')

  useEffect(() => {
    loadServices()
    loadStats()
    loadBeneficiaries()
  }, [])

  const loadServices = async () => {
    try {
      // Mock data - gerçek uygulamada service_tracking tablosu kullanılacak
      const mockServices: ServiceTracking[] = [
        {
          id: '1',
          beneficiary_id: 'ben1',
          service_type: 'Ev Ziyareti',
          service_category: 'Durum Tespiti',
          description: 'Ailenin mevcut durumunu tespit etmek için ev ziyareti',
          assigned_to: 'user1',
          start_date: new Date().toISOString(),
          expected_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in_progress',
          priority: 'high',
          location: 'Ankara, Çankaya',
          contact_person: 'Ahmet Yılmaz',
          contact_phone: '0532 123 45 67',
          progress_percentage: 60,
          notes: 'İlk ziyaret tamamlandı, takip ziyareti planlandı',
          created_at: new Date().toISOString(),
          beneficiaries: {
            name: 'Ali',
            surname: 'Veli',
            phone: '0533 987 65 43',
            category: 'Aile',
            address: 'Ankara, Çankaya'
          },
          assigned_user: {
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com'
          }
        },
        {
          id: '2',
          beneficiary_id: 'ben2',
          service_type: 'Sağlık Hizmeti',
          service_category: 'Doktor Randevusu',
          description: 'Kardiyoloji kontrolü için doktor randevusu alınması',
          assigned_to: 'user2',
          start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString(),
          status: 'completed',
          priority: 'medium',
          location: 'Ankara Şehir Hastanesi',
          contact_person: 'Fatma Demir',
          contact_phone: '0534 567 89 01',
          progress_percentage: 100,
          notes: 'Randevu alındı ve hasta muayene edildi',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          beneficiaries: {
            name: 'Ayşe',
            surname: 'Kaya',
            phone: '0535 123 45 67',
            category: 'Yaşlı',
            address: 'Ankara, Keçiören'
          },
          assigned_user: {
            name: 'Fatma Demir',
            email: 'fatma@example.com'
          }
        }
      ]
      
      setServices(mockServices)
    } catch (error) {
      log.error('Hizmet takip kayıtları yüklenirken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
      toast.error('Hizmet takip kayıtları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        totalServices: 25,
        inProgress: 8,
        completed: 15,
        overdue: 2
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }

  const loadBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, name, surname, category, phone, address')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setBeneficiaries(data || [])
    } catch (error) {
      log.error('İhtiyaç sahipleri yüklenirken hata:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = searchQuery === '' || 
        `${service.beneficiaries?.name} ${service.beneficiaries?.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.location?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === 'all' || service.service_type === typeFilter
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || service.priority === priorityFilter
      const matchesAssigned = assignedFilter === 'all' || service.assigned_to === assignedFilter

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesAssigned
    })
  }, [services, searchQuery, typeFilter, statusFilter, priorityFilter, assignedFilter])

  const onSubmit = async (data: ServiceFormData) => {
    try {
      // Gerçek uygulamada service_tracking tablosuna kayıt yapılacak
      const newService: ServiceTracking = {
        id: Date.now().toString(),
        ...data,
        status: 'planned',
        progress_percentage: 0,
        created_at: new Date().toISOString(),
        beneficiaries: beneficiaries.find(b => b.id === data.beneficiary_id),
        assigned_user: assignedUsers.find(u => u.id === data.assigned_to)
      }

      setServices(prev => [newService, ...prev])
      toast.success('Hizmet takip kaydı başarıyla oluşturuldu')
      setShowAddModal(false)
      reset()
      loadStats()
    } catch (error) {
      log.error('Hizmet takip kaydı oluşturulurken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
      toast.error('Hizmet takip kaydı oluşturulurken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      planned: { label: 'Planlandı', class: 'bg-blue-100 text-blue-800', icon: Calendar },
      in_progress: { label: 'Devam Ediyor', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { label: 'Tamamlandı', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'İptal Edildi', class: 'bg-red-100 text-red-800', icon: X },
      on_hold: { label: 'Beklemede', class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    const Icon = statusInfo.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.class}`}>
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: 'Düşük', class: 'bg-gray-100 text-gray-800' },
      medium: { label: 'Orta', class: 'bg-blue-100 text-blue-800' },
      high: { label: 'Yüksek', class: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Acil', class: 'bg-red-100 text-red-800' }
    }
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { label: priority, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${priorityInfo.class}`}>
        {priorityInfo.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }



  const isOverdue = (service: ServiceTracking) => {
    if (!service.expected_completion || service.status === 'completed') return false
    return new Date(service.expected_completion) < new Date()
  }

  const columns: Column<ServiceTracking>[] = [
    {
      key: 'beneficiaries',
      header: 'İhtiyaç Sahibi',
      render: (_value, service: ServiceTracking) => (
        <div>
          <div className="font-medium">{service.beneficiaries?.name} {service.beneficiaries?.surname}</div>
          <div className="text-sm text-muted-foreground">{service.beneficiaries?.category}</div>
          {service.beneficiaries?.phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {service.beneficiaries.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'service_info',
      header: 'Hizmet Bilgisi',
      render: (_value, service: ServiceTracking) => (
        <div>
          <div className="font-medium">{service.service_type}</div>
          <div className="text-sm text-muted-foreground">{service.service_category}</div>
          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate" title={service.description}>
            {service.description}
          </div>
        </div>
      )
    },
    {
      key: 'assigned_user',
      header: 'Atanan Kişi',
      render: (_value, service) => (
        <div>
          {service.assigned_user ? (
            <>
              <div className="font-medium flex items-center gap-1">
                <User className="h-3 w-3" />
                {service.assigned_user.name}
              </div>
              <div className="text-xs text-muted-foreground">{service.assigned_user.email}</div>
            </>
          ) : (
            <span className="text-muted-foreground">Atanmamış</span>
          )}
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Öncelik',
      render: (_value, service: ServiceTracking) => getPriorityBadge(service.priority)
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, service: ServiceTracking) => (
        <div>
          {getStatusBadge(service.status)}
          {service.status === 'in_progress' && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${service.progress_percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                %{service.progress_percentage}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Tarihler',
      render: (_value, service: ServiceTracking) => (
        <div>
          <div className="text-sm">
            <strong>Başlangıç:</strong> {formatDate(service.start_date)}
          </div>
          {service.expected_completion && (
            <div className={`text-sm ${
              isOverdue(service) ? 'text-red-600 font-medium' : 'text-muted-foreground'
            }`}>
              <strong>Bitiş:</strong> {formatDate(service.expected_completion)}
              {isOverdue(service) && <span className="ml-1">(Gecikmiş)</span>}
            </div>
          )}
          {service.end_date && (
            <div className="text-sm text-green-600">
              <strong>Tamamlandı:</strong> {formatDate(service.end_date)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      header: 'Konum',
      render: (_value, service: ServiceTracking) => (
        <div>
          {service.location ? (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{service.location}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, service: ServiceTracking) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          {service.status !== 'completed' && service.status !== 'cancelled' && (
            <button
              onClick={() => {
                setEditingService(service)
                setShowAddModal(true)
              }}
              className="rounded p-1 text-blue-600 hover:bg-blue-50"
              title="Düzenle"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hizmet Takip İşlemleri</h1>
          <p className="text-muted-foreground">Verilen hizmetleri takip edin ve yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null)
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Hizmet
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* StatCard */}
        <div className="rounded border bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Hizmetler</p>
              <p className="text-2xl font-bold">{stats.totalServices}</p>
            </div>
            <Users className="h-5 w-5 text-blue-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-yellow-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Devam Eden</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Geciken</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-700" />
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Hizmet ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Hizmet Türleri</option>
          {serviceTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="planned">Planlandı</option>
          <option value="in_progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
          <option value="on_hold">Beklemede</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="low">Düşük</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
          <option value="urgent">Acil</option>
        </select>

        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Atananlar</option>
          {assignedUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <button
          onClick={() => {
            // exportToCsv('hizmet-takip.csv', filteredServices)
          }}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredServices.length} hizmet
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredServices} />

      {/* Hizmet Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Takibi'}
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İhtiyaç Sahibi *</label>
              <select
                {...register('beneficiary_id')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {beneficiaries.map(beneficiary => (
                  <option key={beneficiary.id} value={beneficiary.id}>
                    {beneficiary.name} {beneficiary.surname} - {beneficiary.category}
                  </option>
                ))}
              </select>
              {errors.beneficiary_id && (
                <p className="text-sm text-red-600 mt-1">{errors.beneficiary_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hizmet Türü *</label>
              <select
                {...register('service_type')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.service_type && (
                <p className="text-sm text-red-600 mt-1">{errors.service_type.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hizmet Kategorisi *</label>
              <select
                {...register('service_category')}
                className="w-full rounded border px-3 py-2 text-sm"
                disabled={!watchedServiceType}
              >
                <option value="">Seçiniz...</option>
                {watchedServiceType && serviceCategories[watchedServiceType]?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.service_category && (
                <p className="text-sm text-red-600 mt-1">{errors.service_category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Öncelik *</label>
              <select
                {...register('priority')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </select>
              {errors.priority && (
                <p className="text-sm text-red-600 mt-1">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Açıklama *</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Hizmet açıklaması..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Atanan Kişi</label>
              <select
                {...register('assigned_to')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {assignedUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Konum</label>
              <input
                type="text"
                {...register('location')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Hizmet konumu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              {errors.start_date && (
                <p className="text-sm text-red-600 mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Beklenen Bitiş Tarihi</label>
              <input
                type="date"
                {...register('expected_completion')}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İletişim Kişisi</label>
              <input
                type="text"
                {...register('contact_person')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="İletişim kişisi adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">İletişim Telefonu</label>
              <input
                type="tel"
                {...register('contact_phone')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0532 123 45 67"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Hizmet ile ilgili notlar..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {editingService ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
