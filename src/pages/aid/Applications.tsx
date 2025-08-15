import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  Edit, 
  Check, 
  X, 
  Clock,
  FileSpreadsheet,
  FileText,
  Filter
} from 'lucide-react'
import { supabase } from '@lib/supabase'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { exportApplicationsToExcel } from '../../utils/excelExport'
import { exportApplicationsToPDF } from '../../utils/lazyPdfExport'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { AdvancedSearchModal } from '../../components/AdvancedSearchModal'
import {
  createApplicationsFilterConfig,
  applicationsURLConfig,
  getApplicationsQuickFilters
} from '@utils/applicationsFilterConfig'
import type { SavedFilter } from '../../components/AdvancedSearchModal'
import { log } from '@/utils/logger'

interface Application {
  id: string
  beneficiary_id: string
  aid_type: 'cash' | 'in_kind' | 'service' | 'medical'
  amount?: number
  description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  evaluated_by?: string
  evaluated_at?: string
  evaluation_notes?: string
  created_at: string
  updated_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
  }
}

interface Beneficiary {
  id: string
  name: string
  surname: string
  category: string
}

const applicationSchema = z.object({
  beneficiary_id: z.string().min(1, 'İhtiyaç sahibi seçiniz'),
  aid_type: z.enum(['cash', 'in_kind', 'service', 'medical'], {
    message: 'Yardım türü seçiniz'
  }),
  amount: z.number().optional(),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  priority: z.enum(['low', 'normal', 'high', 'urgent'])
})

