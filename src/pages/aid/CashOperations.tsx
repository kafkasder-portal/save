import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  Receipt,
  Clock
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

interface CashOperation {
  id: string
  operation_type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  category: string
  reference_number?: string
  from_account?: string
  to_account?: string
  operator_id: string
  operation_date: string
  status: 'pending' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  operator?: {
    name: string
    email: string
  }
}

interface CashStats {
  totalIncome: number
  totalExpense: number
  balance: number
  todayOperations: number
}

const operationSchema = z.object({
  operation_type: z.enum(['income', 'expense', 'transfer'], {
    message: 'İşlem türü seçiniz'
  }),
  amount: z.number().min(0.01, 'Geçerli bir tutar giriniz'),
  description: z.string().min(1, 'Açıklama giriniz'),
  category: z.string().min(1, 'Kategori seçiniz'),
  reference_number: z.string().optional(),
  from_account: z.string().optional(),
  to_account: z.string().optional(),
  notes: z.string().optional()
})

type OperationFormData = z.infer<typeof operationSchema>

const categories = {
  income: [
    'Bağış Geliri',
    'Faiz Geliri',
    'Kira Geliri',
    'Diğer Gelirler'
  ],
  expense: [
    'Nakdi Yardım',
    'Personel Gideri',
    'Kira Gideri',
    'Elektrik-Su',
    'Telefon-İnternet',
    'Kırtasiye',
    'Diğer Giderler'
  ],
  transfer: [
    'Hesap Arası Transfer',
    'Banka Transfer',
    'Kasa Transfer'
  ]
}

