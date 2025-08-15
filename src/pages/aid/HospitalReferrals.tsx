import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  X, 
  Clock, 
  Calendar, 
  Phone, 
  FileText,
  AlertCircle,
  CheckCircle,
  User,
  Building2,
  Stethoscope,
  Truck,
  Heart
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { Modal } from '../../components/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

interface HospitalReferral {
  id: string
  beneficiary_id: string
  hospital_name: string
  department: string
  doctor_name?: string
  referral_reason: string
  urgency_level: 'normal' | 'urgent' | 'emergency'
  appointment_date?: string
  appointment_time?: string
  referral_date: string
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  transportation_needed: boolean
  transportation_type?: string
  companion_needed: boolean
  companion_name?: string
  companion_phone?: string
  medical_documents?: string
  insurance_info?: string
  notes?: string
  created_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
    address?: string
    birth_date?: string
  }
  created_by?: {
    name: string
    email: string
  }
}

interface ReferralStats {
  totalReferrals: number
  pending: number
  scheduled: number
  completed: number
  emergency: number
}

const referralSchema = z.object({
  beneficiary_id: z.string().min(1, 'İhtiyaç sahibi seçiniz'),
  hospital_name: z.string().min(1, 'Hastane adı giriniz'),
  department: z.string().min(1, 'Bölüm seçiniz'),
  doctor_name: z.string().optional(),
  referral_reason: z.string().min(1, 'Sevk nedeni giriniz'),
  urgency_level: z.enum(['normal', 'urgent', 'emergency'], {
    message: 'Aciliyet seviyesi seçiniz'
  }),
  appointment_date: z.string().optional(),
  appointment_time: z.string().optional(),
  transportation_needed: z.boolean(),
  transportation_type: z.string().optional(),
  companion_needed: z.boolean(),
  companion_name: z.string().optional(),
  companion_phone: z.string().optional(),
  medical_documents: z.string().optional(),
  insurance_info: z.string().optional(),
  notes: z.string().optional()
})

type ReferralFormData = z.infer<typeof referralSchema>

const hospitals = [
  'Ankara Şehir Hastanesi',
  'Hacettepe Üniversitesi Hastanesi',
  'Gazi Üniversitesi Hastanesi',
  'Ankara Üniversitesi Tıp Fakültesi Hastanesi',
  'Numune Eğitim ve Araştırma Hastanesi',
  'Dışkapı Yıldırım Beyazıt Eğitim ve Araştırma Hastanesi',
  'Keçiören Eğitim ve Araştırma Hastanesi',
  'Atatürk Göğüs Hastalıkları Hastanesi',
  'Dr. Sami Ulus Kadın Doğum Hastanesi',
  'Ankara Fizik Tedavi Hastanesi'
]

const departments = [
  'Dahiliye',
  'Kardiyoloji',
  'Nöroloji',
  'Ortopedi',
  'Göz Hastalıkları',
  'Kulak Burun Boğaz',
  'Üroloji',
  'Kadın Hastalıkları',
  'Çocuk Hastalıkları',
  'Psikiyatri',
  'Dermatoloji',
  'Genel Cerrahi',
  'Beyin Cerrahisi',
  'Kalp Cerrahisi',
  'Göğüs Cerrahisi',
  'Plastik Cerrahi',
  'Fizik Tedavi',
  'Radyoloji',
  'Onkoloji',
  'Endokrinoloji'
]

const transportationTypes = [
  'Ambulans',
  'Hasta Nakil Aracı',
  'Özel Araç',
  'Toplu Taşıma',
  'Taksi'
]