type ApplicationFormData = z.infer<typeof applicationSchema>

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [aidTypeFilter, setAidTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluatingApplication, setEvaluatingApplication] = useState<Application | null>(null)
  
  // Advanced search states
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  
  // Filter configurations
  const filterConfig = useMemo(() => createApplicationsFilterConfig(), [])
  const urlConfig = useMemo(() => applicationsURLConfig, [])
  const savedFiltersConfig = useMemo(() => ({ storageKey: 'applications_saved_filters', maxSavedFilters: 10 }), [])
  const quickFilters = useMemo(() => getApplicationsQuickFilters(), [])

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema)
  })

  const watchedAidType = watch('aid_type')

  useEffect(() => {
    loadApplications()
    loadBeneficiaries()
  }, [])

  useEffect(() => {
    loadApplications()
  }, [searchQuery, activeFilters])

  const loadApplications = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('applications')
        .select(`
          *,
          beneficiaries (
            id,
            name,
            surname,
            category
          )
        `)

      // Apply basic search
      if (searchQuery) {
        query = query.or(`description.ilike.%${searchQuery}%,beneficiaries.name.ilike.%${searchQuery}%,beneficiaries.surname.ilike.%${searchQuery}%`)
      }

      // Apply advanced filters
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return

        switch (key) {
          case 'beneficiary_name':
            if (typeof value === 'string' && value.trim()) {
              query = query.or(`beneficiaries.name.ilike.%${value}%,beneficiaries.surname.ilike.%${value}%`)
            }
            break
          case 'status':
            if (Array.isArray(value) && value.length > 0) {
              query = query.in('status', value)
            }
            break
          case 'priority':
            if (Array.isArray(value) && value.length > 0) {
              query = query.in('priority', value)
            }
            break
          case 'aid_type':
            if (Array.isArray(value) && value.length > 0) {
              query = query.in('aid_type', value)
            }
            break
          case 'amount_range':
            if (value.min !== undefined && value.min !== '') {
              query = query.gte('amount', value.min)
            }
            if (value.max !== undefined && value.max !== '') {
              query = query.lte('amount', value.max)
            }
            break
          case 'beneficiary_category':
            if (Array.isArray(value) && value.length > 0) {
              query = query.in('beneficiaries.category', value)
            }
            break
          case 'created_date_range':
            if (value.start) {
              query = query.gte('created_at', value.start)
            }
            if (value.end) {
              query = query.lte('created_at', value.end)
            }
            break
          case 'evaluated_date_range':
            if (value.start) {
              query = query.gte('evaluated_at', value.start)
            }
            if (value.end) {
              query = query.lte('evaluated_at', value.end)
            }
            break
          case 'evaluated_by':
            if (typeof value === 'string' && value.trim()) {
              query = query.ilike('evaluated_by', `%${value}%`)
            }
            break
          case 'has_evaluation_notes':
            if (value === 'yes') {
              query = query.not('evaluation_notes', 'is', null)
            } else if (value === 'no') {
              query = query.is('evaluation_notes', null)
            }
            break
        }
      })

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      log.error('Error loading applications:', error)
      toast.error('Başvurular yüklenirken hata oluştu')
    } finally {
      setLoading(false)
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

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = searchQuery === '' || 
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${app.beneficiaries?.name} ${app.beneficiaries?.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter
      const matchesAidType = aidTypeFilter === 'all' || app.aid_type === aidTypeFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesAidType
    })
  }, [applications, searchQuery, statusFilter, priorityFilter, aidTypeFilter])

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      if (editingApplication) {
        const { error } = await supabase
          .from('applications')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingApplication.id)

        if (error) throw error
        toast.success('Başvuru güncellendi')
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([data])

        if (error) throw error
        toast.success('Başvuru oluşturuldu')
      }

      setShowModal(false)
      setEditingApplication(null)
      reset()
      loadApplications()
    } catch (error) {
      log.error('Başvuru kaydedilirken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
      toast.error('Başvuru kaydedilirken hata oluştu')
    }
  }

  const handleEvaluate = async (applicationId: string, status: 'approved' | 'rejected', notes: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          evaluation_notes: notes,
          evaluated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error
      
      toast.success(`Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`)
      setShowEvaluationModal(false)
      setEvaluatingApplication(null)
      loadApplications()
    } catch (error) {
      log.error('Başvuru değerlendirilirken hata:', {
        message: error instanceof Error ? error.message : String(error)
      })
      toast.error('Başvuru değerlendirilirken hata oluştu')
    }
  }

  // Advanced search handlers
  const handleAdvancedSearch = (filters: Record<string, any>) => {
    setActiveFilters(filters)
    setAdvancedSearchOpen(false)
  }

  const handleClearFilters = () => {
    setActiveFilters({})
  }

  const handleSaveFilter = (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFilter: SavedFilter = {
      ...filter,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setSavedFilters(prev => [...prev, newFilter])
    toast.success('Filtre kaydedildi')
  }

  const handleLoadFilter = (filter: SavedFilter) => {
    setActiveFilters(filter.filters)
    setAdvancedSearchOpen(false)
    toast.success('Filtre yüklendi')
  }



  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Onaylandı', class: 'bg-green-100 text-green-800', icon: Check },
      rejected: { label: 'Reddedildi', class: 'bg-red-100 text-red-800', icon: X },
      completed: { label: 'Tamamlandı', class: 'bg-blue-100 text-blue-800', icon: Check }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Clock }
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
      normal: { label: 'Normal', class: 'bg-blue-100 text-blue-800' },
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

  const getAidTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      cash: 'Nakdi Yardım',
      in_kind: 'Ayni Yardım',
      service: 'Hizmet Yardımı',
      medical: 'Sağlık Yardımı'
    }
    return typeMap[type] || type
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const columns: Column<Application>[] = [
    {
      key: 'beneficiaries',
      header: 'İhtiyaç Sahibi',
      render: (_value, app) => (
        <div>
          <div className="font-medium">{app.beneficiaries?.name} {app.beneficiaries?.surname}</div>
          <div className="text-sm text-muted-foreground">{app.beneficiaries?.category}</div>
        </div>
      )
    },
    {
      key: 'aid_type',
      header: 'Yardım Türü',
      render: (_value, app) => getAidTypeName(app.aid_type)
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (_value, app) => formatCurrency(app.amount)
    },
    {
      key: 'description',
      header: 'A��ıklama',
      render: (_value, app) => (
        <div className="max-w-xs truncate" title={app.description}>
          {app.description}
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Öncelik',
      render: (_value, app) => getPriorityBadge(app.priority)
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, app) => getStatusBadge(app.status)
    },
    {
      key: 'created_at',
      header: 'Tarih',
      render: (_value, app) => formatDate(app.created_at)
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, app) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingApplication(app)
              setValue('beneficiary_id', app.beneficiary_id)
              setValue('aid_type', app.aid_type)
              setValue('amount', app.amount)
              setValue('description', app.description)
              setValue('priority', app.priority)
              setShowModal(true)
            }}
            className="rounded p-1 text-blue-600 hover:bg-blue-50"
            title="Düzenle"
          >
            <Edit className="h-4 w-4" />
          </button>
          {app.status === 'pending' && (
            <button
              onClick={() => {
                setEvaluatingApplication(app)
                setShowEvaluationModal(true)
              }}
              className="rounded p-1 text-green-600 hover:bg-green-50"
              title="Değerlendir"
            >
              <Eye className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold">Yardım Başvuruları</h1>
          <p className="text-muted-foreground">Yardım başvurularını yönetin ve değerlendirin</p>
        </div>
        <button
          onClick={() => {
            setEditingApplication(null)
            reset()
            setShowModal(true)
          }}
          className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Yeni Başvuru
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Başvuru ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={() => setAdvancedSearchOpen(true)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              Object.keys(activeFilters).length > 0
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Gelişmiş Filtre
            {Object.keys(activeFilters).length > 0 && (
              <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {Object.keys(activeFilters).length}
              </span>
            )}
          </button>
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Filtreleri Temizle
            </button>
          )}
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekleyen</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
          <option value="completed">Tamamlanan</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Öncelikler</option>
          <option value="low">Düşük</option>
          <option value="normal">Normal</option>
          <option value="high">Yüksek</option>
          <option value="urgent">Acil</option>
        </select>

        <select
          value={aidTypeFilter}
          onChange={(e) => setAidTypeFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="all">Tüm Türler</option>
          <option value="cash">Nakdi Yardım</option>
          <option value="in_kind">Ayni Yardım</option>
          <option value="service">Hizmet Yardımı</option>
          <option value="medical">Sağlık Yardımı</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              // exportToCsv('yardim-basvurulari.csv', filteredApplications)
            }}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            title="CSV olarak indir"
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
          <button
            onClick={() => {
              const filters = {
                search: searchQuery.trim() || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                aidType: aidTypeFilter !== 'all' ? aidTypeFilter : undefined
              }
              exportApplicationsToExcel(filteredApplications, Object.values(filters).some(v => v) ? filters : undefined)
            }}
            className="flex items-center gap-1 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            title="Excel olarak indir"
          >
            <FileSpreadsheet className="h-3 w-3" />
            Excel
          </button>
          <button
            onClick={async () => {
              const filters = {
                search: searchQuery.trim() || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                aidType: aidTypeFilter !== 'all' ? aidTypeFilter : undefined
              }
              await exportApplicationsToPDF(filteredApplications, Object.values(filters).some(v => v) ? filters : undefined)
            }}
            className="flex items-center gap-1 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            title="PDF olarak indir"
          >
            <FileText className="h-3 w-3" />
            PDF
          </button>
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredApplications.length} başvuru
        </div>
      </div>

      {/* Tablo */}
      <DataTable columns={columns} data={filteredApplications} />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onApplyFilters={handleAdvancedSearch}

        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        fields={filterConfig.fields}
        pageType="applications"
        urlConfig={urlConfig}
        savedFiltersConfig={savedFiltersConfig}
        quickFilters={quickFilters}
        initialFilters={activeFilters}
        savedFilters={savedFilters}
      />

      {/* Başvuru Ekleme/Düzenleme Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">
            {editingApplication ? 'Başvuru Düzenle' : 'Yeni Başvuru'}
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
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
            <label className="block text-sm font-medium mb-1">Yardım Türü *</label>
            <select
              {...register('aid_type')}
              className="w-full rounded border px-3 py-2 text-sm"
            >
              <option value="">Seçiniz...</option>
              <option value="cash">Nakdi Yardım</option>
              <option value="in_kind">Ayni Yardım</option>
              <option value="service">Hizmet Yardımı</option>
              <option value="medical">Sağlık Yardımı</option>
            </select>
            {errors.aid_type && (
              <p className="text-sm text-red-600 mt-1">{errors.aid_type.message}</p>
            )}
          </div>

          {watchedAidType === 'cash' && (
            <div>
              <label className="block text-sm font-medium mb-1">Tutar (TL)</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Açıklama *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Başvuru detayların�� açıklayın..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Öncelik</label>
            <select
              {...register('priority')}
              className="w-full rounded border px-3 py-2 text-sm"
              defaultValue="normal"
            >
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              {editingApplication ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Değerlendirme Modal */}
      <Modal open={showEvaluationModal} onClose={() => setShowEvaluationModal(false)}>
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Başvuru Değerlendirme</h2>
          <button
            onClick={() => setShowEvaluationModal(false)}
            className="h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            ×
          </button>
        </div>
        
        {evaluatingApplication && (
          <div className="p-4 space-y-4">
            <div className="rounded border p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Başvuru Detayları</h3>
              <div className="space-y-2 text-sm">
                <div><strong>İhtiyaç Sahibi:</strong> {evaluatingApplication.beneficiaries?.name} {evaluatingApplication.beneficiaries?.surname}</div>
                <div><strong>Yardım Türü:</strong> {getAidTypeName(evaluatingApplication.aid_type)}</div>
                {evaluatingApplication.amount && (
                  <div><strong>Tutar:</strong> {formatCurrency(evaluatingApplication.amount)}</div>
                )}
                <div><strong>Açıklama:</strong> {evaluatingApplication.description}</div>
                <div><strong>Öncelik:</strong> {getPriorityBadge(evaluatingApplication.priority)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Değerlendirme Notları</label>
              <textarea
                id="evaluation-notes"
                rows={4}
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Değerlendirme notlarınızı yazın..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('evaluation-notes') as HTMLTextAreaElement)?.value || ''
                  handleEvaluate(evaluatingApplication.id, 'rejected', notes)
                }}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
                Reddet
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('evaluation-notes') as HTMLTextAreaElement)?.value || ''
                  handleEvaluate(evaluatingApplication.id, 'approved', notes)
                }}
                className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                Onayla
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
