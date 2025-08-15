import React, { useState, useMemo, FormEvent } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

interface SacrificePeriod {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  sacrificeDate: string
  isActive: boolean
  totalShares: number
  soldShares: number
  availableShares: number
  pricePerShare: number
  currency: 'TRY' | 'USD' | 'EUR'
  totalRevenue: number
  distributionAreas: string[]
  organizationCost: number
  netAmount: number
  status: 'hazırlık' | 'satış' | 'tamamlandı' | 'dağıtım' | 'kapandı'
  description?: string
  responsiblePerson: string
  createdDate: string
  createdBy: string
  notes?: string
}

interface SacrificeShare {
  id: string
  periodId: string
  shareNumber: string
  donorName: string
  donorPhone: string
  donorEmail?: string
  shareCount: number
  totalAmount: number
  paymentStatus: 'beklemede' | 'ödendi' | 'kısmi' | 'iptal'
  paymentDate?: string
  paymentMethod?: string
  distributionArea: string
  onBehalfOf?: string
  notes?: string
  createdDate: string
}

const mockSacrificePeriods: SacrificePeriod[] = [
  {
    id: '1',
    name: 'Kurban Bayramı 2024',
    year: 2024,
    startDate: '2024-03-01',
    endDate: '2024-06-15',
    sacrificeDate: '2024-06-16',
    isActive: true,
    totalShares: 1000,
    soldShares: 750,
    availableShares: 250,
    pricePerShare: 2500,
    currency: 'TRY',
    totalRevenue: 1875000,
    distributionAreas: ['Türkiye', 'Suriye', 'Somali', 'Bangladeş'],
    organizationCost: 125000,
    netAmount: 1750000,
    status: 'satış',
    description: '2024 yılı Kurban Bayramı organizasyonu',
    responsiblePerson: 'Ali Demir',
    createdDate: '2024-01-15',
    createdBy: 'Admin',
    notes: 'Dört farklı ülkede kurban kesimi yapılacak'
  },
  {
    id: '2',
    name: 'Kurban Bayramı 2023',
    year: 2023,
    startDate: '2023-03-01',
    endDate: '2023-06-27',
    sacrificeDate: '2023-06-28',
    isActive: false,
    totalShares: 800,
    soldShares: 800,
    availableShares: 0,
    pricePerShare: 2200,
    currency: 'TRY',
    totalRevenue: 1760000,
    distributionAreas: ['Türkiye', 'Suriye', 'Yemen'],
    organizationCost: 110000,
    netAmount: 1650000,
    status: 'kapandı',
    description: '2023 yılı Kurban Bayramı organizasyonu',
    responsiblePerson: 'Ali Demir',
    createdDate: '2023-01-10',
    createdBy: 'Admin',
    notes: 'Başarıyla tamamlandı'
  },
  {
    id: '3',
    name: 'Akika Kurbanları 2024',
    year: 2024,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    sacrificeDate: '2024-12-31',
    isActive: true,
    totalShares: 200,
    soldShares: 45,
    availableShares: 155,
    pricePerShare: 1800,
    currency: 'TRY',
    totalRevenue: 81000,
    distributionAreas: ['Türkiye'],
    organizationCost: 8000,
    netAmount: 73000,
    status: 'satış',
    description: 'Yıl boyunca akika kurbanları',
    responsiblePerson: 'Fatma Şahin',
    createdDate: '2024-01-01',
    createdBy: 'Admin'
  }
]

const mockSacrificeShares: SacrificeShare[] = [
  {
    id: '1',
    periodId: '1',
    shareNumber: 'KB2024-001',
    donorName: 'Ahmet Yılmaz',
    donorPhone: '+90 532 123 4567',
    donorEmail: 'ahmet.yilmaz@email.com',
    shareCount: 2,
    totalAmount: 5000,
    paymentStatus: 'ödendi',
    paymentDate: '2024-03-15',
    paymentMethod: 'Kredi Kartı',
    distributionArea: 'Suriye',
    onBehalfOf: 'Rahmetli babası adına',
    createdDate: '2024-03-15'
  },
  {
    id: '2',
    periodId: '1',
    shareNumber: 'KB2024-002',
    donorName: 'Zeynep Kaya',
    donorPhone: '+90 533 987 6543',
    shareCount: 1,
    totalAmount: 2500,
    paymentStatus: 'beklemede',
    distributionArea: 'Türkiye',
    createdDate: '2024-03-20'
  }
]

