import React, { useEffect, useState, useCallback } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { exportBeneficiariesToExcel } from '@utils/excelExport'
import { exportBeneficiariesToPDF } from '@utils/lazyPdfExport'
import { Link } from 'react-router-dom'
import { Modal } from '@components/Modal'
import LazyQRScannerModal from '@components/LazyQRScannerModal'
import { QrCode, FileSpreadsheet, FileText, Download, Filter } from 'lucide-react'
import { AdvancedSearchModal, SavedFilter } from '@components/AdvancedSearchModal'
import { toast } from 'sonner'
import { log } from '@/utils/logger'
import { supabase } from '@/lib/supabase'
import { 
  createBeneficiariesFilterConfig, 
  createBeneficiariesURLConfig, 
  createBeneficiariesSavedFiltersConfig, 
  getBeneficiariesQuickFilters 
} from '@utils/beneficiariesFilterConfig'

// type BeneficiaryRow = Database['public']['Tables']['beneficiaries']['Row'] // Removed - file deleted
type BeneficiaryRow = any // Mock type

interface FormData {
  name: string
  surname: string
  category: string
  nationality: string
  birth_date: string
  identity_no: string
  fund_region: string
  file_connection: string
  file_number: string
  phone: string
  email: string
  address: string
  city: string
  district: string
  status: string
  mernis_check: boolean
}

interface TempFormData {
  name: string
  surname: string
  identity_no: string
}

// Sıralı ID oluşturma fonksiyonu
const getNextSequentialId = async (): Promise<number> => {
  // const { data, error } = await supabase // Removed - file deleted
  //   .from('beneficiaries')
  //   .select('id')
  //   .order('id', { ascending: false })
  //   .limit(1)

  // if (error) {
  //   console.error('Error getting next ID:', error)
  //   return 1
  // }

  // return data && data.length > 0 ? data[0].id + 1 : 1
  return 1 // Mock return
}

