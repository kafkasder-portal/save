import React, { useState, useMemo, FormEvent } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { log } from '@/utils/logger'

interface SacrificeShare {
  id: string
  shareNumber: string
  periodName: string
  periodYear: number
  donorName: string
  donorPhone: string
  donorEmail?: string
  donorAddress?: string
  shareCount: number
  pricePerShare: number
  totalAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  paymentStatus: 'beklemede' | 'ödendi' | 'kısmi' | 'iptal' | 'iade'
  paymentDate?: string
  paymentMethod?: string
  paymentReference?: string
  distributionArea: string
  distributionStatus: 'beklemede' | 'hazırlanıyor' | 'gönderildi' | 'teslim edildi' | 'iptal'
  distributionDate?: string
  onBehalfOf?: string
  isRecurring: boolean
  recurringFrequency?: 'aylık' | 'yıllık'
  nextPaymentDate?: string
  donorType: 'bireysel' | 'kurumsal'
  taxNumber?: string
  receiptNumber?: string
  receiptIssued: boolean
  thankYouSent: boolean
  notes?: string
  tags: string[]
  createdDate: string
  createdBy: string
  lastModified: string
  modifiedBy: string
}

// Note: SharePayment type is not currently used in the UI. Removed to satisfy lints.

const mockSacrificeShares: SacrificeShare[] = [
  {
    id: '1',
    shareNumber: 'KB2024-001',
    periodName: 'Kurban Bayramı 2024',
    periodYear: 2024,
    donorName: 'Ahmet Yılmaz',
    donorPhone: '+90 532 123 4567',
    donorEmail: 'ahmet.yilmaz@email.com',
    donorAddress: 'Kadıköy, İstanbul',
    shareCount: 2,
    pricePerShare: 2500,
    totalAmount: 5000,
    currency: 'TRY',
    paymentStatus: 'ödendi',
    paymentDate: '2024-03-15',
    paymentMethod: 'Kredi Kartı',
    paymentReference: 'CC-2024-001',
    distributionArea: 'Suriye',
    distributionStatus: 'hazırlanıyor',
    onBehalfOf: 'Rahmetli babası adına',
    isRecurring: false,
    donorType: 'bireysel',
    receiptNumber: 'KB-2024-001',
    receiptIssued: true,
    thankYouSent: true,
    tags: ['vip', 'tekrarlayan'],
    createdDate: '2024-03-15',
    createdBy: 'Admin',
    lastModified: '2024-03-15',
    modifiedBy: 'Admin'
  },
  {
    id: '2',
    shareNumber: 'KB2024-002',
    periodName: 'Kurban Bayramı 2024',
    periodYear: 2024,
    donorName: 'Zeynep Kaya',
    donorPhone: '+90 533 987 6543',
    donorEmail: 'zeynep.kaya@email.com',
    shareCount: 1,
    pricePerShare: 2500,
    totalAmount: 2500,
    currency: 'TRY',
    paymentStatus: 'beklemede',
    distributionArea: 'Türkiye',
    distributionStatus: 'beklemede',
    isRecurring: true,
    recurringFrequency: 'yıllık',
    nextPaymentDate: '2025-03-01',
    donorType: 'bireysel',
    receiptIssued: false,
    thankYouSent: false,
    tags: ['yeni'],
    createdDate: '2024-03-20',
    createdBy: 'Admin',
    lastModified: '2024-03-20',
    modifiedBy: 'Admin'
  },
  {
    id: '3',
    shareNumber: 'KB2024-003',
    periodName: 'Kurban Bayramı 2024',
    periodYear: 2024,
    donorName: 'ABC Şirketi',
    donorPhone: '+90 212 555 0123',
    donorEmail: 'info@abcsirket.com',
    shareCount: 10,
    pricePerShare: 2500,
    totalAmount: 25000,
    currency: 'TRY',
    paymentStatus: 'ödendi',
    paymentDate: '2024-03-10',
    paymentMethod: 'Havale',
    paymentReference: 'HV-2024-001',
    distributionArea: 'Somali',
    distributionStatus: 'gönderildi',
    distributionDate: '2024-06-16',
    donorType: 'kurumsal',
    taxNumber: '1234567890',
    receiptNumber: 'KB-2024-003',
    receiptIssued: true,
    thankYouSent: true,
    tags: ['kurumsal', 'büyük'],
    createdDate: '2024-03-10',
    createdBy: 'Admin',
    lastModified: '2024-06-16',
    modifiedBy: 'Admin',
    isRecurring: false
  },
  {
    id: '4',
    shareNumber: 'AK2024-001',
    periodName: 'Akika Kurbanları 2024',
    periodYear: 2024,
    donorName: 'Mehmet Özkan',
    donorPhone: '+90 534 111 2233',
    donorEmail: 'mehmet.ozkan@email.com',
    shareCount: 1,
    pricePerShare: 1800,
    totalAmount: 1800,
    currency: 'TRY',
    paymentStatus: 'ödendi',
    paymentDate: '2024-02-15',
    paymentMethod: 'Nakit',
    distributionArea: 'Türkiye',
    distributionStatus: 'teslim edildi',
    distributionDate: '2024-02-20',
    onBehalfOf: 'Yeni doğan oğlu adına',
    isRecurring: false,
    donorType: 'bireysel',
    receiptNumber: 'AK-2024-001',
    receiptIssued: true,
    thankYouSent: true,
    tags: ['akika'],
    createdDate: '2024-02-15',
    createdBy: 'Admin',
    lastModified: '2024-02-20',
    modifiedBy: 'Admin'
  }
]

  

