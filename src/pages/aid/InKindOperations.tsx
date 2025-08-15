import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Package, 
  Truck, 
  Warehouse, 
  ShoppingCart,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { DataTable } from '@components/DataTable'
import { log } from '@/utils/logger'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

interface InKindOperation {
  id: string
  operation_type: 'received' | 'distributed' | 'transferred' | 'returned'
  item_name: string
  item_category: string
  quantity: number
  unit: string
  unit_value?: number
  total_value: number
  source?: string
  destination?: string
  beneficiary_id?: string
  warehouse_location: string
  expiry_date?: string
  operation_date: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  operator_id: string
  beneficiaries?: {
    name: string
    surname: string
    category: string
  }
  operator?: {
    name: string
    email: string
  }
}

interface InKindStats {
  totalReceived: number
  totalDistributed: number
  currentStock: number
  todayOperations: number
}

const operationSchema = z.object({
  operation_type: z.enum(['received', 'distributed', 'transferred', 'returned'], {
    message: 'İşlem türü seçiniz'
  }),
  item_name: z.string().min(1, 'Ürün adı giriniz'),
  item_category: z.string().min(1, 'Kategori seçiniz'),
  quantity: z.number().min(1, 'Miktar giriniz'),
  unit: z.string().min(1, 'Birim seçiniz'),
  unit_value: z.number().optional(),
  source: z.string().optional(),
  destination: z.string().optional(),
  beneficiary_id: z.string().optional(),
  warehouse_location: z.string().min(1, 'Depo konumu giriniz'),
  expiry_date: z.string().optional(),
  notes: z.string().optional()
})

type OperationFormData = z.infer<typeof operationSchema>

const itemCategories = [
  'Gıda',
  'Giyim',
  'Temizlik',
  'Kırtasiye',
  'Oyuncak',
  'Ev Eşyası',
  'Elektronik',
  'Kitap',
  'Diğer'
]

const units = [
  'Adet',
  'Kg',
  'Gram',
  'Litre',
  'Paket',
  'Kutu',
  'Çuval',
  'Koli'
]

const warehouseLocations = [
  'Ana Depo - A Blok',
  'Ana Depo - B Blok',
  'Ana Depo - C Blok',
  'Şube Depo 1',
  'Şube Depo 2',
  'Soğuk Hava Deposu'
]

