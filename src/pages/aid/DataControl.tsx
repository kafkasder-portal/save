import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  X, 
  Database, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Clock,
  BarChart3
} from 'lucide-react'

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

interface DataValidation {
  id: string
  table_name: string
  validation_type: 'integrity' | 'consistency' | 'completeness' | 'accuracy' | 'duplicates'
  field_name?: string
  rule_description: string
  status: 'passed' | 'failed' | 'warning' | 'pending'
  error_count: number
  total_records: number
  error_percentage: number
  last_check: string
  created_at: string
  details?: string
  suggested_action?: string
}

interface DataStats {
  totalValidations: number
  passedValidations: number
  failedValidations: number
  warningValidations: number
  totalRecords: number
  errorRecords: number
  dataQualityScore: number
}

interface TableHealth {
  table_name: string
  record_count: number
  last_updated: string
  health_score: number
  issues: number
  status: 'healthy' | 'warning' | 'critical'
}

const validationSchema = z.object({
  table_name: z.string().min(1, 'Tablo adı seçiniz'),
  validation_type: z.enum(['integrity', 'consistency', 'completeness', 'accuracy', 'duplicates'], {
    message: 'Doğrulama tipi seçiniz'
  }),
  field_name: z.string().optional(),
  rule_description: z.string().min(1, 'Kural açıklaması giriniz'),
  details: z.string().optional(),
  suggested_action: z.string().optional()
})

type ValidationFormData = z.infer<typeof validationSchema>

const tableNames = [
  'beneficiaries',
  'aid_applications',
  'cash_aids',
  'bank_orders',
  'service_tracking',
  'hospital_referrals',
  'parameters',
  'users',
  'donations',
  'reports'
]

const validationTypes = [
  { value: 'integrity', label: 'Veri Bütünlüğü' },
  { value: 'consistency', label: 'Tutarlılık' },
  { value: 'completeness', label: 'Eksiksizlik' },
  { value: 'accuracy', label: 'Doğruluk' },
  { value: 'duplicates', label: 'Tekrar Eden Kayıtlar' }
]