export default function SacrificePeriods() {
  const [sacrificePeriods, setSacrificePeriods] = useState<SacrificePeriod[]>(mockSacrificePeriods)
  const [sacrificeShares, setSacrificeShares] = useState<SacrificeShare[]>(mockSacrificeShares)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<SacrificePeriod | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<SacrificePeriod | null>(null)
  const [activeTab, setActiveTab] = useState<'periods' | 'shares'>('periods')
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    sacrificeDate: '',
    totalShares: '',
    pricePerShare: '',
    currency: 'TRY' as SacrificePeriod['currency'],
    distributionAreas: [] as string[],
    organizationCost: '',
    description: '',
    responsiblePerson: '',
    notes: ''
  })
  const [shareFormData, setShareFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    shareCount: '',
    distributionArea: '',
    onBehalfOf: '',
    notes: ''
  })

  const filteredPeriods = useMemo(() => {
    return sacrificePeriods.filter(period => {
      const matchesQuery = JSON.stringify(period).toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !statusFilter || period.status === statusFilter
      const matchesYear = !yearFilter || period.year.toString() === yearFilter
      
      return matchesQuery && matchesStatus && matchesYear
    })
  }, [sacrificePeriods, query, statusFilter, yearFilter])

  const filteredShares = useMemo(() => {
    return sacrificeShares.filter(share => 
      selectedPeriod ? share.periodId === selectedPeriod.id : true
    )
  }, [sacrificeShares, selectedPeriod])

  const totalRevenue = filteredPeriods.reduce((sum, period) => sum + period.totalRevenue, 0)
  const totalShares = filteredPeriods.reduce((sum, period) => sum + period.soldShares, 0)
  const activePeriods = filteredPeriods.filter(period => period.isActive).length

  const periodColumns: Column<SacrificePeriod>[] = [
    { key: 'name', header: 'Dönem Adı' },
    { key: 'year', header: 'Yıl' },
    { key: 'sacrificeDate', header: 'Kurban Tarihi' },
    {
      key: 'soldShares',
      header: 'Satılan/Toplam',
      render: (_, p: SacrificePeriod) => `${p.soldShares}/${p.totalShares}`,
    },
    {
      key: 'pricePerShare',
      header: 'Hisse Fiyatı',
      render: (_, p: SacrificePeriod) => `${p.pricePerShare.toLocaleString('tr-TR')} ${p.currency}`,
    },
    {
      key: 'totalRevenue',
      header: 'Toplam Gelir',
      render: (_, p: SacrificePeriod) => `${p.totalRevenue.toLocaleString('tr-TR')} ${p.currency}`,
    },
    {
      key: 'status',
      header: 'Durum',
      render: (_, p: SacrificePeriod) => {
        const statusMap: Record<
          SacrificePeriod['status'],
          { label: string; className: string }
        > = {
          'hazırlık': { label: 'hazırlık', className: 'bg-gray-100 text-gray-800' },
          'satış': { label: 'satış', className: 'bg-blue-100 text-blue-800' },
          'tamamlandı': { label: 'tamamlandı', className: 'bg-green-100 text-green-800' },
          'dağıtım': { label: 'dağıtım', className: 'bg-yellow-100 text-yellow-800' },
          'kapandı': { label: 'kapandı', className: 'bg-red-100 text-red-800' },
        }
        const status = statusMap[p.status]
        return (
          <span className={`px-2 py-1 rounded text-xs ${status.className}`}>
            {status.label}
          </span>
        )
      },
    },
    { key: 'responsiblePerson', header: 'Sorumlu' },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, p: SacrificePeriod) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewShares(p)}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            Hisseler
          </button>
          <button
            onClick={() => handleEdit(p)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleToggleStatus(p.id)}
            className={`text-sm ${
              p.isActive
                ? 'text-red-600 hover:text-red-800'
                : 'text-green-600 hover:text-green-800'
            }`}
          >
            {p.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </button>
        </div>
      ),
    },
  ]

  const shareColumns: Column<SacrificeShare>[] = [
    { key: 'shareNumber', header: 'Hisse No' },
    { key: 'donorName', header: 'Bağışçı' },
    { key: 'donorPhone', header: 'Telefon' },
    { key: 'shareCount', header: 'Hisse Sayısı' },
    {
      key: 'totalAmount',
      header: 'Tutar',
      render: (_, s: SacrificeShare) => `${s.totalAmount.toLocaleString('tr-TR')} ₺`,
    },
    {
      key: 'paymentStatus',
      header: 'Ödeme Durumu',
      render: (_, s: SacrificeShare) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            s.paymentStatus === 'ödendi'
              ? 'bg-green-100 text-green-800'
              : s.paymentStatus === 'beklemede'
              ? 'bg-yellow-100 text-yellow-800'
              : s.paymentStatus === 'kısmi'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {s.paymentStatus}
        </span>
      ),
    },
    { key: 'distributionArea', header: 'Dağıtım Alanı' },
    { key: 'onBehalfOf', header: 'Adına' },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, s: SacrificeShare) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditShare(s)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleDeleteShare(s.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Sil
          </button>
        </div>
      ),
    },
  ]

  const handleEdit = (period: SacrificePeriod) => {
    setEditingPeriod(period)
    setFormData({
      name: period.name,
      year: period.year,
      startDate: period.startDate,
      endDate: period.endDate,
      sacrificeDate: period.sacrificeDate,
      totalShares: period.totalShares.toString(),
      pricePerShare: period.pricePerShare.toString(),
      currency: period.currency,
      distributionAreas: period.distributionAreas,
      organizationCost: period.organizationCost.toString(),
      description: period.description || '',
      responsiblePerson: period.responsiblePerson,
      notes: period.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleViewShares = (period: SacrificePeriod) => {
    setSelectedPeriod(period)
    setActiveTab('shares')
  }

  const handleToggleStatus = (id: string) => {
    setSacrificePeriods(sacrificePeriods.map(period => 
      period.id === id 
        ? { ...period, isActive: !period.isActive }
        : period
    ))
  }

  const handleEditShare = (share: SacrificeShare) => {
    setShareFormData({
      donorName: share.donorName,
      donorPhone: share.donorPhone,
      donorEmail: share.donorEmail || '',
      shareCount: share.shareCount.toString(),
      distributionArea: share.distributionArea,
      onBehalfOf: share.onBehalfOf || '',
      notes: share.notes || ''
    })
    setIsShareModalOpen(true)
  }

  const handleDeleteShare = (id: string) => {
    if (confirm('Bu hisseyi silmek istediğinizden emin misiniz?')) {
      setSacrificeShares(sacrificeShares.filter(share => share.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const totalShares = parseInt(formData.totalShares)
    const pricePerShare = parseFloat(formData.pricePerShare)
    const organizationCost = parseFloat(formData.organizationCost)
    
    if (editingPeriod) {
      // Güncelleme
      setSacrificePeriods(sacrificePeriods.map(period => 
        period.id === editingPeriod.id 
          ? { 
              ...period, 
              ...formData,
              totalShares,
              pricePerShare,
              organizationCost,
              availableShares: totalShares - period.soldShares,
              totalRevenue: period.soldShares * pricePerShare,
              netAmount: (period.soldShares * pricePerShare) - organizationCost
            }
          : period
      ))
    } else {
      // Yeni ekleme
      const newPeriod: SacrificePeriod = {
        id: Date.now().toString(),
        ...formData,
        totalShares,
        pricePerShare,
        organizationCost,
        soldShares: 0,
        availableShares: totalShares,
        totalRevenue: 0,
        netAmount: -organizationCost,
        isActive: true,
        status: 'hazırlık',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin' // Bu gerçek uygulamada oturum açan kullanıcıdan gelecek
      }
      setSacrificePeriods([...sacrificePeriods, newPeriod])
    }
    
    setIsModalOpen(false)
    setEditingPeriod(null)
    resetForm()
  }

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPeriod) return
    
    const shareCount = parseInt(shareFormData.shareCount)
    const totalAmount = shareCount * selectedPeriod.pricePerShare
    const shareNumber = `KB${selectedPeriod.year}-${(sacrificeShares.length + 1).toString().padStart(3, '0')}`
    
    const newShare: SacrificeShare = {
      id: Date.now().toString(),
      periodId: selectedPeriod.id,
      shareNumber,
      ...shareFormData,
      shareCount,
      totalAmount,
      paymentStatus: 'beklemede',
      createdDate: new Date().toISOString().split('T')[0]
    }
    
    setSacrificeShares([...sacrificeShares, newShare])
    
    // Dönem bilgilerini güncelle
    setSacrificePeriods(sacrificePeriods.map(period => 
      period.id === selectedPeriod.id 
        ? { 
            ...period, 
            soldShares: period.soldShares + shareCount,
            availableShares: period.availableShares - shareCount,
            totalRevenue: period.totalRevenue + totalAmount,
            netAmount: period.totalRevenue + totalAmount - period.organizationCost
          }
        : period
    ))
    
    setIsShareModalOpen(false)
    resetShareForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      sacrificeDate: '',
      totalShares: '',
      pricePerShare: '',
      currency: 'TRY',
      distributionAreas: [],
      organizationCost: '',
      description: '',
      responsiblePerson: '',
      notes: ''
    })
  }

  const resetShareForm = () => {
    setShareFormData({
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      shareCount: '',
      distributionArea: '',
      onBehalfOf: '',
      notes: ''
    })
  }

  const openAddModal = () => {
    setEditingPeriod(null)
    resetForm()
    setIsModalOpen(true)
  }

  const openAddShareModal = () => {
    resetShareForm()
    setIsShareModalOpen(true)
  }

  const handleDistributionAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        distributionAreas: [...formData.distributionAreas, area]
      })
    } else {
      setFormData({
        ...formData,
        distributionAreas: formData.distributionAreas.filter(a => a !== area)
      })
    }
  }

  const distributionAreas = ['Türkiye', 'Suriye', 'Yemen', 'Somali', 'Bangladeş', 'Filistin', 'Afganistan', 'Pakistan']
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i + 5)

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Kurban Dönemleri</h2>
            <div className="flex border rounded">
              <button
                onClick={() => setActiveTab('periods')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'periods' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Dönemler
              </button>
              <button
                onClick={() => setActiveTab('shares')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'shares' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hisseler {selectedPeriod && `(${selectedPeriod.name})`}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {activeTab === 'shares' && selectedPeriod && (
              <button
                onClick={openAddShareModal}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Yeni Hisse
              </button>
            )}
            {activeTab === 'periods' && (
              <button
                onClick={openAddModal}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yeni Dönem
              </button>
            )}
          </div>
        </div>

        {activeTab === 'periods' && (
          <>
            {/* Özet Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Toplam Dönem</h3>
                <p className="text-2xl font-bold text-blue-900">{filteredPeriods.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Aktif Dönem</h3>
                <p className="text-2xl font-bold text-green-900">{activePeriods}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Toplam Hisse</h3>
                <p className="text-2xl font-bold text-purple-900">{totalShares}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600">Toplam Gelir</h3>
                <p className="text-2xl font-bold text-orange-900">{totalRevenue.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="flex items-center gap-4 mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder="Dönem adı, sorumlu ile ara..."
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Durumlar</option>
                <option value="hazırlık">Hazırlık</option>
                <option value="satış">Satış</option>
                <option value="tamamlandı">Tamamlandı</option>
                <option value="dağıtım">Dağıtım</option>
                <option value="kapandı">Kapandı</option>
              </select>
              <select 
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Yıllar</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  // exportToCsv('kurban-donemleri.csv', filteredPeriods)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Excel İndir
              </button>
            </div>

            <DataTable columns={periodColumns} data={filteredPeriods} />
          </>
        )}

        {activeTab === 'shares' && (
          <>
            {selectedPeriod ? (
              <>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">{selectedPeriod.name}</h3>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Toplam Hisse:</span>
                      <span className="ml-2 font-medium">{selectedPeriod.totalShares}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Satılan:</span>
                      <span className="ml-2 font-medium">{selectedPeriod.soldShares}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kalan:</span>
                      <span className="ml-2 font-medium">{selectedPeriod.availableShares}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hisse Fiyatı:</span>
                      <span className="ml-2 font-medium">{selectedPeriod.pricePerShare.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                </div>
                <DataTable columns={shareColumns} data={filteredShares} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Hisseleri görüntülemek için bir dönem seçin</p>
                <button
                  onClick={() => setActiveTab('periods')}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Dönemler sekmesine git
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dönem Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPeriod ? 'Kurban Dönemi Düzenle' : 'Yeni Kurban Dönemi'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dönem Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Kurban Bayramı 2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yıl *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-full border rounded px-3 py-2"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş Tarihi *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kurban Tarihi *</label>
              <input
                type="date"
                value={formData.sacrificeDate}
                onChange={(e) => setFormData({...formData, sacrificeDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Toplam Hisse *</label>
              <input
                type="number"
                value={formData.totalShares}
                onChange={(e) => setFormData({...formData, totalShares: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hisse Fiyatı *</label>
              <input
                type="number"
                step="0.01"
                value={formData.pricePerShare}
                onChange={(e) => setFormData({...formData, pricePerShare: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as SacrificePeriod['currency']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Organizasyon Maliyeti</label>
              <input
                type="number"
                step="0.01"
                value={formData.organizationCost}
                onChange={(e) => setFormData({...formData, organizationCost: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sorumlu Kişi *</label>
              <input
                type="text"
                value={formData.responsiblePerson}
                onChange={(e) => setFormData({...formData, responsiblePerson: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Dağıtım Alanları</label>
            <div className="grid grid-cols-4 gap-2">
              {distributionAreas.map((area) => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.distributionAreas.includes(area)}
                    onChange={(e) => handleDistributionAreaChange(area, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Dönem hakkında açıklama..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Ek notlar..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingPeriod ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Hisse Ekleme Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Yeni Kurban Hissesi"
      >
        <form onSubmit={handleShareSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bağışçı Adı *</label>
              <input
                type="text"
                value={shareFormData.donorName}
                onChange={(e) => setShareFormData({...shareFormData, donorName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input
                type="tel"
                value={shareFormData.donorPhone}
                onChange={(e) => setShareFormData({...shareFormData, donorPhone: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={shareFormData.donorEmail}
              onChange={(e) => setShareFormData({...shareFormData, donorEmail: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hisse Sayısı *</label>
              <input
                type="number"
                min="1"
                value={shareFormData.shareCount}
                onChange={(e) => setShareFormData({...shareFormData, shareCount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Toplam Tutar</label>
              <input
                type="text"
                value={selectedPeriod && shareFormData.shareCount ? 
                  `${(parseInt(shareFormData.shareCount) * selectedPeriod.pricePerShare).toLocaleString('tr-TR')} ₺` : 
                  '0 ₺'
                }
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Dağıtım Alanı *</label>
            <select
              value={shareFormData.distributionArea}
              onChange={(e) => setShareFormData({...shareFormData, distributionArea: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seçiniz</option>
              {selectedPeriod?.distributionAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Adına (Opsiyonel)</label>
            <input
              type="text"
              value={shareFormData.onBehalfOf}
              onChange={(e) => setShareFormData({...shareFormData, onBehalfOf: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Rahmetli babası adına"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={shareFormData.notes}
              onChange={(e) => setShareFormData({...shareFormData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Ek bilgiler..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Hisse Ekle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