export default function InKindOperations() {
  const [operations, setOperations] = useState<InKindOperation[]>([])
  const [stats, setStats] = useState<InKindStats>({
    totalReceived: 0,
    totalDistributed: 0,
    currentStock: 0,
    todayOperations: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOperation, setEditingOperation] = useState<InKindOperation | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<{ id: string; name: string; surname: string; category: string }[]>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema)
  })

  const watchedOperationType = watch('operation_type')
  const watchedQuantity = watch('quantity')
  const watchedUnitValue = watch('unit_value')

  useEffect(() => {
    if (watchedQuantity && watchedUnitValue) {
      // Total value hesaplama burada yapılabilir
    }
  }, [watchedQuantity, watchedUnitValue])

  useEffect(() => {
    loadOperations()
    loadStats()
    loadBeneficiaries()
  }, [])

  const loadOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('in_kind_aids')
        .select(`
          *,
          beneficiaries (
            name,
            surname,
            category
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        operation_type: 'distributed' as const,
        item_name: item.item_name,
        item_category: item.item_category,
        quantity: item.quantity,
        unit: item.unit,
        unit_value: item.unit_value,
        total_value: item.total_value,
        beneficiary_id: item.beneficiary_id,
        warehouse_location: item.warehouse_location || 'Ana Depo - A Blok',
        expiry_date: item.expiry_date,
        operation_date: item.distributed_at || item.created_at,
        status: (item.status === 'distributed' ? 'completed' : 'pending') as 'pending' | 'completed' | 'cancelled',
        notes: item.notes,
        created_at: item.created_at,
        operator_id: 'user1',
        beneficiaries: item.beneficiaries,
        operator: { name: 'Admin User', email: 'admin@example.com' }
      })) || []
      
      setOperations(transformedData)
    } catch (error) {
      log.error('Ayni yardım işlemleri yüklenirken hata:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error('Ayni yardım işlemleri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from('in_kind_aids')
        .select('quantity, total_value, status, created_at')

      if (data) {
        const totalReceived = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
        const totalDistributed = data.filter((item: any) => item.status === 'distributed').reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
        const currentStock = totalReceived - totalDistributed
        const todayOperations = data.filter((item: { created_at?: string }) => {
          const itemDate = new Date(item.created_at || '')
          const today = new Date()
          return itemDate.toDateString() === today.toDateString()
        }).length

        setStats({ totalReceived, totalDistributed, currentStock, todayOperations })
      }
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
        .select('id, name, surname, category')
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

  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch = searchQuery === '' || 
        operation.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.item_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.warehouse_location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === 'all' || operation.operation_type === typeFilter
      const matchesCategory = categoryFilter === 'all' || operation.item_category === categoryFilter
      const matchesStatus = statusFilter === 'all' || operation.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const operationDate = new Date(operation.operation_date)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today': {
            matchesDate = operationDate.toDateString() === now.toDateString()
            break
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = operationDate >= weekAgo
            break
          }
          case 'month': {
            matchesDate = operationDate.getMonth() === now.getMonth() && operationDate.getFullYear() === now.getFullYear()
            break
          }
          default:
            break
        }
      }

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDate
    })
  }, [operations, searchQuery, typeFilter, categoryFilter, statusFilter, dateFilter])

  const onSubmit = async (data: OperationFormData) => {
    try {
      const totalValue = (data.quantity || 0) * (data.unit_value || 0)
      
      const { error } = await supabase
        .from('in_kind_aids')
        .insert({
          beneficiary_id: data.beneficiary_id,
          item_name: data.item_name,
          item_category: data.item_category,
          quantity: data.quantity,
          unit: data.unit,
          unit_value: data.unit_value,
          total_value: totalValue,
          warehouse_location: data.warehouse_location,
          expiry_date: data.expiry_date,
          status: 'pending',
          notes: data.notes
        })

      if (error) throw error

      toast.success('Ayni yardım işlemi başarıyla kaydedildi')
      setShowAddModal(false)
      reset()
      loadOperations()
      loadStats()
    } catch (error) {
      log.error('Ayni yardım işlemi kaydedilirken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
      toast.error('Ayni yardım işlemi kaydedilirken hata oluştu')
    }
  }

  const getOperationTypeBadge = (type: string) => {
    const typeMap = {
      received: { label: 'Alındı', class: 'bg-green-100 text-green-800', icon: Package },
      distributed: { label: 'Dağıtıldı', class: 'bg-blue-100 text-blue-800', icon: Truck },
      transferred: { label: 'Transfer', class: 'bg-purple-100 text-purple-800', icon: Warehouse },
      returned: { label: 'İade', class: 'bg-orange-100 text-orange-800', icon: ShoppingCart }
    }
    const typeInfo = typeMap[type as keyof typeof typeMap] || { label: type, class: 'bg-gray-100 text-gray-800', icon: Package }
    const Icon = typeInfo.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${typeInfo.class}`}>
        <Icon className="h-3 w-3" />
        {typeInfo.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      completed: { label: 'Tamamlandı', class: 'bg-green-100 text-green-800', icon: Check },
      cancelled: { label: 'İptal Edildi', class: 'bg-red-100 text-red-800', icon: X }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Check }
    const Icon = statusInfo.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.class}`}>
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const columns: Column<InKindOperation>[] = [
    {
      key: 'operation_type',
      header: 'İşlem Türü',
      render: (_, operation: InKindOperation) => getOperationTypeBadge(operation.operation_type)
    },
    {
      key: 'item_info',
      header: 'Ürün Bilgisi',
      render: (_, operation: InKindOperation) => (
        <div>
          <div className="font-medium">{operation.item_name}</div>
          <div className="text-sm text-muted-foreground">{operation.item_category}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Miktar',
      render: (_, operation: InKindOperation) => (
        <div>
          <div className="font-medium">{operation.quantity} {operation.unit}</div>
          {operation.unit_value && (
            <div className="text-sm text-muted-foreground">
              Birim: {formatCurrency(operation.unit_value)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'total_value',
      header: 'Toplam Değer',
      render: (_, operation: InKindOperation) => (
        <div className="font-medium text-green-600">
          {formatCurrency(operation.total_value)}
        </div>
      )
    },
    {
      key: 'beneficiaries',
      header: 'İhtiyaç Sahibi',
      render: (_, operation: InKindOperation) => (
        <div>
          {operation.beneficiaries ? (
            <>
              <div className="font-medium">{operation.beneficiaries.name} {operation.beneficiaries.surname}</div>
              <div className="text-sm text-muted-foreground">{operation.beneficiaries.category}</div>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      )
    },
    {
      key: 'warehouse_location',
      header: 'Depo Konumu',
      render: (_, operation: InKindOperation) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{operation.warehouse_location}</span>
        </div>
      )
    },
    {
      key: 'operation_date',
      header: 'İşlem Tarihi',
      render: (_, operation: InKindOperation) => formatDate(operation.operation_date)
    },
    {
      key: 'expiry_date',
      header: 'Son Kullanma',
      render: (_, operation: InKindOperation) => operation.expiry_date ? formatDate(operation.expiry_date) : '-'
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_, operation: InKindOperation) => getStatusBadge(operation.status)
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, operation: InKindOperation) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          {operation.status === 'pending' && (
            <button
              onClick={() => {
                setEditingOperation(operation)
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
          <h1 className="text-2xl font-bold">Ayni Yardım İşlemleri</h1>
          <p className="text-muted-foreground">Ayni yardım işlemlerini kaydedin ve takip edin</p>
        </div>
        <button
          onClick={() => {
            setEditingOperation(null)
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni İşlem
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* StatCard */}
        <div className="rounded border bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Alınan</p>
              <p className="text-2xl font-bold">{stats.totalReceived}</p>
            </div>
            <Package className="h-5 w-5 text-green-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Dağıtılan</p>
              <p className="text-2xl font-bold">{stats.totalDistributed}</p>
            </div>
            <Truck className="h-5 w-5 text-blue-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-purple-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mevcut Stok</p>
              <p className="text-2xl font-bold">{stats.currentStock}</p>
            </div>
            <Warehouse className="h-5 w-5 text-purple-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-orange-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bugünkü İşlemler</p>
              <p className="text-2xl font-bold">{stats.todayOperations}</p>
            </div>
            <Calendar className="h-5 w-5 text-orange-700" />
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="İşlem ara..."
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
          <option value="all">Tüm İşlem Türleri</option>
          <option value="received">Alınan</option>
          <option value="distributed">Dağıtılan</option>
          <option value="transferred">Transfer</option>
          <option value="returned">İade</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Kategoriler</option>
          {itemCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="completed">Tamamlanan</option>
          <option value="cancelled">İptal Edilen</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Tarihler</option>
          <option value="today">Bugün</option>
          <option value="week">Bu Hafta</option>
          <option value="month">Bu Ay</option>
        </select>

        <button
          onClick={() => {
            // exportToCsv('ayni-yardim-islemleri.csv', filteredOperations)
          }}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredOperations.length} işlem
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredOperations} />

      {/* İşlem Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingOperation ? 'İşlem Düzenle' : 'Yeni Ayni Yardım İşlemi'}
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
              <label className="block text-sm font-medium mb-1">İşlem Türü *</label>
              <select
                {...register('operation_type')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                <option value="received">Alındı</option>
                <option value="distributed">Dağıtıldı</option>
                <option value="transferred">Transfer</option>
                <option value="returned">İade</option>
              </select>
              {errors.operation_type && (
                <p className="text-sm text-red-600 mt-1">{errors.operation_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ürün Kategorisi *</label>
              <select
                {...register('item_category')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {itemCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.item_category && (
                <p className="text-sm text-red-600 mt-1">{errors.item_category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ürün Adı *</label>
            <input
              type="text"
              {...register('item_name')}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Ürün adını giriniz"
            />
            {errors.item_name && (
              <p className="text-sm text-red-600 mt-1">{errors.item_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Miktar *</label>
              <input
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Birim *</label>
              <select
                {...register('unit')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-sm text-red-600 mt-1">{errors.unit.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Birim Değer</label>
              <input
                type="number"
                step="0.01"
                {...register('unit_value', { valueAsNumber: true })}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          {(watchedOperationType === 'distributed' || watchedOperationType === 'transferred') && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {watchedOperationType === 'distributed' ? 'İhtiyaç Sahibi' : 'Hedef'}
              </label>
              {watchedOperationType === 'distributed' ? (
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
              ) : (
                <input
                  type="text"
                  {...register('destination')}
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Hedef konum"
                />
              )}
            </div>
          )}

          {watchedOperationType === 'received' && (
            <div>
              <label className="block text-sm font-medium mb-1">Kaynak</label>
              <input
                type="text"
                {...register('source')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Ürünün geldiği yer"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Depo Konumu *</label>
              <select
                {...register('warehouse_location')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">Seçiniz...</option>
                {warehouseLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              {errors.warehouse_location && (
                <p className="text-sm text-red-600 mt-1">{errors.warehouse_location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Son Kullanma Tarihi</label>
              <input
                type="date"
                {...register('expiry_date')}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="İşlem ile ilgili notlar..."
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
              {editingOperation ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
