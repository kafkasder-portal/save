import { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Download, 
  Eye, 
  Check, 
  X, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Wallet
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
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

interface CashAidRecord {
  id: string
  application_id?: string
  beneficiary_id: string
  aid_type: string
  amount: number
  status: 'approved' | 'distributed' | 'completed' | 'cancelled'
  approved_by: string
  approved_at: string
  distributed_at?: string
  distributed_by?: string
  notes?: string
  created_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
  }
  payments?: {
    id: string
    payment_method: 'cash' | 'bank_transfer' | 'check'
    amount: number
    status: string
    paid_at?: string
  }[]
}

interface CashStats {
  totalApproved: number
  totalDistributed: number
  pendingDistribution: number
  monthlyTotal: number
}

const distributionSchema = z.object({
  payment_method: z.enum(['cash', 'bank_transfer', 'check'], {
    message: 'Ödeme yöntemi seçiniz'
  }),
  bank_account: z.string().optional(),
  transaction_ref: z.string().optional(),
  notes: z.string().optional()
})

type DistributionFormData = z.infer<typeof distributionSchema>

export default function CashVault() {
  const [cashRecords, setCashRecords] = useState<CashAidRecord[]>([])
  const [stats, setStats] = useState<CashStats>({
    totalApproved: 0,
    totalDistributed: 0,
    pendingDistribution: 0,
    monthlyTotal: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showDistributionModal, setShowDistributionModal] = useState(false)
  const [distributingRecord, setDistributingRecord] = useState<CashAidRecord | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema)
  })

  const watchedPaymentMethod = watch('payment_method')

  useEffect(() => {
    loadCashRecords()
    loadStats()
  }, [])

  const loadCashRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('aid_records')
        .select(`
          *,
          beneficiaries (
            name,
            surname,
            phone,
            category
          ),
          payments (
            id,
            payment_method,
            amount,
            status,
            paid_at
          )
        `)
        .eq('aid_type', 'cash')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCashRecords(data || [])
    } catch (error) {
      log.error('Nakdi yardım kayıtları yüklenirken hata:', error)
      toast.error('Nakdi yardım kayıtları yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Toplam onaylanan tutar
      const { data: approvedData } = await supabase
        .from('aid_records')
        .select('amount')
        .eq('aid_type', 'cash')
        .eq('status', 'approved')

      const totalApproved = approvedData?.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) || 0

      // Toplam dağıtılan tutar
      const { data: distributedData } = await supabase
        .from('aid_records')
        .select('amount')
        .eq('aid_type', 'cash')
        .in('status', ['distributed', 'completed'])

      const totalDistributed = distributedData?.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) || 0

      // Dağıtım bekleyen tutar
      const pendingDistribution = totalApproved - totalDistributed

      // Bu ay toplam tutar
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: monthlyData } = await supabase
        .from('aid_records')
        .select('amount')
        .eq('aid_type', 'cash')
        .gte('created_at', `${currentMonth}-01`)

      const monthlyTotal = monthlyData?.reduce((sum: number, record: any) => sum + (record.amount || 0), 0) || 0

      setStats({
        totalApproved,
        totalDistributed,
        pendingDistribution,
        monthlyTotal
      })
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
    }
  }

  const filteredRecords = useMemo(() => {
    return cashRecords.filter(record => {
      const matchesSearch = searchQuery === '' || 
        `${record.beneficiaries?.name} ${record.beneficiaries?.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const recordDate = new Date(record.created_at)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today': {
            matchesDate = recordDate.toDateString() === now.toDateString()
            break
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = recordDate >= weekAgo
            break
          }
          case 'month': {
            matchesDate = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
            break
          }
          default:
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [cashRecords, searchQuery, statusFilter, dateFilter])

  const onDistribute = async (data: DistributionFormData) => {
    if (!distributingRecord) return

    try {
      // Ödeme kaydı oluştur
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          aid_record_id: distributingRecord.id,
          payment_method: data.payment_method,
          amount: distributingRecord.amount,
          bank_account: data.bank_account,
          transaction_ref: data.transaction_ref,
          status: 'completed',
          paid_at: new Date().toISOString(),
          notes: data.notes
        })

      if (paymentError) throw paymentError

      // Yardım kaydını güncelle
      const { error: recordError } = await supabase
        .from('aid_records')
        .update({
          status: 'distributed',
          distributed_at: new Date().toISOString()
        })
        .eq('id', distributingRecord.id)

      if (recordError) throw recordError

      toast.success('Nakdi yardım başarıyla dağıtıldı')
      setShowDistributionModal(false)
      setDistributingRecord(null)
      reset()
      loadCashRecords()
      loadStats()
    } catch (error) {
      log.error('Nakdi yardım dağıtılırken hata:', error)
      toast.error('Nakdi yardım dağıtılırken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      approved: { label: 'Onaylandı', class: 'bg-green-100 text-green-800', icon: Check },
      distributed: { label: 'Dağıtıldı', class: 'bg-blue-100 text-blue-800', icon: TrendingUp },
      completed: { label: 'Tamamlandı', class: 'bg-purple-100 text-purple-800', icon: Check },
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

  const getPaymentMethodName = (method: string) => {
    const methodMap: { [key: string]: string } = {
      cash: 'Nakit',
      bank_transfer: 'Banka Havalesi',
      check: 'Çek'
    }
    return methodMap[method] || method
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR')
  }

  const columns: Column<CashAidRecord>[] = [
    {
      key: 'beneficiaries',
      header: 'İhtiyaç Sahibi',
      render: (record) => (
        <div>
          <div className="font-medium">{record.beneficiaries?.name} {record.beneficiaries?.surname}</div>
          <div className="text-sm text-muted-foreground">{record.beneficiaries?.category}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (record) => (
        <div className="font-medium text-green-600">
          {formatCurrency(record.amount)}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (record) => getStatusBadge(record.status)
    },
    {
      key: 'approved_at',
      header: 'Onay Tarihi',
      render: (record) => formatDate(record.approved_at)
    },
    {
      key: 'distributed_at',
      header: 'Dağıtım Tarihi',
      render: (record) => record.distributed_at ? formatDate(record.distributed_at) : '-'
    },
    {
      key: 'payments',
      header: 'Ödeme Yöntemi',
      render: (record) => {
        const payment = record.payments?.[0]
        return payment ? getPaymentMethodName(payment.payment_method) : '-'
      }
    },
    {
      key: 'notes',
      header: 'Notlar',
      render: (record) => (
        <div className="max-w-xs truncate" title={record.notes}>
          {record.notes || '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (record) => (
        <div className="flex items-center gap-2">
          {record.status === 'approved' && (
            <button
              onClick={() => {
                setDistributingRecord(record)
                setShowDistributionModal(true)
              }}
              className="rounded p-1 text-blue-600 hover:bg-blue-50"
              title="Dağıt"
            >
              <DollarSign className="h-4 w-4" />
            </button>
          )}
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
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
          <h1 className="text-2xl font-bold">Nakdi Yardım Veznesi</h1>
          <p className="text-muted-foreground">Nakdi yardımları yönetin ve dağıtın</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Toplam Onaylanan</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalApproved)}</p>
            </div>
            <Check className="h-8 w-8 text-green-700" />
          </div>
        </div>
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Toplam Dağıtılan</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalDistributed)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-700" />
          </div>
        </div>
        <div className="bg-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Dağıtım Bekleyen</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.pendingDistribution)}</p>
            </div>
            <Wallet className="h-8 w-8 text-orange-700" />
          </div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Bu Ay Toplam</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.monthlyTotal)}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-700" />
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Kayıt ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="approved">Onaylanan</option>
          <option value="distributed">Dağıtılan</option>
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
          onClick={() => {/* exportToCsv('nakdi-yardim-kayitlari.csv', filteredRecords) */}}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredRecords.length} kayıt
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredRecords} />

      {/* Dağıtım Modal */}
      <Modal open={showDistributionModal} onClose={() => setShowDistributionModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Nakdi Yardım Dağıtımı</h2>
          <button
            onClick={() => setShowDistributionModal(false)}
            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>
        </div>
        
        {distributingRecord && (
          <div className="p-4 space-y-4">
            <div className="rounded border p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Yardım Detayları</h3>
              <div className="space-y-2 text-sm">
                <div><strong>İhtiyaç Sahibi:</strong> {distributingRecord.beneficiaries?.name} {distributingRecord.beneficiaries?.surname}</div>
                <div><strong>Kategori:</strong> {distributingRecord.beneficiaries?.category}</div>
                <div><strong>Tutar:</strong> {formatCurrency(distributingRecord.amount)}</div>
                <div><strong>Onay Tarihi:</strong> {formatDateTime(distributingRecord.approved_at)}</div>
                {distributingRecord.notes && (
                  <div><strong>Notlar:</strong> {distributingRecord.notes}</div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit(onDistribute)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ödeme Yöntemi *</label>
                <select
                  {...register('payment_method')}
                  className="w-full rounded border px-3 py-2 text-sm"
                >
                  <option value="">Seçiniz...</option>
                  <option value="cash">Nakit</option>
                  <option value="bank_transfer">Banka Havalesi</option>
                  <option value="check">Çek</option>
                </select>
                {errors.payment_method && (
                  <p className="text-sm text-red-600 mt-1">{errors.payment_method.message}</p>
                )}
              </div>

              {watchedPaymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Banka Hesap No</label>
                  <input
                    type="text"
                    {...register('bank_account')}
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
              )}

              {(watchedPaymentMethod === 'bank_transfer' || watchedPaymentMethod === 'check') && (
                <div>
                  <label className="block text-sm font-medium mb-1">İşlem Referansı</label>
                  <input
                    type="text"
                    {...register('transaction_ref')}
                    className="w-full rounded border px-3 py-2 text-sm"
                    placeholder="İşlem numarası veya referans kodu"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notlar</label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full rounded border px-3 py-2 text-sm"
                  placeholder="Dağıtım ile ilgili notlar..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDistributionModal(false)}
                  className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4" />
                  Dağıt
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
