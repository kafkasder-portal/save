import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Settings, 
  Users, 
  Save,
  RotateCcw,
  Database,
  Shield
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

interface Parameter {
  id: string
  category: string
  key: string
  value: string
  description: string
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'date'
  is_system: boolean
  is_editable: boolean
  validation_rules?: string
  default_value?: string
  created_at: string
  updated_at: string
  updated_by?: string
}

interface ParameterStats {
  totalParameters: number
  systemParameters: number
  userParameters: number
  categories: number
}

const parameterSchema = z.object({
  category: z.string().min(1, 'Kategori seçiniz'),
  key: z.string().min(1, 'Parametre anahtarı giriniz'),
  value: z.string().min(1, 'Değer giriniz'),
  description: z.string().min(1, 'Açıklama giriniz'),
  data_type: z.enum(['string', 'number', 'boolean', 'json', 'date'], {
    message: 'Veri tipi seçiniz'
  }),
  validation_rules: z.string().optional(),
  default_value: z.string().optional()
})

type ParameterFormData = z.infer<typeof parameterSchema>

const parameterCategories = [
  'Genel Ayarlar',
  'Yardım Limitleri',
  'Başvuru Ayarları',
  'Bildirim Ayarları',
  'Rapor Ayarları',
  'Güvenlik Ayarları',
  'Entegrasyon Ayarları',
  'İş Akışı Ayarları',
  'Kullanıcı Ayarları',
  'Sistem Ayarları'
]

const dataTypes = [
  { value: 'string', label: 'Metin' },
  { value: 'number', label: 'Sayı' },
  { value: 'boolean', label: 'Doğru/Yanlış' },
  { value: 'json', label: 'JSON' },
  { value: 'date', label: 'Tarih' }
]