export default function CashOperations() {
  const [operations, setOperations] = useState<CashOperation[]>([])
  const [stats, setStats] = useState<CashStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    todayOperations: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOperation, setEditingOperation] = useState<CashOperation | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema)
  })

  const watchedOperationType = watch('operation_type')

  useEffect(() => {
    loadOperations()
    loadStats()
  }, [])

  const loadOperations = async () => {
    try {
      // Gerçek uygulamada cash_operations tablosu olacak
      // Şimdilik mock data kullanıyoruz
      const mockOperations: CashOperation[] = [
        {
          id: '1',
          operation_type: 'income',
          amount: 50000,
          description: 'Aylık bağış geliri',
          category: 'Bağış Geliri',
          reference_number: 'REF001',
          operator_id: 'user1',
          operation_date: new Date().toISOString(),
          status: 'completed',
          created_at: new Date().toISOString(),
          operator: { name: 'Admin User', email: 'admin@example.com' }
        },
        {
          id: '2',
          operation_type: 'expense',
          amount: 15000,
          description: 'Nakdi yardım ödemesi',
          category: 'Nakdi Yardım',
          reference_number: 'REF002',
          operator_id: 'user1',
          operation_date: new Date().toISOString(),
          status: 'completed',
          created_at: new Date().toISOString(),
          operator: { name: 'Admin User', email: 'admin@example.com' }
        }
      ]
      
      setOperations(mockOperations)
    } catch (error) {
      log.error('Nakdi işlemler yüklenirken hata:', error)
      toast.error('Nakdi işlemler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats
      setStats({
        totalIncome: 150000,
        totalExpense: 85000,
        balance: 65000,
        todayOperations: 5
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const filteredOperations = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch = searchQuery === '' || 
        operation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        operation.reference_number?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === 'all' || operation.operation_type === typeFilter
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

      return matchesSearch && matchesType && matchesStatus && matchesDate
    })
  }, [operations, searchQuery, typeFilter, statusFilter, dateFilter])

  const onSubmit = async (data: OperationFormData) => {
    try {
      // Gerçek uygulamada Supabase'e kayıt yapılacak
      const newOperation: CashOperation = {
        id: Date.now().toString(),
        ...data,
        operator_id: 'current_user',
        operation_date: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
        operator: { name: 'Current User', email: 'user@example.com' }
      }

      setOperations(prev => [newOperation, ...prev])
      toast.success('Nakdi işlem başarıyla kaydedildi')
      setShowAddModal(false)
      reset()
      loadStats()
    } catch (error) {
      log.error('Nakdi işlem kaydedilirken hata:', error)
      toast.error('Nakdi işlem kaydedilirken hata oluştu')
    }
  }

  const getOperationTypeBadge = (type: string) => {
    const typeMap = {
      income: { label: 'Gelir', class: 'bg-green-100 text-green-800', icon: TrendingUp },
      expense: { label: 'Gider', class: 'bg-red-100 text-red-800', icon: TrendingDown },
      transfer: { label: 'Transfer', class: 'bg-blue-100 text-blue-800', icon: CreditCard }
    }
    const typeInfo = typeMap[type as keyof typeof typeMap] || { label: type, class: 'bg-gray-100 text-gray-800', icon: Receipt }
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

  const columns: Column<CashOperation>[] = [
    {
      key: 'operation_type',
      header: 'İşlem Türü',
      render: (operation) => getOperationTypeBadge(operation.operation_type)
    },
    {
      key: 'description',
      header: 'Açıklama',
      render: (operation) => (
        <div>
          <div className="font-medium">{operation.description}</div>
          <div className="text-sm text-muted-foreground">{operation.category}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (operation) => (
        <div className={`font-medium ${
          operation.operation_type === 'income' ? 'text-green-600' : 
          operation.operation_type === 'expense' ? 'text-red-600' : 'text-blue-600'
        }`}>
          {operation.operation_type === 'income' ? '+' : operation.operation_type === 'expense' ? '-' : ''}
          {formatCurrency(operation.amount)}
        </div>
      )
    },
    {
      key: 'reference_number',
      header: 'Referans No',
      render: (operation) => operation.reference_number || '-'
    },
    {
      key: 'operation_date',
      header: 'İşlem Tarihi',
      render: (operation) => formatDate(operation.operation_date)
    },
    {
      key: 'status',
      header: 'Durum',
      render: (operation) => getStatusBadge(operation.status)
    },
    {
      key: 'operator',
      header: 'İşlem Yapan',
      render: (operation) => operation.operator?.name || '-'
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (operation) => (
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
          <h1 className="text-2xl font-bold">Nakdi Yardım İşlemleri</h1>
          <p className="text-muted-foreground">Nakdi işlemleri kaydedin ve takip edin</p>
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
        <StatCard 
          title="Toplam Gelir" 
          value={formatCurrency(stats.totalIncome)} 
          icon={<TrendingUp className="h-5 w-5 text-green-700" />} 
          accentClass="bg-green-100" 
        />
        <StatCard 
          title="Toplam Gider" 
          value={formatCurrency(stats.totalExpense)} 
          icon={<TrendingDown className="h-5 w-5 text-red-700" />} 
          accentClass="bg-red-100" 
        />
        <StatCard 
          title="Bakiye" 
          value={formatCurrency(stats.balance)} 
          icon={<Calculator className="h-5 w-5 text-blue-700" />} 
          accentClass="bg-blue-100" 
        />
        <StatCard 
          title="Bugünkü İşlemler" 
          value={stats.todayOperations.toString()} 
          icon={<Calendar className="h-5 w-5 text-purple-700" />} 
          accentClass="bg-purple-100" 
        />
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
          <option value="all">Tüm Türler</option>
          <option value="income">Gelir</option>
          <option value="expense">Gider</option>
          <option value="transfer">Transfer</option>
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
            // exportToCsv('nakdi-islemler.csv', filteredOperations)
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
            {editingOperation ? 'İşlem Düzenle' : 'Yeni Nakdi İşlem'}
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
                <option value="income">Gelir</option>
                <option value="expense">Gider</option>
                <option value="transfer">Transfer</option>
              </select>
              {errors.operation_type && (
                <p className="text-sm text-red-600 mt-1">{errors.operation_type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategori *</label>
              <select
                {...register('category')}
                className="w-full rounded border px-3 py-2 text-sm"
                disabled={!watchedOperationType}
              >
                <option value="">Seçiniz...</option>
                {watchedOperationType && categories[watchedOperationType]?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tutar *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Referans Numarası</label>
              <input
                type="text"
                {...register('reference_number')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="REF001"
              />
            </div>
          </div>

          {watchedOperationType === 'transfer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kaynak Hesap</label>
                <input
                  type="text"
                  {...register('from_account')}
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Kaynak hesap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hedef Hesap</label>
                <input
                  type="text"
                  {...register('to_account')}
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Hedef hesap"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Açıklama *</label>
            <input
              type="text"
              {...register('description')}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="İşlem açıklaması"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
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