export default function HospitalReferrals() {
  const [referrals, setReferrals] = useState<HospitalReferral[]>([])
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pending: 0,
    scheduled: 0,
    completed: 0,
    emergency: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [hospitalFilter, setHospitalFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReferral, setEditingReferral] = useState<HospitalReferral | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<{ id: string; name: string; surname: string; category: string; phone: string; address: string; birth_date: string }[]>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema)
  })

  const watchTransportationNeeded = watch('transportation_needed')
  const watchCompanionNeeded = watch('companion_needed')

  useEffect(() => {
    loadReferrals()
    loadStats()
    loadBeneficiaries()
  }, [])

  const loadReferrals = async () => {
    try {
      // Mock data - gerçek uygulamada hospital_referrals tablosu kullanılacak
      const mockReferrals: HospitalReferral[] = [
        {
          id: '1',
          beneficiary_id: 'ben1',
          hospital_name: 'Ankara Şehir Hastanesi',
          department: 'Kardiyoloji',
          doctor_name: 'Dr. Mehmet Özkan',
          referral_reason: 'Kalp ritim bozukluğu kontrolü',
          urgency_level: 'urgent',
          appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          appointment_time: '14:30',
          referral_date: new Date().toISOString(),
          status: 'scheduled',
          transportation_needed: true,
          transportation_type: 'Ambulans',
          companion_needed: true,
          companion_name: 'Fatma Yılmaz',
          companion_phone: '0532 123 45 67',
          medical_documents: 'EKG sonuçları, kan tahlilleri',
          insurance_info: 'SGK',
          notes: 'Hasta yürümekte zorlanıyor, tekerlekli sandalye gerekli',
          created_at: new Date().toISOString(),
          beneficiaries: {
            name: 'Ali',
            surname: 'Veli',
            phone: '0533 987 65 43',
            category: 'Yaşlı',
            address: 'Ankara, Çankaya',
            birth_date: '1950-05-15'
          },
          created_by: {
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com'
          }
        },
        {
          id: '2',
          beneficiary_id: 'ben2',
          hospital_name: 'Hacettepe Üniversitesi Hastanesi',
          department: 'Çocuk Hastalıkları',
          doctor_name: 'Dr. Ayşe Demir',
          referral_reason: 'Rutin çocuk kontrolü ve aşı takibi',
          urgency_level: 'normal',
          appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          appointment_time: '10:00',
          referral_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'scheduled',
          transportation_needed: false,
          companion_needed: true,
          companion_name: 'Zeynep Kaya',
          companion_phone: '0534 567 89 01',
          medical_documents: 'Aşı kartı',
          insurance_info: 'SGK',
          notes: 'Anne ile birlikte gelecek',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          beneficiaries: {
            name: 'Elif',
            surname: 'Kaya',
            phone: '0534 567 89 01',
            category: 'Çocuk',
            address: 'Ankara, Keçiören',
            birth_date: '2018-03-20'
          },
          created_by: {
            name: 'Fatma Demir',
            email: 'fatma@example.com'
          }
        }
      ]
      
      setReferrals(mockReferrals)
    } catch (error) {
      log.error('Hastane sevk kayıtları yüklenirken hata:', error)
      toast.error('Hastane sevk kayıtları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        totalReferrals: 45,
        pending: 12,
        scheduled: 18,
        completed: 13,
        emergency: 2
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const loadBeneficiaries = async () => {
    try {
      const { data: beneficiariesData, error } = await supabase
        .from('beneficiaries')
        .select('id, name, surname, category, phone, address, birth_date')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setBeneficiaries(beneficiariesData || [])
    } catch (error) {
      log.error('İhtiyaç sahipleri yüklenirken hata:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  const filteredReferrals = useMemo(() => {
    return referrals.filter(referral => {
      const matchesSearch = searchQuery === '' || 
        `${referral.beneficiaries?.name} ${referral.beneficiaries?.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        referral.referral_reason.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesHospital = hospitalFilter === 'all' || referral.hospital_name === hospitalFilter
      const matchesDepartment = departmentFilter === 'all' || referral.department === departmentFilter
      const matchesStatus = statusFilter === 'all' || referral.status === statusFilter
      const matchesUrgency = urgencyFilter === 'all' || referral.urgency_level === urgencyFilter

      return matchesSearch && matchesHospital && matchesDepartment && matchesStatus && matchesUrgency
    })
  }, [referrals, searchQuery, hospitalFilter, departmentFilter, statusFilter, urgencyFilter])

  const onSubmit = async (data: ReferralFormData) => {
    try {
      // Gerçek uygulamada hospital_referrals tablosuna kayıt yapılacak
      const newReferral: HospitalReferral = {
        id: Date.now().toString(),
        ...data,
        referral_date: new Date().toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        beneficiaries: beneficiaries.find(b => b.id === data.beneficiary_id),
        created_by: {
          name: 'Mevcut Kullanıcı',
          email: 'user@example.com'
        }
      }

      setReferrals(prev => [newReferral, ...prev])
      toast.success('Hastane sevk kaydı başarıyla oluşturuldu')
      setShowAddModal(false)
      reset()
      loadStats()
    } catch (error) {
      log.error('Hastane sevk kaydı oluşturulurken hata:', error)
      toast.error('Hastane sevk kaydı oluşturulurken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      scheduled: { label: 'Randevulu', class: 'bg-blue-100 text-blue-800', icon: Calendar },
      completed: { label: 'Tamamlandı', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'İptal Edildi', class: 'bg-red-100 text-red-800', icon: X },
      no_show: { label: 'Gelmedi', class: 'bg-gray-100 text-gray-800', icon: AlertCircle }
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

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap = {
      normal: { label: 'Normal', class: 'bg-green-100 text-green-800' },
      urgent: { label: 'Acil', class: 'bg-orange-100 text-orange-800' },
      emergency: { label: 'Acil Servis', class: 'bg-red-100 text-red-800' }
    }
    const urgencyInfo = urgencyMap[urgency as keyof typeof urgencyMap] || { label: urgency, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${urgencyInfo.class}`}>
        {urgencyInfo.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const columns: Column<HospitalReferral>[] = [
    {
      key: 'beneficiaries',
      header: 'Hasta Bilgisi',
      render: (_value, referral) => (
        <div>
          <div className="font-medium">{referral.beneficiaries?.name} {referral.beneficiaries?.surname}</div>
          <div className="text-sm text-muted-foreground">{referral.beneficiaries?.category}</div>
          {referral.beneficiaries?.birth_date && (
            <div className="text-xs text-muted-foreground">
              {calculateAge(referral.beneficiaries.birth_date)} yaş
            </div>
          )}
          {referral.beneficiaries?.phone && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {referral.beneficiaries.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'hospital_info',
      header: 'Hastane & Bölüm',
      render: (_value, referral) => (
        <div>
          <div className="font-medium flex items-center gap-1">
            <Building2 className="h-3 w-3 text-blue-600" />
            {referral.hospital_name}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            {referral.department}
          </div>
          {referral.doctor_name && (
            <div className="text-xs text-muted-foreground">
              Dr. {referral.doctor_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'referral_reason',
      header: 'Sevk Nedeni',
      render: (_value, referral) => (
        <div className="max-w-xs">
          <div className="text-sm truncate" title={referral.referral_reason}>
            {referral.referral_reason}
          </div>
          {referral.medical_documents && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <FileText className="h-3 w-3" />
              Belgeler mevcut
            </div>
          )}
        </div>
      )
    },
    {
      key: 'urgency_level',
      header: 'Aciliyet',
      render: (_value, referral) => getUrgencyBadge(referral.urgency_level)
    },
    {
      key: 'appointment',
      header: 'Randevu',
      render: (_value, referral) => (
        <div>
          {referral.appointment_date ? (
            <>
              <div className="text-sm font-medium">
                {formatDate(referral.appointment_date)}
              </div>
              {referral.appointment_time && (
                <div className="text-xs text-muted-foreground">
                  {referral.appointment_time}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Randevu yok</span>
          )}
        </div>
      )
    },
    {
      key: 'transportation',
      header: 'Ulaşım',
      render: (_value, referral) => (
        <div>
          {referral.transportation_needed ? (
            <div className="flex items-center gap-1">
              <Truck className="h-3 w-3 text-red-600" />
              <span className="text-sm">{referral.transportation_type || 'Gerekli'}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Gerekmiyor</span>
          )}
          {referral.companion_needed && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <User className="h-3 w-3" />
              Refakatçi: {referral.companion_name || 'Gerekli'}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, referral) => getStatusBadge(referral.status)
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, referral) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          {referral.status !== 'completed' && referral.status !== 'cancelled' && (
            <button
              onClick={() => {
                setEditingReferral(referral)
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

  const handleExport = () => {
    log.info('Exporting referrals...')
    // Export logic here
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hastane Sevk İşlemleri</h1>
          <p className="text-muted-foreground">Hastane sevklerini yönetin ve takip edin</p>
        </div>
        <button
          onClick={() => {
            setEditingReferral(null)
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Sevk
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-700" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalReferrals}</div>
              <div className="text-sm text-blue-700">Toplam Sevkler</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-700" />
            <div>
              <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
              <div className="text-sm text-yellow-700">Bekleyen</div>
            </div>
          </div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-700" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.scheduled}</div>
              <div className="text-sm text-blue-700">Randevulu</div>
            </div>
          </div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-700" />
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
              <div className="text-sm text-green-700">Tamamlanan</div>
            </div>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-red-700" />
            <div>
              <div className="text-2xl font-bold text-red-900">{stats.emergency}</div>
              <div className="text-sm text-red-700">Acil Servis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Sevk ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
        </div>
        
        <select
          value={hospitalFilter}
          onChange={(e) => setHospitalFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Hastaneler</option>
          {hospitals.map(hospital => (
            <option key={hospital} value={hospital}>{hospital}</option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Bölümler</option>
          {departments.map(department => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="scheduled">Randevulu</option>
          <option value="completed">Tamamlanan</option>
          <option value="cancelled">İptal Edilen</option>
          <option value="no_show">Gelmeyen</option>
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Aciliyet Seviyeleri</option>
          <option value="normal">Normal</option>
          <option value="urgent">Acil</option>
          <option value="emergency">Acil Servis</option>
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredReferrals.length} sevk
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredReferrals} />

      {/* Sevk Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingReferral ? 'Sevk Düzenle' : 'Yeni Hastane Sevki'}
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
              <label className="block text-sm font-medium mb-1">Hasta *</label>
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
              <label className="block text-sm font-medium mb-1">Aciliyet Seviyesi *</label>
              <select
                {...register('urgency_level')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                <option value="normal">Normal</option>
                <option value="urgent">Acil</option>
                <option value="emergency">Acil Servis</option>
              </select>
              {errors.urgency_level && (
                <p className="text-sm text-red-600 mt-1">{errors.urgency_level.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hastane *</label>
              <select
                {...register('hospital_name')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {hospitals.map(hospital => (
                  <option key={hospital} value={hospital}>{hospital}</option>
                ))}
              </select>
              {errors.hospital_name && (
                <p className="text-sm text-red-600 mt-1">{errors.hospital_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bölüm *</label>
              <select
                {...register('department')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {departments.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Doktor Adı</label>
              <input
                type="text"
                {...register('doctor_name')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Dr. Adı Soyadı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sigorta Bilgisi</label>
              <input
                type="text"
                {...register('insurance_info')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="SGK, Özel Sigorta, vb."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sevk Nedeni *</label>
            <textarea
              {...register('referral_reason')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Sevk nedeni ve şikayetler..."
            />
            {errors.referral_reason && (
              <p className="text-sm text-red-600 mt-1">{errors.referral_reason.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Randevu Tarihi</label>
              <input
                type="date"
                {...register('appointment_date')}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Randevu Saati</label>
              <input
                type="time"
                {...register('appointment_time')}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tıbbi Belgeler</label>
            <input
              type="text"
              {...register('medical_documents')}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Mevcut belgeler (EKG, kan tahlili, vb.)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('transportation_needed')}
                  className="rounded"
                />
                <label className="text-sm font-medium">Ulaşım Desteği Gerekli</label>
              </div>
              
              {watchTransportationNeeded && (
                <div>
                  <label className="block text-sm font-medium mb-1">Ulaşım Türü</label>
                  <select
                    {...register('transportation_type')}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    <option value="">Seçiniz...</option>
                    {transportationTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('companion_needed')}
                  className="rounded"
                />
                <label className="text-sm font-medium">Refakatçi Gerekli</label>
              </div>
              
              {watchCompanionNeeded && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Refakatçi Adı</label>
                    <input
                      type="text"
                      {...register('companion_name')}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="Refakatçi adı soyadı"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Refakatçi Telefonu</label>
                    <input
                      type="tel"
                      {...register('companion_phone')}
                      className="w-full rounded border px-3 py-2 text-sm"
                      placeholder="0532 123 45 67"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Ek notlar ve özel durumlar..."
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
              {editingReferral ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