export default function Parameters() {
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [stats, setStats] = useState<ParameterStats>({
    totalParameters: 0,
    systemParameters: 0,
    userParameters: 0,
    categories: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [systemFilter, setSystemFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null)
  const [showSystemParams, setShowSystemParams] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema)
  })

  const watchDataType = watch('data_type')

  useEffect(() => {
    loadParameters()
    loadStats()
  }, [])

  const loadParameters = async () => {
    try {
      // Mock data - gerçek uygulamada parameters tablosu kullanılacak
      const mockParameters: Parameter[] = [
        {
          id: '1',
          category: 'Yardım Limitleri',
          key: 'max_monthly_aid_amount',
          value: '5000',
          description: 'Aylık maksimum yardım tutarı (TL)',
          data_type: 'number',
          is_system: false,
          is_editable: true,
          validation_rules: 'min:0,max:50000',
          default_value: '3000',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'admin@example.com'
        },
        {
          id: '2',
          category: 'Başvuru Ayarları',
          key: 'application_review_period_days',
          value: '7',
          description: 'Başvuru değerlendirme süresi (gün)',
          data_type: 'number',
          is_system: false,
          is_editable: true,
          validation_rules: 'min:1,max:30',
          default_value: '5',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'admin@example.com'
        },
        {
          id: '3',
          category: 'Bildirim Ayarları',
          key: 'email_notifications_enabled',
          value: 'true',
          description: 'E-posta bildirimlerini etkinleştir',
          data_type: 'boolean',
          is_system: false,
          is_editable: true,
          validation_rules: '',
          default_value: 'true',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'admin@example.com'
        },
        {
          id: '4',
          category: 'Sistem Ayarları',
          key: 'database_version',
          value: '1.2.5',
          description: 'Veritabanı şema versiyonu',
          data_type: 'string',
          is_system: true,
          is_editable: false,
          validation_rules: '',
          default_value: '1.0.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'system'
        },
        {
          id: '5',
          category: 'Güvenlik Ayarları',
          key: 'session_timeout_minutes',
          value: '30',
          description: 'Oturum zaman aşımı süresi (dakika)',
          data_type: 'number',
          is_system: false,
          is_editable: true,
          validation_rules: 'min:5,max:480',
          default_value: '30',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'admin@example.com'
        },
        {
          id: '6',
          category: 'Genel Ayarlar',
          key: 'organization_name',
          value: 'Yardım Derneği',
          description: 'Organizasyon adı',
          data_type: 'string',
          is_system: false,
          is_editable: true,
          validation_rules: 'min:2,max:100',
          default_value: 'Yardım Organizasyonu',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: 'admin@example.com'
        }
      ]
      
      setParameters(mockParameters)
    } catch (error) {
      log.error('Parametreler yüklenirken hata:', error)
      toast.error('Parametreler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        totalParameters: 25,
        systemParameters: 8,
        userParameters: 17,
        categories: 10
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const filteredParameters = useMemo(() => {
    return parameters.filter(param => {
      const matchesSearch = searchQuery === '' || 
        param.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        param.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || param.category === categoryFilter
      const matchesType = typeFilter === 'all' || param.data_type === typeFilter
      const matchesSystem = systemFilter === 'all' || 
        (systemFilter === 'system' && param.is_system) ||
        (systemFilter === 'user' && !param.is_system)

      const matchesSystemVisibility = showSystemParams || !param.is_system

      return matchesSearch && matchesCategory && matchesType && matchesSystem && matchesSystemVisibility
    })
  }, [parameters, searchQuery, categoryFilter, typeFilter, systemFilter, showSystemParams])

  const onSubmit = async (data: ParameterFormData) => {
    try {
      // Gerçek uygulamada parameters tablosuna kayıt yapılacak
      const newParameter: Parameter = {
        id: Date.now().toString(),
        ...data,
        is_system: false,
        is_editable: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: 'current_user@example.com'
      }

      if (editingParameter) {
        setParameters(prev => prev.map(p => p.id === editingParameter.id ? { ...newParameter, id: editingParameter.id } : p))
        toast.success('Parametre başarıyla güncellendi')
      } else {
        setParameters(prev => [newParameter, ...prev])
        toast.success('Parametre başarıyla oluşturuldu')
      }
      
      setShowAddModal(false)
      reset()
      loadStats()
    } catch (error) {
      log.error('Parametre kaydedilirken hata:', error)
      toast.error('Parametre kaydedilirken hata oluştu')
    }
  }

  const updateParameterValue = async (parameterId: string, newValue: string) => {
    try {
      setParameters(prev => prev.map(p => 
        p.id === parameterId 
          ? { ...p, value: newValue, updated_at: new Date().toISOString(), updated_by: 'current_user@example.com' }
          : p
      ))
      toast.success('Parametre değeri güncellendi')
    } catch (error) {
      log.error('Parametre güncellenirken hata:', error)
      toast.error('Parametre güncellenirken hata oluştu')
    }
  }

  const resetParameterToDefault = async (parameterId: string) => {
    try {
      const parameter = parameters.find(p => p.id === parameterId)
      if (parameter && parameter.default_value) {
        await updateParameterValue(parameterId, parameter.default_value)
        toast.success('Parametre varsayılan değere sıfırlandı')
      }
    } catch (error) {
      log.error('Parametre sıfırlanırken hata:', error)
      toast.error('Parametre sıfırlanırken hata oluştu')
    }
  }

  const getDataTypeBadge = (dataType: string) => {
    const typeMap = {
      string: { label: 'Metin', class: 'bg-blue-100 text-blue-800' },
      number: { label: 'Sayı', class: 'bg-green-100 text-green-800' },
      boolean: { label: 'Boolean', class: 'bg-purple-100 text-purple-800' },
      json: { label: 'JSON', class: 'bg-orange-100 text-orange-800' },
      date: { label: 'Tarih', class: 'bg-pink-100 text-pink-800' }
    }
    const typeInfo = typeMap[dataType as keyof typeof typeMap] || { label: dataType, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${typeInfo.class}`}>
        {typeInfo.label}
      </span>
    )
  }

  const formatValue = (parameter: Parameter) => {
    switch (parameter.data_type) {
      case 'boolean':
        return parameter.value === 'true' ? 'Evet' : 'Hayır'
      case 'date':
        try {
          return new Date(parameter.value).toLocaleDateString('tr-TR')
        } catch {
          return parameter.value
        }
      case 'json':
        try {
          return JSON.stringify(JSON.parse(parameter.value), null, 2)
        } catch {
          return parameter.value
        }
      default:
        return parameter.value
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const columns: Column<Parameter>[] = [
    {
      key: 'category',
      header: 'Kategori',
      render: (_value, param) => (
        <div>
          <div className="font-medium">{param.category}</div>
          {param.is_system && (
            <div className="flex items-center gap-1 mt-1">
              <Shield className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600">Sistem</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'key',
      header: 'Anahtar',
      render: (_value, param) => (
        <div>
          <div className="font-mono text-sm">{param.key}</div>
          <div className="text-xs text-muted-foreground mt-1">{param.description}</div>
        </div>
      )
    },
    {
      key: 'value',
      header: 'Değer',
      render: (_value, param) => (
        <div className="max-w-xs">
          {param.is_editable && !param.is_system ? (
            <div className="space-y-2">
              {param.data_type === 'boolean' ? (
                <select
                  value={param.value}
                  onChange={(e) => updateParameterValue(param.id, e.target.value)}
                  className="w-full rounded border px-2 py-1 text-sm"
                >
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </select>
              ) : param.data_type === 'json' ? (
                <textarea
                  value={param.value}
                  onChange={(e) => updateParameterValue(param.id, e.target.value)}
                  className="w-full rounded border px-2 py-1 text-sm font-mono"
                  rows={3}
                />
              ) : (
                <input
                  type={param.data_type === 'number' ? 'number' : param.data_type === 'date' ? 'date' : 'text'}
                  value={param.value}
                  onChange={(e) => updateParameterValue(param.id, e.target.value)}
                  className="w-full rounded border px-2 py-1 text-sm"
                />
              )}
              {param.default_value && param.value !== param.default_value && (
                <button
                  onClick={() => resetParameterToDefault(param.id)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  title="Varsayılan değere sıfırla"
                >
                  <RotateCcw className="h-3 w-3" />
                  Sıfırla
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm">
              {param.data_type === 'json' ? (
                <pre className="text-xs font-mono bg-gray-50 p-2 rounded max-h-20 overflow-auto">
                  {formatValue(param)}
                </pre>
              ) : (
                <span className={param.is_system ? 'text-muted-foreground' : ''}>
                  {formatValue(param)}
                </span>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'data_type',
      header: 'Tip',
      render: (_value, param) => getDataTypeBadge(param.data_type)
    },
    {
      key: 'validation',
      header: 'Doğrulama',
      render: (_value, param) => (
        <div>
          {param.validation_rules ? (
            <div className="text-xs font-mono bg-gray-50 p-1 rounded">
              {param.validation_rules}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
          {param.default_value && (
            <div className="text-xs text-muted-foreground mt-1">
              Varsayılan: {param.default_value}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'updated_info',
      header: 'Güncelleme',
      render: (_value, param) => (
        <div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(param.updated_at)}
          </div>
          {param.updated_by && (
            <div className="text-xs text-muted-foreground">
              {param.updated_by}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, param) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          {param.is_editable && (
            <button
              onClick={() => {
                setEditingParameter(param)
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
          <h1 className="text-2xl font-bold">Parametreler</h1>
          <p className="text-muted-foreground">Sistem parametrelerini yönetin ve yapılandırın</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSystemParams}
              onChange={(e) => setShowSystemParams(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm">Sistem parametrelerini göster</label>
          </div>
          <button
            onClick={() => {
              setEditingParameter(null)
              setShowAddModal(true)
            }}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Yeni Parametre
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-700" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalParameters}</div>
              <div className="text-sm text-blue-700">Toplam Parametreler</div>
            </div>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-red-700" />
            <div>
              <div className="text-2xl font-bold text-red-900">{stats.systemParameters}</div>
              <div className="text-sm text-red-700">Sistem Parametreleri</div>
            </div>
          </div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-green-700" />
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.userParameters}</div>
              <div className="text-sm text-green-700">Kullanıcı Parametreleri</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-purple-700" />
            <div>
              <div className="text-2xl font-bold text-purple-900">{stats.categories}</div>
              <div className="text-sm text-purple-700">Kategoriler</div>
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
            placeholder="Parametre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Kategoriler</option>
          {parameterCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {dataTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select
          value={systemFilter}
          onChange={(e) => setSystemFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tümü</option>
          <option value="system">Sistem Parametreleri</option>
          <option value="user">Kullanıcı Parametreleri</option>
        </select>

        <button
          onClick={() => {
            // exportToCsv('parametreler.csv', filteredParameters)
          }}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredParameters.length} parametre
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredParameters} />

      {/* Parametre Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingParameter ? 'Parametre Düzenle' : 'Yeni Parametre'}
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
              <label className="block text-sm font-medium mb-1">Kategori *</label>
              <select
                {...register('category')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {parameterCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Veri Tipi *</label>
              <select
                {...register('data_type')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {dataTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.data_type && (
                <p className="text-sm text-red-600 mt-1">{errors.data_type.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parametre Anahtarı *</label>
            <input
              type="text"
              {...register('key')}
              className="w-full rounded border px-3 py-2 text-sm font-mono"
              placeholder="parameter_key_name"
            />
            {errors.key && (
              <p className="text-sm text-red-600 mt-1">{errors.key.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Açıklama *</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Parametrenin açıklaması..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Değer *</label>
              {watchDataType === 'boolean' ? (
                <select
                  {...register('value')}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz...</option>
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </select>
              ) : watchDataType === 'json' ? (
                <textarea
                  {...register('value')}
                  rows={4}
                  className="w-full rounded border px-3 py-2 text-sm font-mono"
                  placeholder='{"key": "value"}'
                />
              ) : (
                <input
                  type={watchDataType === 'number' ? 'number' : watchDataType === 'date' ? 'date' : 'text'}
                  {...register('value')}
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Parametre değeri"
                />
              )}
              {errors.value && (
                <p className="text-sm text-red-600 mt-1">{errors.value.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Varsayılan Değer</label>
              <input
                type="text"
                {...register('default_value')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Varsayılan değer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Doğrulama Kuralları</label>
            <input
              type="text"
              {...register('validation_rules')}
              className="w-full rounded border px-3 py-2 text-sm font-mono"
              placeholder="min:0,max:100 veya required,email"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Örnek: min:0,max:100 veya required,email
            </p>
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
              <Save className="h-4 w-4" />
              {editingParameter ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
