import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Send, 
  Clock, 
  AlertCircle, 
  DollarSign
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

interface BankOrder {
  id: string
  aid_record_id: string
  beneficiary_id: string
  amount: number
  bank_name: string
  account_number: string
  account_holder: string
  iban: string
  status: 'pending' | 'sent' | 'completed' | 'failed' | 'cancelled'
  order_date: string
  sent_date?: string
  completed_date?: string
  transaction_ref?: string
  failure_reason?: string
  notes?: string
  created_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
  }
  aid_records?: {
    aid_type: string
    amount: number
    notes?: string
  }
}

interface BankOrderStats {
  totalPending: number
  totalSent: number
  totalCompleted: number
  totalAmount: number
}

const bankOrderSchema = z.object({
  beneficiary_id: z.string().min(1, 'İhtiyaç sahibi seçiniz'),
  aid_record_id: z.string().min(1, 'Yardım kaydı seçiniz'),
  amount: z.number().min(1, 'Tutar giriniz'),
  bank_name: z.string().min(1, 'Banka adı giriniz'),
  account_number: z.string().min(1, 'Hesap numarası giriniz'),
  account_holder: z.string().min(1, 'Hesap sahibi giriniz'),
  iban: z.string().min(26, 'Geçerli IBAN giriniz').max(34),
  notes: z.string().optional()
})

type BankOrderFormData = z.infer<typeof bankOrderSchema>