export default function DataControl() {
  const [validations, setValidations] = useState<DataValidation[]>([])
  const [tableHealths, setTableHealths] = useState<TableHealth[]>([])
  const [stats, setStats] = useState<DataStats>({
    totalValidations: 0,
    passedValidations: 0,
    failedValidations: 0,
    warningValidations: 0,
    totalRecords: 0,
    errorRecords: 0,
    dataQualityScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [tableFilter, setTableFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingValidation, setEditingValidation] = useState<DataValidation | null>(null)
  const [showTableHealth, setShowTableHealth] = useState(true)
  const [runningValidation, setRunningValidation] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ValidationFormData>({
    resolver: zodResolver(validationSchema)
  })

  useEffect(() => {
    loadValidations()
    loadTableHealths()
    loadStats()
  }, [])

  const loadValidations = async () => {
    try {
      // Mock data - gerçek uygulamada data_validations tablosu kullanılacak
      const mockValidations: DataValidation[] = [
        {
          id: '1',
          table_name: 'beneficiaries',
          validation_type: 'completeness',
          field_name: 'phone',
          rule_description: 'Telefon numarası zorunlu alanların kontrolü',
          status: 'warning',
          error_count: 15,
          total_records: 250,
          error_percentage: 6.0,
          last_check: new Date().toISOString(),
          created_at: new Date().toISOString(),
          details: '15 kayıtta telefon numarası eksik',
          suggested_action: 'Eksik telefon numaralarını tamamlayın'
        },
        {
          id: '2',
          table_name: 'aid_applications',
          validation_type: 'duplicates',
          field_name: 'beneficiary_id',
          rule_description: 'Aynı kişiden birden fazla aktif başvuru kontrolü',
          status: 'failed',
          error_count: 8,
          total_records: 180,
          error_percentage: 4.4,
          last_check: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          details: '8 kişinin birden fazla aktif başvurusu var',
          suggested_action: 'Tekrar eden başvuruları birleştirin veya iptal edin'
        },
        {
          id: '3',
          table_name: 'cash_aids',
          validation_type: 'integrity',
          field_name: 'amount',
          rule_description: 'Yardım tutarının pozitif olması kontrolü',
          status: 'passed',
          error_count: 0,
          total_records: 95,
          error_percentage: 0.0,
          last_check: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          details: 'Tüm yardım tutarları pozitif',
          suggested_action: ''
        },
        {
          id: '4',
          table_name: 'beneficiaries',
          validation_type: 'accuracy',
          field_name: 'birth_date',
          rule_description: 'Doğum tarihinin mantıklı aralıkta olması kontrolü',
          status: 'warning',
          error_count: 3,
          total_records: 250,
          error_percentage: 1.2,
          last_check: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          details: '3 kayıtta şüpheli doğum tarihi (100+ yaş)',
          suggested_action: 'Doğum tarihlerini kontrol edin'
        },
        {
          id: '5',
          table_name: 'bank_orders',
          validation_type: 'consistency',
          field_name: 'status',
          rule_description: 'Ödeme durumu ile tarih alanlarının tutarlılığı',
          status: 'passed',
          error_count: 0,
          total_records: 45,
          error_percentage: 0.0,
          last_check: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          details: 'Tüm ödeme durumları tutarlı',
          suggested_action: ''
        }
      ]
      
      setValidations(mockValidations)
    } catch (error) {
      log.error('Veri doğrulama kayıtları yüklenirken hata:', error)
      toast.error('Veri doğrulama kayıtları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadTableHealths = async () => {
    try {
      // Mock data
      const mockTableHealths: TableHealth[] = [
        {
          table_name: 'beneficiaries',
          record_count: 250,
          last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          health_score: 85,
          issues: 2,
          status: 'warning'
        },
        {
          table_name: 'aid_applications',
          record_count: 180,
          last_updated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          health_score: 75,
          issues: 3,
          status: 'warning'
        },
        {
          table_name: 'cash_aids',
          record_count: 95,
          last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          health_score: 95,
          issues: 0,
          status: 'healthy'
        },
        {
          table_name: 'bank_orders',
          record_count: 45,
          last_updated: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          health_score: 92,
          issues: 1,
          status: 'healthy'
        }
      ]
      
      setTableHealths(mockTableHealths)
    } catch (error) {
      log.error('Tablo sağlık durumu yüklenirken hata:', error)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        totalValidations: 25,
        passedValidations: 15,
        failedValidations: 4,
        warningValidations: 6,
        totalRecords: 1250,
        errorRecords: 45,
        dataQualityScore: 87
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const filteredValidations = useMemo(() => {
    return validations.filter(validation => {
      const matchesSearch = searchQuery === '' || 
        validation.table_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        validation.rule_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        validation.field_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        validation.details?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesTable = tableFilter === 'all' || validation.table_name === tableFilter
      const matchesType = typeFilter === 'all' || validation.validation_type === typeFilter
      const matchesStatus = statusFilter === 'all' || validation.status === statusFilter

      return matchesSearch && matchesTable && matchesType && matchesStatus
    })
  }, [validations, searchQuery, tableFilter, typeFilter, statusFilter])

  const onSubmit = async (data: ValidationFormData) => {
    try {
      // Gerçek uygulamada data_validations tablosuna kayıt yapılacak
      const newValidation: DataValidation = {
        id: Date.now().toString(),
        ...data,
        status: 'pending',
        error_count: 0,
        total_records: 0,
        error_percentage: 0,
        last_check: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      if (editingValidation) {
        setValidations(prev => prev.map(v => v.id === editingValidation.id ? { ...newValidation, id: editingValidation.id } : v))
        toast.success('Doğrulama kuralı başarıyla güncellendi')
      } else {
        setValidations(prev => [newValidation, ...prev])
        toast.success('Doğrulama kuralı başarıyla oluşturuldu')
      }
      
      setShowAddModal(false)
      reset()
      loadStats()
    } catch (error) {
      log.error('Doğrulama kuralı kaydedilirken hata:', error)
      toast.error('Doğrulama kuralı kaydedilirken hata oluştu')
    }
  }

  const runValidation = async (validationId: string) => {
    try {
      setRunningValidation(validationId)
      
      // Simulated validation run
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock result
      const mockResults = {
        error_count: Math.floor(Math.random() * 20),
        total_records: 100 + Math.floor(Math.random() * 200)
      }
      
      setValidations(prev => prev.map(v => {
        if (v.id === validationId) {
          const error_percentage = (mockResults.error_count / mockResults.total_records) * 100
          const status = error_percentage === 0 ? 'passed' : error_percentage < 5 ? 'warning' : 'failed'
          
          return {
            ...v,
            ...mockResults,
            error_percentage,
            status,
            last_check: new Date().toISOString()
          }
        }
        return v
      }))
      
      toast.success('Doğrulama başarıyla çalıştırıldı')
    } catch (error) {
      log.error('Doğrulama çalıştırılırken hata:', error)
      toast.error('Doğrulama çalıştırılırken hata oluştu')
    } finally {
      setRunningValidation(null)
    }
  }

  const runAllValidations = async () => {
    try {
      setRunningValidation('all')
      
      // Simulated validation run for all
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Update all validations with mock results
      setValidations(prev => prev.map(v => {
        const error_count = Math.floor(Math.random() * 20)
        const total_records = 100 + Math.floor(Math.random() * 200)
        const error_percentage = (error_count / total_records) * 100
        const status = error_percentage === 0 ? 'passed' : error_percentage < 5 ? 'warning' : 'failed'
        
        return {
          ...v,
          error_count,
          total_records,
          error_percentage,
          status,
          last_check: new Date().toISOString()
        }
      }))
      
      toast.success('Tüm doğrulamalar başarıyla çalıştırıldı')
      loadStats()
      loadTableHealths()
    } catch (error) {
      log.error('Doğrulamalar çalıştırılırken hata:', error)
      toast.error('Doğrulamalar çalıştırılırken hata oluştu')
    } finally {
      setRunningValidation(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      passed: { label: 'Başarılı', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: 'Başarısız', class: 'bg-red-100 text-red-800', icon: X },
      warning: { label: 'Uyarı', class: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      pending: { label: 'Bekliyor', class: 'bg-gray-100 text-gray-800', icon: Clock }
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

  const getValidationTypeBadge = (type: string) => {
    const typeMap = {
      integrity: { label: 'Bütünlük', class: 'bg-blue-100 text-blue-800' },
      consistency: { label: 'Tutarlılık', class: 'bg-purple-100 text-purple-800' },
      completeness: { label: 'Eksiksizlik', class: 'bg-orange-100 text-orange-800' },
      accuracy: { label: 'Doğruluk', class: 'bg-green-100 text-green-800' },
      duplicates: { label: 'Tekrar', class: 'bg-red-100 text-red-800' }
    }
    const typeInfo = typeMap[type as keyof typeof typeMap] || { label: type, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeInfo.class}`}>
        {typeInfo.label}
      </span>
    )
  }

  const getHealthStatusBadge = (status: string) => {
    const statusMap = {
      healthy: { label: 'Sağlıklı', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      warning: { label: 'Uyarı', class: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      critical: { label: 'Kritik', class: 'bg-red-100 text-red-800', icon: AlertCircle }
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins} dakika önce`
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`
    } else {
      return `${diffDays} gün önce`
    }
  }

  const validationColumns: Column<DataValidation>[] = [
    {
      key: 'table_info',
      header: 'Tablo & Alan',
      render: (_value, validation) => (
        <div>
          <div className="font-medium flex items-center gap-1">
            <Database className="h-3 w-3 text-blue-600" />
            {validation.table_name}
          </div>
          {validation.field_name && (
            <div className="text-sm text-muted-foreground">
              {validation.field_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'validation_type',
      header: 'Tip',
      render: (_value, validation) => getValidationTypeBadge(validation.validation_type)
    },
    {
      key: 'rule_description',
      header: 'Kural',
      render: (_value, validation) => (
        <div className="max-w-xs">
          <div className="text-sm truncate" title={validation.rule_description}>
            {validation.rule_description}
          </div>
          {validation.details && (
            <div className="text-xs text-muted-foreground mt-1" title={validation.details}>
              {validation.details}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, validation) => getStatusBadge(validation.status)
    },
    {
      key: 'results',
      header: 'Sonuçlar',
      render: (_value, validation) => (
        <div>
          <div className="text-sm">
            <span className={validation.error_count > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
              {validation.error_count}
            </span>
            <span className="text-muted-foreground"> / {validation.total_records}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            %{validation.error_percentage.toFixed(1)} hata
          </div>
          {validation.error_percentage > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div
                className={`h-1 rounded-full ${
                  validation.error_percentage < 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(validation.error_percentage, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'last_check',
      header: 'Son Kontrol',
      render: (_value, validation) => (
        <div>
          <div className="text-sm">{formatTimeAgo(validation.last_check)}</div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(validation.last_check)}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, validation) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => runValidation(validation.id)}
            disabled={runningValidation === validation.id || runningValidation === 'all'}
            className="rounded p-1 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
            title="Doğrulamayı Çalıştır"
          >
            {runningValidation === validation.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditingValidation(validation)
              setShowAddModal(true)
            }}
            className="rounded p-1 text-blue-600 hover:bg-blue-50"
            title="Düzenle"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const healthColumns: Column<TableHealth>[] = [
    {
      key: 'table_name',
      header: 'Tablo',
      render: (_value, health) => (
        <div className="font-medium flex items-center gap-1">
          <Database className="h-4 w-4 text-blue-600" />
          {health.table_name}
        </div>
      )
    },
    {
      key: 'record_count',
      header: 'Kayıt Sayısı',
      render: (_value, health) => (
        <div className="text-sm font-medium">
          {health.record_count.toLocaleString()}
        </div>
      )
    },
    {
      key: 'health_score',
      header: 'Sağlık Skoru',
      render: (_value, health) => (
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            %{health.health_score}
          </div>
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                health.health_score >= 90 ? 'bg-green-500' :
                health.health_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${health.health_score}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'issues',
      header: 'Sorunlar',
      render: (_value, health) => (
        <div className={`text-sm font-medium ${
          health.issues === 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {health.issues}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, health) => getHealthStatusBadge(health.status)
    },
    {
      key: 'last_updated',
      header: 'Son Güncelleme',
      render: (_value, health) => (
        <div>
          <div className="text-sm">{formatTimeAgo(health.last_updated)}</div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(health.last_updated)}
          </div>
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
          <h1 className="text-2xl font-bold">Veri Kontrolü</h1>
          <p className="text-muted-foreground">Veri kalitesini izleyin ve doğrulama kurallarını yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAllValidations}
            disabled={runningValidation === 'all'}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {runningValidation === 'all' ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Tümünü Çalıştır
          </button>
          <button
            onClick={() => {
              setEditingValidation(null)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Yeni Kural
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* StatCard */}
        <div className="rounded border bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Veri Kalite Skoru</p>
              <p className="text-2xl font-bold">{`%${stats.dataQualityScore}`}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Başarılı Doğrulamalar</p>
              <p className="text-2xl font-bold">{stats.passedValidations}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Başarısız Doğrulamalar</p>
              <p className="text-2xl font-bold">{stats.failedValidations}</p>
            </div>
            <X className="h-5 w-5 text-red-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-yellow-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hatalı Kayıtlar</p>
              <p className="text-2xl font-bold">{`${stats.errorRecords} / ${stats.totalRecords}`}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-yellow-700" />
          </div>
        </div>
      </div>

      {/* Tablo Sağlık Durumu */}
      {showTableHealth && (
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Tablo Sağlık Durumu</h2>
            <button
              onClick={() => setShowTableHealth(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <DataTable columns={healthColumns} data={tableHealths} />
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Doğrulama ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
        </div>
        
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Tablolar</option>
          {tableNames.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {validationTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="passed">Başarılı</option>
          <option value="failed">Başarısız</option>
          <option value="warning">Uyarı</option>
          <option value="pending">Bekleyen</option>
        </select>

        <button
          onClick={() => {
            // exportToCsv('veri-kontrol.csv', filteredValidations)
          }}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredValidations.length} doğrulama
        </div>
      </div>

      {/* Doğrulama Tablosu */}
      <DataTable columns={validationColumns} data={filteredValidations} />

      {/* Doğrulama Kuralı Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingValidation ? 'Doğrulama Kuralı Düzenle' : 'Yeni Doğrulama Kuralı'}
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
              <label className="block text-sm font-medium mb-1">Tablo *</label>
              <select
                {...register('table_name')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {tableNames.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
              {errors.table_name && (
                <p className="text-sm text-red-600 mt-1">{errors.table_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Doğrulama Tipi *</label>
              <select
                {...register('validation_type')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {validationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.validation_type && (
                <p className="text-sm text-red-600 mt-1">{errors.validation_type.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alan Adı</label>
            <input
              type="text"
              {...register('field_name')}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Kontrol edilecek alan adı (opsiyonel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kural Açıklaması *</label>
            <textarea
              {...register('rule_description')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Doğrulama kuralının açıklaması..."
            />
            {errors.rule_description && (
              <p className="text-sm text-red-600 mt-1">{errors.rule_description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Detaylar</label>
            <textarea
              {...register('details')}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Ek detaylar ve açıklamalar..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Önerilen Eylem</label>
            <textarea
              {...register('suggested_action')}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Hata durumunda önerilen eylem..."
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
              {editingValidation ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