export default function Beneficiaries() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [tempOpen, setTempOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<BeneficiaryRow[]>([])
  const [qrScannerOpen, setQrScannerOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Advanced search states
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  
  // Filter configurations
  const filterConfig = createBeneficiariesFilterConfig()
  const urlConfig = createBeneficiariesURLConfig()
  const savedFiltersConfig = createBeneficiariesSavedFiltersConfig()
  const quickFilters = getBeneficiariesQuickFilters()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    category: 'Yetim Ailesi',
    nationality: '',
    birth_date: '',
    identity_no: '',
    fund_region: 'Genel',
    file_connection: 'Doğrudan Başvuru',
    file_number: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    status: 'active',
    mernis_check: false
  })

  const [tempFormData, setTempFormData] = useState<TempFormData>({
    name: '',
    surname: '',
    identity_no: ''
  })

  const loadBeneficiaries = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('beneficiaries').select('*').order('created_at', { ascending: false })
    
    // Apply basic search filter
    const searchTerm = q.trim()
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,surname.ilike.%${searchTerm}%,identity_no.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,district.ilike.%${searchTerm}%`
      )
    }
    
    // Apply advanced filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value) && value.length > 0) {
          // Multi-select filter
          query = query.in(key, value)
        } else if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          // Number range filter
          if (value.min !== null) query = query.gte(key, value.min)
          if (value.max !== null) query = query.lte(key, value.max)
        } else if (typeof value === 'object' && value.start && value.end) {
          // Date range filter
          query = query.gte(key, value.start).lte(key, value.end)
        } else if (typeof value === 'string') {
          // Text filter
          if (key === 'name' || key === 'surname' || key === 'city' || key === 'district') {
            query = query.ilike(key, `%${value}%`)
          } else {
            query = query.eq(key, value)
          }
        } else {
          // Exact match
          query = query.eq(key, value)
        }
      }
    })
    
    const { data, error } = await query
    if (error) {
      log.warn('Beneficiaries fetch error:', error)
      toast.error('Veriler yüklenirken hata oluştu')
      setRows([])
    } else {
      setRows(data || [])
    }
    setLoading(false)
  }, [q, activeFilters])

  useEffect(() => {
    loadBeneficiaries()
  }, [loadBeneficiaries])

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      category: 'Yetim Ailesi',
      nationality: '',
      birth_date: '',
      identity_no: '',
      fund_region: 'Genel',
      file_connection: 'Doğrudan Başvuru',
      file_number: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      district: '',
      status: 'active',
      mernis_check: false
    })
    setEditingId(null)
  }

  const resetTempForm = () => {
    setTempFormData({
      name: '',
      surname: '',
      identity_no: ''
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.surname.trim() || !formData.identity_no.trim()) {
      toast.error('Ad, Soyad ve Kimlik No alanları zorunludur')
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        category: formData.category,
        nationality: formData.nationality.trim(),
        birth_date: formData.birth_date || null,
        identity_no: formData.identity_no.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        district: formData.district.trim() || null,
        status: formData.status,
        fund_region: formData.fund_region
      }

      let result
      if (editingId) {
        // Güncelleme işlemi
        result = await supabase
          .from('beneficiaries')
          .update(dataToSave)
          .eq('id', editingId)
          .select()
      } else {
        // Yeni kayıt işlemi - sıralı ID ile
        const nextId = await getNextSequentialId()
        const dataWithId = { ...dataToSave, id: nextId }
        result = await supabase
          .from('beneficiaries')
          .insert([dataWithId])
          .select()
      }

      const { error } = result

      if (error) {
        log.error('Save error:', error)
        toast.error('Kayıt sırasında hata oluştu: ' + error.message)
      } else {
        toast.success(editingId ? 'İhtiyaç sahibi başarıyla güncellendi' : 'İhtiyaç sahibi başarıyla kaydedildi')
        setOpen(false)
        resetForm()
        setEditingId(null)
        loadBeneficiaries()
      }
    } catch (error) {
      log.error('Save error:', error)
      toast.error('Kayıt sırasında beklenmeyen hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleQRScanSuccess = (scanData: { identity_no?: string; name?: string; surname?: string; birth_date?: string }) => {
    // QR kod tarama başarılı olduğunda kimlik bilgilerini form'a doldur
    if (scanData.identity_no) {
      setFormData(prev => ({
        ...prev,
        identity_no: scanData.identity_no || '',
        name: scanData.name || prev.name,
        surname: scanData.surname || prev.surname,
        birth_date: scanData.birth_date || prev.birth_date
      }))
      toast.success('Kimlik bilgileri QR koddan okundu')
    }
    setQrScannerOpen(false)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTempInputChange = (field: keyof TempFormData, value: string) => {
    setTempFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTempSave = async () => {
    if (!tempFormData.name.trim() || !tempFormData.surname.trim() || !tempFormData.identity_no.trim()) {
      toast.error('Ad, Soyad ve Kimlik No alanları zorunludur')
      return
    }

    setSaving(true)
    try {
      // Sıralı ID ile geçici kayıt oluştur
      const nextId = await getNextSequentialId()
      const { error } = await supabase
        .from('beneficiaries')
        .insert([{
          id: nextId,
          name: tempFormData.name.trim(),
          surname: tempFormData.surname.trim(),
          identity_no: tempFormData.identity_no.trim(),
          category: 'Yetim Ailesi',
          status: 'geçici',
          fund_region: 'Genel',
          file_connection: 'Doğrudan Başvuru'
        }])
        .select()

      if (error) {
        log.error('Temp save error:', error)
        toast.error('Geçici kayıt sırasında hata oluştu: ' + error.message)
      } else {
        toast.success('Geçici kayıt başarıyla oluşturuldu')
        setTempOpen(false)
        resetTempForm()
        loadBeneficiaries()
      }
    } catch (error) {
      log.error('Temp save error:', error)
      toast.error('Geçici kayıt sırasında beklenmeyen hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleCompleteTemp = (row: BeneficiaryRow) => {
    // Geçici kaydı tam kayda dönüştürmek için mevcut verileri forma yükle
    setFormData({
      name: row.name || '',
      surname: row.surname || '',
      category: row.category || 'Yetim Ailesi',
      nationality: row.nationality || '',
      birth_date: row.birth_date || '',
      identity_no: row.identity_no || '',
      fund_region: (row as any).fund_region || 'Genel',
      file_connection: (row as any).file_connection || 'Doğrudan Başvuru',
      file_number: (row as any).file_number || '',
      phone: row.phone || '',
      email: row.email || '',
      address: row.address || '',
      city: row.city || '',
      district: row.district || '',
      status: row.status || 'active',
      mernis_check: false
    })
    setEditingId(Number(row.id))
    setOpen(true)
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
    toast.success('Filtre yüklendi')
  }





  // Demo kayıt veri setleri - UUID'ler Supabase tarafından otomatik oluşturulacak
  const createDemoDataSets = () => {
    const currentTime = Date.now()
    
    return {
      normal: [
        {
          name: 'Ahmet',
          surname: 'Yılmaz',
          category: 'Yetim Ailesi',
          nationality: 'T.C.',
          birth_date: '1985-03-15',
          identity_no: `${currentTime}001`,
          phone: '0532 123 45 67',
          family_size: 4,
          status: 'active' as const
        },
        {
          name: 'Fatma',
          surname: 'Demir',
          category: 'Yaşlı',
          nationality: 'T.C.',
          birth_date: '1950-08-22',
          identity_no: `${currentTime}002`,
          phone: '0533 234 56 78',
          family_size: 2,
          status: 'active' as const
        },
        {
          name: 'Mehmet',
          surname: 'Kaya',
          category: 'Engelli',
          nationality: 'T.C.',
          birth_date: '1978-12-10',
          identity_no: `${currentTime}003`,
          phone: '0534 345 67 89',
          family_size: 3,
          status: 'active' as const
        }
      ],
      temporary: [
        {
          name: 'Ali',
          surname: 'Özkan',
          identity_no: `${currentTime}004`,
          category: 'Muhtaç Aile',
          family_size: 5,
          status: 'inactive' as const
        },
        {
          name: 'Ayşe',
          surname: 'Çelik',
          identity_no: `${currentTime}005`,
          category: 'Hasta',
          family_size: 1,
          status: 'inactive' as const
        }
      ]
    }
  }

  const testSupabaseConnection = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      log.info('Environment Variables:')
      log.info('VITE_SUPABASE_URL:', supabaseUrl)
      log.info('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set (hidden)' : 'Missing')

      if (!supabaseUrl || !supabaseKey) {
        toast.error('Supabase environment variables are missing')
        return
      }

      if (supabaseUrl.includes('your-project')) {
        toast.error('Supabase URL is still a placeholder - need real project URL')
        return
      }

      const { data, error } = await supabase.from('beneficiaries').select('count').limit(1)

      if (error) {
        log.error('Connection test error:', {
          message: error?.message || 'No message',
          code: error?.code || 'No code',
          details: error?.details || 'No details'
        })
        toast.error(`Connection failed: ${error?.message || 'Unknown error'}`)
      } else {
        log.info('Connection successful:', data)
        toast.success('Supabase connection successful!')
      }
    } catch (err) {
      log.error('Test error:', err)
      toast.error('Connection test failed')
    }
  }

  const handleCreateDemoRecords = async () => {
    setSaving(true)
    try {
      // Check environment variables first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      log.info('Supabase Config:', {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseKey ? 'Set' : 'Missing',
        urlValue: supabaseUrl?.includes('supabase.co') ? 'Valid' : 'Placeholder'
      })

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
        log.warn('Supabase not properly configured, using mock data')
        const demoDataSets = createDemoDataSets()
        const mockData = [...demoDataSets.normal, ...demoDataSets.temporary].map((item, index) => ({
          ...item,
          id: `mock-${Date.now()}-${index}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        setRows(prev => [...prev, ...mockData as any])
        toast.success(`${mockData.length} demo kayıt mock data olarak eklendi (Supabase yapılandırması eksik)`)
        return
      }

      // Test Supabase connection
      log.info('Testing Supabase connection...')
      const { error: testError } = await supabase
        .from('beneficiaries')
        .select('count')
        .limit(1)

      if (testError) {
        log.error('Supabase connection test failed:', {
          message: testError.message || 'No message',
          details: testError.details || 'No details',
          hint: testError.hint || 'No hint',
          code: testError.code || 'No code'
        })

        // Provide more specific error messages
        if (testError.code === 'PGRST116' || testError.message?.includes('relation "beneficiaries" does not exist')) {
          toast.error('Beneficiaries tablosu bulunamadı. Lütfen veritabanı migrasyonlarını çalıştırın.')
        } else if (testError.message?.includes('Invalid API key') || testError.message?.includes('JWT')) {
          toast.error('Geçersiz API key. Lütfen Supabase ayarlarını kontrol edin.')
        } else if (testError.message?.includes('permission denied')) {
          toast.error('Yetki hatası. Lütfen RLS politikalarını kontrol edin.')
        } else {
          toast.error(`Veritabanı bağlantısı hatası: ${testError.message || 'Bilinmeyen hata'}`)
        }
        return
      }

      log.info('Supabase connection successful, creating demo data...')

      // Demo veri setlerini oluştur
      const demoDataSets = createDemoDataSets()

      log.info('Demo data to insert:', demoDataSets)

      // Normal demo kayıtlar oluştur
      const { data: normalData, error: normalError } = await supabase
        .from('beneficiaries')
        .insert(demoDataSets.normal)
        .select()

      // Geçici demo kayıtları oluştur
      const { data: tempData, error: tempError } = await supabase
        .from('beneficiaries')
        .insert(demoDataSets.temporary)
        .select()

      if (normalError || tempError) {
        const errorDetails = normalError || tempError
        log.error('Demo records error - FULL ERROR OBJECT:', errorDetails)
        log.error('Demo records error - STRUCTURED:', {
          message: errorDetails?.message || 'No message',
          details: errorDetails?.details || 'No details',
          hint: errorDetails?.hint || 'No hint',
          code: errorDetails?.code || 'No code',
          errorType: typeof errorDetails
        })

        // Check if it's a table not found error
        if (errorDetails?.code === 'PGRST116' ||
            errorDetails?.message?.includes('relation "beneficiaries" does not exist')) {
          toast.error('Beneficiaries tablosu bulunamadı. Veritabanında tablolar oluşturulmamış.')
          log.warn('Beneficiaries table does not exist. Database migrations need to be run.')
          return
        }

        // Check if it's a Supabase configuration issue
        if (errorDetails?.message?.includes('Invalid API key') ||
            errorDetails?.message?.includes('not found') ||
            errorDetails?.code === 'PGRST202') {
          toast.error('Veritabanı yapılandırması eksik. Lütfen Supabase ayarlarını kontrol edin.')
          log.warn('Supabase appears to be misconfigured. Using mock data instead.')

          // Use mock data as fallback
          const mockData = [...demoDataSets.normal, ...demoDataSets.temporary].map((item, index) => ({
            ...item,
            id: `mock-${Date.now()}-${index}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))

          setRows(prev => [...prev, ...mockData as any])
          toast.success(`${mockData.length} demo kayıt mock data olarak eklendi`)
        } else {
          const errorMessage = errorDetails?.message || errorDetails?.details || JSON.stringify(errorDetails, null, 2) || 'Bilinmeyen hata'
          toast.error(`Demo kayıtlar oluşturulurken hata oluştu: ${errorMessage}`)
        }
      } else {
        const totalCreated = (normalData?.length || 0) + (tempData?.length || 0)
        toast.success(`${totalCreated} demo kayıt başarıyla oluşturuldu (${normalData?.length || 0} normal, ${tempData?.length || 0} geçici)`)
        loadBeneficiaries()
      }
    } catch (error) {
      log.error('Demo records error:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      })

      let errorMessage = 'Bilinmeyen hata'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error, null, 2)
      }

      toast.error(`Demo kayıtlar oluşturulurken beklenmeyen hata oluştu: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<BeneficiaryRow>[] = [
    { key: 'id', header: 'ID', render: (_, row, index) => <Link className="text-blue-600 underline" to={`/aid/beneficiaries/${row.id}`}>{(index || 0) + 1}</Link> },
    { key: 'name', header: 'Ad Soyad', render: (_, row) => <span>{row.name} {row.surname}</span> },
    { key: 'category', header: 'Kategori' },
    { key: 'nationality', header: 'Uyruk' },
    { key: 'identity_no', header: 'Kimlik No' },
    { key: 'phone', header: 'Cep Telefonu' },
    { key: 'city', header: 'Şehir' },
    { key: 'district', header: 'İlçe' },
    {
      key: 'status',
      header: 'Durum',
      render: (_value, row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.status === 'suspended'
            ? 'bg-orange-100 text-orange-800 border border-orange-200'
            : row.status === 'active'
            ? 'bg-green-100 text-green-800'
            : row.status === 'inactive'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status === 'suspended' ? '🔄 Geçici' : row.status === 'active' ? 'Aktif' : row.status === 'inactive' ? 'Pasif' : row.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_value, row) => (
        row.status === 'suspended' ? (
          <button
            onClick={() => handleCompleteTemp(row)}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            Tamamla
          </button>
        ) : null
      )
    }
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" placeholder="Ad, Soyad, Kimlik No, Telefon, Şehir, İlçe..." />
        <button className="rounded bg-green-600 px-3 py-1 text-sm text-white">Ara</button>
        <button 
          onClick={() => setAdvancedSearchOpen(true)}
          className={`rounded border px-3 py-1 text-sm flex items-center gap-1 ${
            Object.keys(activeFilters).length > 0 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'hover:bg-gray-50'
          }`}
        >
          <Filter className="w-3 h-3" />
          Gelişmiş Filtre
          {Object.keys(activeFilters).length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </button>
        {Object.keys(activeFilters).length > 0 && (
          <button 
            onClick={handleClearFilters}
            className="rounded bg-red-100 border border-red-300 text-red-700 px-3 py-1 text-sm hover:bg-red-200"
          >
            Filtreleri Temizle
          </button>
        )}
        <button onClick={() => setOpen(true)} className="rounded border px-3 py-1 text-sm">Ekle</button>
        <button onClick={() => setTempOpen(true)} className="rounded bg-orange-600 px-3 py-1 text-sm text-white">Geçici Kayıt</button>
        <button
          onClick={testSupabaseConnection}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
        >
          Test DB
        </button>
        <button
          onClick={handleCreateDemoRecords}
          disabled={saving}
          className="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Oluşturuluyor...' : 'Demo Kayıt'}
        </button>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              // exportToCsv('ihtiyac-sahipleri.csv', rows)
            }} 
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 flex items-center gap-1"
            title="CSV olarak indir"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button 
            onClick={() => exportBeneficiariesToExcel(rows, q.trim() ? { search: q.trim() } : undefined)} 
            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 flex items-center gap-1"
            title="Excel olarak indir"
          >
            <FileSpreadsheet className="w-3 h-3" />
            Excel
          </button>
          <button 
            onClick={() => exportBeneficiariesToPDF(rows, q.trim() ? { search: q.trim() } : undefined)} 
            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700 flex items-center gap-1"
            title="PDF olarak indir"
          >
            <FileText className="w-3 h-3" />
            PDF
          </button>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">{rows.length} Kayıt</div>
      </div>
      {loading ? (
        <div className="p-6 text-sm text-muted-foreground">Yükleniyor...</div>
      ) : (
        <DataTable columns={columns} data={rows} />
      )}

      <Modal isOpen={open} onClose={() => { setOpen(false); resetForm(); }} title={editingId ? "İhtiyaç Sahibi Bilgilerini Tamamla" : "Yeni İhtiyaç Sahibi"}>
        <div className="p-4 space-y-4">
          {/* QR Kod Tarama Butonu */}
          <div className="flex justify-center">
            <button
              onClick={() => setQrScannerOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <QrCode className="w-5 h-5" />
              Tarama
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kategori *">
              <select 
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="Yetim Ailesi">Yetim Ailesi</option>
                <option value="Muhtaç Aile">Muhtaç Aile</option>
                <option value="Yaşlı">Yaşlı</option>
                <option value="Engelli">Engelli</option>
                <option value="Hasta">Hasta</option>
              </select>
            </Field>
            
            <Field label="Ad *">
              <input 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="Ad"
              />
            </Field>
            
            <Field label="Soyad *">
              <input 
                value={formData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="Soyad"
              />
            </Field>
            
            <Field label="Uyruk">
              <input 
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="T.C. / Suriye / vb."
              />
            </Field>
            
            <Field label="Doğum Tarihi">
              <input 
                type="date" 
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className="w-full rounded border px-2 py-1" 
              />
            </Field>
            
            <div className="sm:col-span-2 grid grid-cols-[1fr_auto] items-center gap-2">
              <Field label="Kimlik No *">
                <input 
                  value={formData.identity_no}
                  onChange={(e) => handleInputChange('identity_no', e.target.value)}
                  className="w-full rounded border px-2 py-1" 
                  placeholder="11 haneli kimlik numarası"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm mt-5">
                <input 
                  type="checkbox" 
                  checked={formData.mernis_check}
                  onChange={(e) => handleInputChange('mernis_check', e.target.checked)}
                /> 
                Mernis Kontrolü Yap
              </label>
            </div>
            
            <Field label="Telefon">
              <input 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="0555 123 45 67"
              />
            </Field>
            

            

            

            
            <Field label="Fon Bölgesi">
              <select 
                value={formData.fund_region}
                onChange={(e) => handleInputChange('fund_region', e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="Genel">Genel</option>
                <option value="Özel">Özel</option>
                <option value="Acil">Acil</option>
              </select>
            </Field>
            
            <Field label="Dosya Bağlantısı">
              <select 
                value={formData.file_connection}
                onChange={(e) => handleInputChange('file_connection', e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="Partner Kurum">Partner Kurum</option>
                <option value="Doğrudan Başvuru">Doğrudan Başvuru</option>
                <option value="Sevk">Sevk</option>
              </select>
            </Field>
            
            <Field label="Dosya Numarası">
              <input 
                value={formData.file_number}
                onChange={(e) => handleInputChange('file_number', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="Dosya numarası"
              />
            </Field>
            
            <Field label="Durum">
              <select 
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full rounded border px-2 py-1"
              >
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
                <option value="beklemede">Beklemede</option>
              </select>
            </Field>
          </div>
          
          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              onClick={() => { setOpen(false); resetForm(); }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={saving}
            >
              İptal
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Geçici Kayıt Modal */}
      <Modal isOpen={tempOpen} onClose={() => { setTempOpen(false); resetTempForm(); }} title="Geçici Kayıt">
        <div className="p-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800">
              <strong>Geçici Kayıt:</strong> Sadece temel bilgiler alınır. Detaylar daha sonra tamamlanabilir.
            </p>
          </div>

          <div className="grid gap-3">
            <Field label="Ad *">
              <input 
                value={tempFormData.name}
                onChange={(e) => handleTempInputChange('name', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="Ad"
              />
            </Field>
            
            <Field label="Soyad *">
              <input 
                value={tempFormData.surname}
                onChange={(e) => handleTempInputChange('surname', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="Soyad"
              />
            </Field>
            
            <Field label="Kimlik No *">
              <input 
                value={tempFormData.identity_no}
                onChange={(e) => handleTempInputChange('identity_no', e.target.value)}
                className="w-full rounded border px-2 py-1" 
                placeholder="11 haneli kimlik numarası"
              />
            </Field>
          </div>
          
          {/* Butonlar */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              onClick={() => { setTempOpen(false); resetTempForm(); }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={saving}
            >
              İptal
            </button>
            <button 
              onClick={handleTempSave}
              disabled={saving}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : 'Geçici Kaydet'}
            </button>
          </div>
        </div>
      </Modal>

      {/* QR Scanner Modal */}
      <LazyQRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onApplyFilters={handleAdvancedSearch}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        pageType="beneficiaries"
        fields={filterConfig.fields}
        urlConfig={urlConfig}
        savedFiltersConfig={savedFiltersConfig}
        quickFilters={quickFilters}
        savedFilters={savedFilters}
        initialFilters={activeFilters}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      {children}
    </label>
  )
}