export default function SacrificeShares() {
  const [sacrificeShares, setSacrificeShares] = useState<SacrificeShare[]>(mockSacrificeShares)
  // Removed unused sharePayments state to satisfy linter
  const [query, setQuery] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [distributionStatusFilter, setDistributionStatusFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [donorTypeFilter, setDonorTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [editingShare, setEditingShare] = useState<SacrificeShare | null>(null)
  const [selectedShare, setSelectedShare] = useState<SacrificeShare | null>(null)
  const [activeTab, setActiveTab] = useState<'shares' | 'analytics'>('shares')
  const [formData, setFormData] = useState({
    shareNumber: '',
    periodName: '',
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    donorAddress: '',
    shareCount: '',
    pricePerShare: '',
    currency: 'TRY' as SacrificeShare['currency'],
    distributionArea: '',
    onBehalfOf: '',
    donorType: 'bireysel' as SacrificeShare['donorType'],
    taxNumber: '',
    isRecurring: false,
    recurringFrequency: 'yıllık' as SacrificeShare['recurringFrequency'],
    notes: '',
    tags: [] as string[]
  })

  const filteredShares = useMemo(() => {
    return sacrificeShares.filter(share => {
      const matchesQuery = JSON.stringify(share).toLowerCase().includes(query.toLowerCase())
      const matchesPaymentStatus = !paymentStatusFilter || share.paymentStatus === paymentStatusFilter
      const matchesDistributionStatus = !distributionStatusFilter || share.distributionStatus === distributionStatusFilter
      const matchesPeriod = !periodFilter || share.periodName.includes(periodFilter)
      const matchesDonorType = !donorTypeFilter || share.donorType === donorTypeFilter
      
      let matchesDateRange = true
      if (dateRange.start && dateRange.end) {
        const shareDate = new Date(share.createdDate)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        matchesDateRange = shareDate >= startDate && shareDate <= endDate
      }
      
      return matchesQuery && matchesPaymentStatus && matchesDistributionStatus && 
             matchesPeriod && matchesDonorType && matchesDateRange
    })
  }, [sacrificeShares, query, paymentStatusFilter, distributionStatusFilter, periodFilter, donorTypeFilter, dateRange])

  // Analytics hesaplamaları
  const totalShares = filteredShares.reduce((sum, share) => sum + share.shareCount, 0)
  const totalAmount = filteredShares.reduce((sum, share) => sum + share.totalAmount, 0)
  const paidAmount = filteredShares
    .filter(share => share.paymentStatus === 'ödendi')
    .reduce((sum, share) => sum + share.totalAmount, 0)
  const pendingAmount = filteredShares
    .filter(share => share.paymentStatus === 'beklemede')
    .reduce((sum, share) => sum + share.totalAmount, 0)
  const recurringShares = filteredShares.filter(share => share.isRecurring).length
  const receiptIssued = filteredShares.filter(share => share.receiptIssued).length
  const thankYouSent = filteredShares.filter(share => share.thankYouSent).length

  // Dağıtım alanlarına göre gruplandırma
  const distributionAreaStats = filteredShares.reduce((acc, share) => {
    const area = share.distributionArea
    if (!acc[area]) {
      acc[area] = { count: 0, amount: 0 }
    }
    acc[area].count += share.shareCount
    acc[area].amount += share.totalAmount
    return acc
  }, {} as Record<string, { count: number; amount: number }>)

  const columns: Column<SacrificeShare>[] = [
    { key: 'shareNumber', header: 'Hisse No' },
    { key: 'periodName', header: 'Dönem' },
    { key: 'donorName', header: 'Bağışçı' },
    { key: 'donorPhone', header: 'Telefon' },
    { 
      key: 'shareCount', 
      header: 'Hisse',
      render: (_, row) => (
        <div>
          <div>{row.shareCount} adet</div>
          <div className="text-xs text-gray-500">{row.pricePerShare.toLocaleString('tr-TR')} ₺/adet</div>
        </div>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Toplam Tutar',
      render: (_, row) => `${row.totalAmount.toLocaleString('tr-TR')} ${row.currency}`
    },
    { 
      key: 'paymentStatus', 
      header: 'Ödeme Durumu',
      render: (_, row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.paymentStatus === 'ödendi' ? 'bg-green-100 text-green-800' :
          row.paymentStatus === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
          row.paymentStatus === 'kısmi' ? 'bg-orange-100 text-orange-800' :
          row.paymentStatus === 'iade' ? 'bg-purple-100 text-purple-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.paymentStatus}
        </span>
      )
    },
    { 
      key: 'distributionStatus', 
      header: 'Dağıtım Durumu',
      render: (_, row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.distributionStatus === 'teslim edildi' ? 'bg-green-100 text-green-800' :
          row.distributionStatus === 'gönderildi' ? 'bg-blue-100 text-blue-800' :
          row.distributionStatus === 'hazırlanıyor' ? 'bg-yellow-100 text-yellow-800' :
          row.distributionStatus === 'beklemede' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.distributionStatus}
        </span>
      )
    },
    { key: 'distributionArea', header: 'Dağıtım Alanı' },
    { 
      key: 'isRecurring', 
      header: 'Tekrarlayan',
      render: (_, row) => (
        <div>
          {row.isRecurring ? (
            <div>
              <span className="text-green-600">✓</span>
              <div className="text-xs text-gray-500">{row.recurringFrequency}</div>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    { 
      key: 'receiptIssued', 
      header: 'Makbuz',
      render: (_, row) => (
        <div className="text-center">
          {row.receiptIssued ? (
            <div>
              <span className="text-green-600">✓</span>
              <div className="text-xs text-gray-500">{row.receiptNumber}</div>
            </div>
          ) : (
            <span className="text-red-600">✗</span>
          )}
        </div>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, row) => (
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
          >
            Düzenle
          </button>
          <button
            onClick={() => handlePayment(row)}
            className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
          >
            Ödeme
          </button>
          <button
            onClick={() => handleReceipt(row)}
            className="text-purple-600 hover:text-purple-800 px-2 py-1 rounded"
          >
            Makbuz
          </button>
          <button
            onClick={() => handleSendThankYou(row.id)}
            className="text-orange-600 hover:text-orange-800 px-2 py-1 rounded"
          >
            Teşekkür
          </button>
        </div>
      )
    }
  ]

  const handleEdit = (share: SacrificeShare) => {
    setEditingShare(share)
    setFormData({
      shareNumber: share.shareNumber,
      periodName: share.periodName,
      donorName: share.donorName,
      donorPhone: share.donorPhone,
      donorEmail: share.donorEmail || '',
      donorAddress: share.donorAddress || '',
      shareCount: share.shareCount.toString(),
      pricePerShare: share.pricePerShare.toString(),
      currency: share.currency,
      distributionArea: share.distributionArea,
      onBehalfOf: share.onBehalfOf || '',
      donorType: share.donorType,
      taxNumber: share.taxNumber || '',
      isRecurring: share.isRecurring,
      recurringFrequency: share.recurringFrequency || 'yıllık',
      notes: share.notes || '',
      tags: share.tags
    })
    setIsModalOpen(true)
  }

  const handlePayment = (share: SacrificeShare) => {
    setSelectedShare(share)
    setIsPaymentModalOpen(true)
  }

  const handleReceipt = (share: SacrificeShare) => {
    setSelectedShare(share)
    setIsReceiptModalOpen(true)
  }

  const handleSendThankYou = (shareId: string) => {
    setSacrificeShares(sacrificeShares.map(share => 
      share.id === shareId 
        ? { ...share, thankYouSent: true }
        : share
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const shareCount = parseInt(formData.shareCount)
    const pricePerShare = parseFloat(formData.pricePerShare)
    const totalAmount = shareCount * pricePerShare
    
    if (editingShare) {
      // Güncelleme
      setSacrificeShares(sacrificeShares.map(share => 
        share.id === editingShare.id 
          ? { 
              ...share, 
              ...formData,
              shareCount,
              pricePerShare,
              totalAmount,
              lastModified: new Date().toISOString().split('T')[0],
              modifiedBy: 'Admin'
            }
          : share
      ))
    } else {
      // Yeni ekleme
      const newShare: SacrificeShare = {
        id: Date.now().toString(),
        ...formData,
        shareCount,
        pricePerShare,
        totalAmount,
        periodYear: new Date().getFullYear(),
        paymentStatus: 'beklemede',
        distributionStatus: 'beklemede',
        receiptIssued: false,
        thankYouSent: false,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        lastModified: new Date().toISOString().split('T')[0],
        modifiedBy: 'Admin'
      }
      setSacrificeShares([...sacrificeShares, newShare])
    }
    
    setIsModalOpen(false)
    setEditingShare(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      shareNumber: '',
      periodName: '',
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      donorAddress: '',
      shareCount: '',
      pricePerShare: '',
      currency: 'TRY',
      distributionArea: '',
      onBehalfOf: '',
      donorType: 'bireysel',
      taxNumber: '',
      isRecurring: false,
      recurringFrequency: 'yıllık',
      notes: '',
      tags: []
    })
  }

  const openAddModal = () => {
    setEditingShare(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      })
    } else {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      })
    }
  }

  const availableTags = ['vip', 'tekrarlayan', 'yeni', 'kurumsal', 'büyük', 'akika', 'adak', 'şükür']
  const distributionAreas = ['Türkiye', 'Suriye', 'Yemen', 'Somali', 'Bangladeş', 'Filistin', 'Afganistan', 'Pakistan']
  const periods = ['Kurban Bayramı 2024', 'Kurban Bayramı 2023', 'Akika Kurbanları 2024']

  const handleSendPaymentReminders = () => {
    const unpaidShares = filteredShares.filter(share => share.paymentStatus === 'beklemede')
    log.info('Ödeme hatırlatması gönderilecek:', { count: unpaidShares.length, type: 'hisse' })
    // Send reminders logic
  }

  const handleSendThankYouMessages = () => {
    const unthankfulShares = filteredShares.filter(share => !share.thankYouSent && share.paymentStatus === 'ödendi')
    log.info('Teşekkür mesajı gönderilecek:', { count: unthankfulShares.length, type: 'hisse' })
    // Send thank you messages logic
  }

  const handlePrintReceipt = (selectedShare: any) => {
    log.info('Makbuz yazdırılıyor:', { shareNumber: selectedShare.shareNumber })
    // Print receipt logic
  }

  const handleSendEmailReceipt = (selectedShare: any) => {
    log.info('E-makbuz gönderiliyor:', { email: selectedShare.donorEmail })
    // Send email receipt logic
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Kurban Hisseleri</h2>
            <div className="flex border rounded">
              <button
                onClick={() => setActiveTab('shares')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'shares' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hisseler
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Analitik
              </button>
            </div>
          </div>
          {activeTab === 'shares' && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Yeni Hisse
            </button>
          )}
        </div>

        {activeTab === 'shares' && (
          <>
            {/* Özet Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Toplam Hisse</h3>
                <p className="text-2xl font-bold text-blue-900">{totalShares}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Toplam Tutar</h3>
                <p className="text-2xl font-bold text-green-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Ödenen</h3>
                <p className="text-2xl font-bold text-purple-900">{paidAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600">Bekleyen</h3>
                <p className="text-2xl font-bold text-orange-900">{pendingAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-600">Tekrarlayan</h3>
                <p className="text-2xl font-bold text-indigo-900">{recurringShares}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-pink-600">Makbuz Oranı</h3>
                <p className="text-2xl font-bold text-pink-900">{Math.round((receiptIssued / filteredShares.length) * 100)}%</p>
              </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Hisse no, bağışçı adı ile ara..."
              />
              <select 
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Ödemeler</option>
                <option value="ödendi">Ödendi</option>
                <option value="beklemede">Beklemede</option>
                <option value="kısmi">Kısmi</option>
                <option value="iptal">İptal</option>
                <option value="iade">İade</option>
              </select>
              <select 
                value={distributionStatusFilter}
                onChange={(e) => setDistributionStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Dağıtımlar</option>
                <option value="beklemede">Beklemede</option>
                <option value="hazırlanıyor">Hazırlanıyor</option>
                <option value="gönderildi">Gönderildi</option>
                <option value="teslim edildi">Teslim Edildi</option>
                <option value="iptal">İptal</option>
              </select>
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Dönemler</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
              <select 
                value={donorTypeFilter}
                onChange={(e) => setDonorTypeFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Tipler</option>
                <option value="bireysel">Bireysel</option>
                <option value="kurumsal">Kurumsal</option>
              </select>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="border rounded px-3 py-2"
                placeholder="Başlangıç"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="border rounded px-3 py-2"
                placeholder="Bitiş"
              />
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  // exportToCsv('kurban-hisseleri.csv', filteredShares)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Excel İndir
              </button>
              <button
                onClick={handleSendPaymentReminders}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Ödeme Hatırlatması
              </button>
              <button
                onClick={handleSendThankYouMessages}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Toplu Teşekkür
              </button>
            </div>

            <DataTable columns={columns} data={filteredShares} />
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-600 mb-2">Toplam Hisse Sayısı</h3>
                <p className="text-3xl font-bold text-blue-900">{totalShares}</p>
                <p className="text-sm text-blue-600 mt-1">Tüm dönemler</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-600 mb-2">Toplam Gelir</h3>
                <p className="text-3xl font-bold text-green-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-green-600 mt-1">Brüt tutar</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-600 mb-2">Ortalama Hisse</h3>
                <p className="text-3xl font-bold text-purple-900">
                  {filteredShares.length > 0 ? (totalShares / filteredShares.length).toFixed(1) : '0'}
                </p>
                <p className="text-sm text-purple-600 mt-1">Bağışçı başına</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-orange-600 mb-2">Tahsilat Oranı</h3>
                <p className="text-3xl font-bold text-orange-900">
                  {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                </p>
                <p className="text-sm text-orange-600 mt-1">Ödenen/Toplam</p>
              </div>
            </div>

            {/* Dağıtım Alanları */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Dağıtım Alanlarına Göre Dağılım</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(distributionAreaStats).map(([area, stats]) => (
                  <div key={area} className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{area}</h4>
                      <span className="text-sm text-gray-500">{stats.count} hisse</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.amount.toLocaleString('tr-TR')} ₺
                    </div>
                    <div className="text-sm text-gray-500">
                      Toplam tutarın %{totalAmount > 0 ? Math.round((stats.amount / totalAmount) * 100) : 0}'si
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ödeme Durumu Dağılımı */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Ödeme Durumu Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['ödendi', 'beklemede', 'kısmi', 'iptal', 'iade'].map(status => {
                  const count = filteredShares.filter(share => share.paymentStatus === status).length
                  const amount = filteredShares
                    .filter(share => share.paymentStatus === status)
                    .reduce((sum, share) => sum + share.totalAmount, 0)
                  
                  return (
                    <div key={status} className="border rounded p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">{status}</div>
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-sm text-gray-500">{amount.toLocaleString('tr-TR')} ₺</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tekrarlayan Bağışlar */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Tekrarlayan Bağış Analizi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Tekrarlayan Hisse</div>
                  <div className="text-2xl font-bold text-green-600">{recurringShares}</div>
                  <div className="text-sm text-gray-500">
                    Toplam hisselerin %{filteredShares.length > 0 ? Math.round((recurringShares / filteredShares.length) * 100) : 0}'si
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Yıllık Tekrarlayan</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredShares.filter(share => share.recurringFrequency === 'yıllık').length}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Aylık Tekrarlayan</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredShares.filter(share => share.recurringFrequency === 'aylık').length}
                  </div>
                </div>
              </div>
            </div>

            {/* İşlem Durumları */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">İşlem Durumları</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Makbuz Kesildi</div>
                  <div className="text-2xl font-bold text-green-600">{receiptIssued}</div>
                  <div className="text-sm text-gray-500">
                    %{filteredShares.length > 0 ? Math.round((receiptIssued / filteredShares.length) * 100) : 0} tamamlandı
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Teşekkür Gönderildi</div>
                  <div className="text-2xl font-bold text-blue-600">{thankYouSent}</div>
                  <div className="text-sm text-gray-500">
                    %{filteredShares.length > 0 ? Math.round((thankYouSent / filteredShares.length) * 100) : 0} tamamlandı
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Kurumsal Bağışçı</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredShares.filter(share => share.donorType === 'kurumsal').length}
                  </div>
                  <div className="text-sm text-gray-500">
                    %{filteredShares.length > 0 ? Math.round((filteredShares.filter(share => share.donorType === 'kurumsal').length / filteredShares.length) * 100) : 0} oran
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hisse Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShare ? 'Kurban Hissesi Düzenle' : 'Yeni Kurban Hissesi'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hisse Numarası *</label>
              <input
                type="text"
                value={formData.shareNumber}
                onChange={(e) => setFormData({...formData, shareNumber: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="KB2024-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dönem *</label>
              <select
                value={formData.periodName}
                onChange={(e) => setFormData({...formData, periodName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seçiniz</option>
                {periods.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bağışçı Tipi</label>
              <select
                value={formData.donorType}
                onChange={(e) => setFormData({...formData, donorType: e.target.value as SacrificeShare['donorType']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="bireysel">Bireysel</option>
                <option value="kurumsal">Kurumsal</option>
              </select>
            </div>
            {formData.donorType === 'kurumsal' && (
              <div>
                <label className="block text-sm font-medium mb-1">Vergi Numarası</label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="1234567890"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bağışçı Adı *</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input
                type="tel"
                value={formData.donorPhone}
                onChange={(e) => setFormData({...formData, donorPhone: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <input
                type="email"
                value={formData.donorEmail}
                onChange={(e) => setFormData({...formData, donorEmail: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dağıtım Alanı *</label>
              <select
                value={formData.distributionArea}
                onChange={(e) => setFormData({...formData, distributionArea: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seçiniz</option>
                {distributionAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Adres</label>
            <textarea
              value={formData.donorAddress}
              onChange={(e) => setFormData({...formData, donorAddress: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Bağışçı adresi..."
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hisse Sayısı *</label>
              <input
                type="number"
                min="1"
                value={formData.shareCount}
                onChange={(e) => setFormData({...formData, shareCount: e.target.value})}
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
                onChange={(e) => setFormData({...formData, currency: e.target.value as SacrificeShare['currency']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Adına (Opsiyonel)</label>
            <input
              type="text"
              value={formData.onBehalfOf}
              onChange={(e) => setFormData({...formData, onBehalfOf: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Rahmetli babası adına"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm font-medium">Tekrarlayan Bağış</span>
              </label>
            </div>
            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-1">Tekrar Sıklığı</label>
                <select
                  value={formData.recurringFrequency}
                  onChange={(e) => setFormData({...formData, recurringFrequency: e.target.value as SacrificeShare['recurringFrequency']})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="aylık">Aylık</option>
                  <option value="yıllık">Yıllık</option>
                </select>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Etiketler</label>
            <div className="grid grid-cols-4 gap-2">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={(e) => handleTagChange(tag, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Ek bilgiler..."
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
              {editingShare ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Ödeme Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Ödeme İşlemi"
      >
        {selectedShare && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">{selectedShare.shareNumber}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bağışçı:</span>
                  <span className="ml-2">{selectedShare.donorName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tutar:</span>
                  <span className="ml-2 font-medium">{selectedShare.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div>
                  <span className="text-gray-600">Durum:</span>
                  <span className="ml-2">{selectedShare.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-gray-600">Hisse:</span>
                  <span className="ml-2">{selectedShare.shareCount} adet</span>
                </div>
              </div>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ödeme Yöntemi</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="nakit">Nakit</option>
                    <option value="kredi-karti">Kredi Kartı</option>
                    <option value="havale">Havale/EFT</option>
                    <option value="pos">POS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ödeme Tarihi</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Referans/Açıklama</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="İşlem referansı veya açıklama"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Makbuz Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Makbuz İşlemleri"
      >
        {selectedShare && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">{selectedShare.shareNumber}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Bağışçı:</span>
                  <span className="ml-2">{selectedShare.donorName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tutar:</span>
                  <span className="ml-2 font-medium">{selectedShare.totalAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div>
                  <span className="text-gray-600">Makbuz Durumu:</span>
                  <span className={`ml-2 ${selectedShare.receiptIssued ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedShare.receiptIssued ? 'Kesildi' : 'Kesilmedi'}
                  </span>
                </div>
                {selectedShare.receiptNumber && (
                  <div>
                    <span className="text-gray-600">Makbuz No:</span>
                    <span className="ml-2">{selectedShare.receiptNumber}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePrintReceipt(selectedShare)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Makbuz Yazdır
              </button>
              <button
                onClick={() => handleSendEmailReceipt(selectedShare)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={!selectedShare.donorEmail}
              >
                E-Makbuz Gönder
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