export default function BankOrders() {
  const [bankOrders, setBankOrders] = useState<BankOrder[]>([])
  const [stats, setStats] = useState<BankOrderStats>({
    totalPending: 0,
    totalSent: 0,
    totalCompleted: 0,
    totalAmount: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendingOrders, setSendingOrders] = useState<BankOrder[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Array<{id: string, name: string, surname: string, category: string}>>([])
  const [aidRecords, setAidRecords] = useState<Array<{id: string, aid_type: string, amount: number, notes?: string}>>([])

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<BankOrderFormData>({
    resolver: zodResolver(bankOrderSchema)
  })

  const watchedBeneficiaryId = watch('beneficiary_id')

  useEffect(() => {
    loadBankOrders()
    loadStats()
    loadBeneficiaries()
  }, [])

  useEffect(() => {
    if (watchedBeneficiaryId) {
      loadAidRecords(watchedBeneficiaryId)
    }
  }, [watchedBeneficiaryId])

  const loadBankOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          beneficiaries (
            name,
            surname,
            phone,
            category
          ),
          aid_records (
            aid_type,
            amount,
            notes
          )
        `)
        .eq('payment_method', 'bank_transfer')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBankOrders(data || [])
    } catch (error) {
      log.error('Banka emirleri yüklenirken hata:', error)
      toast.error('Banka emirleri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from('payments')
        .select('status, amount')
        .eq('payment_method', 'bank_transfer')

      if (data) {
        const totalPending = data.filter(p => p.status === 'pending').length
        const totalSent = data.filter(p => p.status === 'sent').length
        const totalCompleted = data.filter(p => p.status === 'completed').length
        const totalAmount = data.reduce((sum, p) => sum + (p.amount || 0), 0)

        setStats({ totalPending, totalSent, totalCompleted, totalAmount })
      }
    } catch (error) {
      log.error('İstatistikler yüklenirken hata:', error)
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

  const loadAidRecords = async (beneficiaryId: string) => {
    try {
      const { data, error } = await supabase
        .from('aid_records')
        .select('id, aid_type, amount, notes')
        .eq('beneficiary_id', beneficiaryId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAidRecords(data || [])
    } catch (error) {
      log.error('Yardım kayıtları yüklenirken hata:', error)
    }
  }

  const filteredOrders = useMemo(() => {
    return bankOrders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        `${order.beneficiaries?.name} ${order.beneficiaries?.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.account_holder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.order_date)
        const now = new Date()
        
        switch (dateFilter) {
          case 'today': {
            matchesDate = orderDate.toDateString() === now.toDateString()
            break
          }
          case 'week': {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = orderDate >= weekAgo
            break
          }
          case 'month': {
            matchesDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
            break
          }
          default:
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [bankOrders, searchQuery, statusFilter, dateFilter])

  const onSubmit = async (data: BankOrderFormData) => {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          aid_record_id: data.aid_record_id,
          beneficiary_id: data.beneficiary_id,
          payment_method: 'bank_transfer',
          amount: data.amount,
          bank_account: data.iban,
          bank_name: data.bank_name,
          account_number: data.account_number,
          account_holder: data.account_holder,
          status: 'pending',
          notes: data.notes
        })

      if (error) throw error

      toast.success('Banka ödeme emri başarıyla oluşturuldu')
      setShowAddModal(false)
      reset()
      loadBankOrders()
      loadStats()
    } catch (error) {
      log.error('Banka ödeme emri oluşturulurken hata:', error)
      toast.error('Banka ödeme emri oluşturulurken hata oluştu')
    }
  }

  const sendOrders = async () => {
    try {
      const orderIds = sendingOrders.map(order => order.id)
      
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString()
        })
        .in('id', orderIds)

      if (error) throw error

      toast.success(`${sendingOrders.length} adet banka ödeme emri gönderildi`)
      setShowSendModal(false)
      setSendingOrders([])
      loadBankOrders()
      loadStats()
    } catch (error) {
      log.error('Banka emirleri gönderilirken hata:', error)
      toast.error('Banka emirleri gönderilirken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      sent: { label: 'Gönderildi', class: 'bg-blue-100 text-blue-800', icon: Send },
      completed: { label: 'Tamamlandı', class: 'bg-green-100 text-green-800', icon: Check },
      failed: { label: 'Başarısız', class: 'bg-red-100 text-red-800', icon: X },
      cancelled: { label: 'İptal Edildi', class: 'bg-gray-100 text-gray-800', icon: X }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const formatIban = (iban: string) => {
    return iban.replace(/(.{4})/g, '$1 ').trim()
  }

  const pendingOrders = bankOrders.filter(order => order.status === 'pending')

  const columns: Column<BankOrder>[] = [
    {
      key: 'beneficiaries',
      header: 'İhtiyaç Sahibi',
      render: (_value, order) => (
        <div>
          <div className="font-medium">{order.beneficiaries?.name} {order.beneficiaries?.surname}</div>
          <div className="text-sm text-muted-foreground">{order.beneficiaries?.category}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (_value, order) => (
        <div className="font-medium text-green-600">
          {formatCurrency(order.amount)}
        </div>
      )
    },
    {
      key: 'bank_info',
      header: 'Banka Bilgileri',
      render: (_value, order) => (
        <div>
          <div className="font-medium">{order.bank_name}</div>
          <div className="text-sm text-muted-foreground">{order.account_holder}</div>
          <div className="text-xs text-muted-foreground">{formatIban(order.iban)}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, order) => getStatusBadge(order.status)
    },
    {
      key: 'order_date',
      header: 'Emir Tarihi',
      render: (_value, order) => formatDate(order.order_date)
    },
    {
      key: 'sent_date',
      header: 'Gönderim Tarihi',
      render: (_value, order) => order.sent_date ? formatDate(order.sent_date) : '-'
    },
    {
      key: 'transaction_ref',
      header: 'İşlem Ref.',
      render: (_value, order) => (
        <div className="max-w-xs truncate" title={order.transaction_ref}>
          {order.transaction_ref || '-'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, order) => (
        <div className="flex items-center gap-2">
          <button
            className="rounded p-1 text-gray-600 hover:bg-gray-50"
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          {order.status === 'pending' && (
            <button
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
          <h1 className="text-2xl font-bold">Banka Ödeme Emirleri</h1>
          <p className="text-muted-foreground">Banka havalesi ile yapılacak ödemeleri yönetin</p>
        </div>
        <div className="flex gap-2">
          {pendingOrders.length > 0 && (
            <button
              onClick={() => {
                setSendingOrders(pendingOrders)
                setShowSendModal(true)
              }}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Toplu Gönder ({pendingOrders.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Yeni Emir
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Bekleyen Emirler" 
          value={stats.totalPending.toString()} 
          icon={<Clock className="h-5 w-5 text-yellow-700" />} 
          accentClass="bg-yellow-100" 
        />
        <StatCard 
          title="Gönderilen Emirler" 
          value={stats.totalSent.toString()} 
          icon={<Send className="h-5 w-5 text-blue-700" />} 
          accentClass="bg-blue-100" 
        />
        <StatCard 
          title="Tamamlanan Emirler" 
          value={stats.totalCompleted.toString()} 
          icon={<Check className="h-5 w-5 text-green-700" />} 
          accentClass="bg-green-100" 
        />
        <StatCard 
          title="Toplam Tutar" 
          value={formatCurrency(stats.totalAmount)} 
          icon={<DollarSign className="h-5 w-5 text-purple-700" />} 
          accentClass="bg-purple-100" 
        />
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Emir ara..."
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
          <option value="pending">Bekleyen</option>
          <option value="sent">Gönderilen</option>
          <option value="completed">Tamamlanan</option>
          <option value="failed">Başarısız</option>
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
            // exportToCsv('banka-odeme-emirleri.csv', filteredOrders)
          }}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          İndir
        </button>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredOrders.length} emir
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredOrders} />

      {/* Yeni Emir Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Yeni Banka Ödeme Emri</h2>
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
              <label className="block text-sm font-medium mb-1">Yardım Kaydı *</label>
              <select
                {...register('aid_record_id')}
                className="w-full rounded border px-3 py-2 text-sm"
                disabled={!watchedBeneficiaryId}
              >
                <option value="">Seçiniz...</option>
                {aidRecords.map(record => (
                  <option key={record.id} value={record.id}>
                    {record.aid_type} - {formatCurrency(record.amount)}
                  </option>
                ))}
              </select>
              {errors.aid_record_id && (
                <p className="text-sm text-red-600 mt-1">{errors.aid_record_id.message}</p>
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
              <label className="block text-sm font-medium mb-1">Banka Adı *</label>
              <input
                type="text"
                {...register('bank_name')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Banka adı"
              />
              {errors.bank_name && (
                <p className="text-sm text-red-600 mt-1">{errors.bank_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hesap Sahibi *</label>
              <input
                type="text"
                {...register('account_holder')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Hesap sahibinin adı"
              />
              {errors.account_holder && (
                <p className="text-sm text-red-600 mt-1">{errors.account_holder.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hesap Numarası *</label>
              <input
                type="text"
                {...register('account_number')}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Hesap numarası"
              />
              {errors.account_number && (
                <p className="text-sm text-red-600 mt-1">{errors.account_number.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">IBAN *</label>
            <input
              type="text"
              {...register('iban')}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              maxLength={34}
            />
            {errors.iban && (
              <p className="text-sm text-red-600 mt-1">{errors.iban.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Ödeme emri ile ilgili notlar..."
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
              Oluştur
            </button>
          </div>
        </form>
      </Modal>

      {/* Toplu Gönderim Modal */}
      <Modal open={showSendModal} onClose={() => setShowSendModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Toplu Banka Ödeme Emri Gönderimi</h2>
          <button
            onClick={() => setShowSendModal(false)}
            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="rounded border p-4 bg-yellow-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Dikkat</h3>
            </div>
            <p className="text-sm text-yellow-700">
              {sendingOrders.length} adet banka ödeme emri gönderilecek. Bu işlem geri alınamaz.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">İhtiyaç Sahibi</th>
                  <th className="text-left p-2">Tutar</th>
                  <th className="text-left p-2">Banka</th>
                </tr>
              </thead>
              <tbody>
                {sendingOrders.map(order => (
                  <tr key={order.id} className="border-b">
                    <td className="p-2">
                      {order.beneficiaries?.name} {order.beneficiaries?.surname}
                    </td>
                    <td className="p-2">{formatCurrency(order.amount)}</td>
                    <td className="p-2">{order.bank_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowSendModal(false)}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={sendOrders}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              Gönder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
