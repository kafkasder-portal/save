import React, { useState, useMemo, FormEvent } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

interface RamadanPeriod {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  targetAmount: number
  collectedAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  donationCount: number
  averageDonation: number
  topDonation: number
  fitrAmount: number
  fitrCount: number
  fitrCollected: number
  iftar: {
    targetCount: number
    sponsoredCount: number
    pricePerIftar: number
    totalRevenue: number
  }
  sahur: {
    targetCount: number
    sponsoredCount: number
    pricePerSahur: number
    totalRevenue: number
  }
  foodPackage: {
    targetCount: number
    distributedCount: number
    pricePerPackage: number
    totalRevenue: number
  }
  distributionAreas: string[]
  campaigns: string[]
  status: 'planlama' | 'aktif' | 'tamamlandı' | 'iptal'
  responsiblePerson: string
  description?: string
  specialPrograms: string[]
  partnerOrganizations: string[]
  createdDate: string
  createdBy: string
  lastModified: string
  modifiedBy: string
}

interface RamadanDonation {
  id: string
  periodId: string
  donorName: string
  donorPhone: string
  donorEmail?: string
  donationType: 'fitr' | 'iftar' | 'sahur' | 'gida-paketi' | 'genel' | 'fidye'
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  quantity?: number
  paymentMethod: string
  paymentStatus: 'ödendi' | 'beklemede' | 'iptal'
  paymentDate?: string
  distributionArea: string
  onBehalfOf?: string
  isAnonymous: boolean
  receiptNumber?: string
  notes?: string
  createdDate: string
}

const mockRamadanPeriods: RamadanPeriod[] = [
  {
    id: '1',
    name: 'Ramazan 2024',
    year: 2024,
    startDate: '2024-03-11',
    endDate: '2024-04-09',
    targetAmount: 500000,
    collectedAmount: 387500,
    currency: 'TRY',
    donationCount: 1250,
    averageDonation: 310,
    topDonation: 25000,
    fitrAmount: 150,
    fitrCount: 850,
    fitrCollected: 127500,
    iftar: {
      targetCount: 5000,
      sponsoredCount: 3200,
      pricePerIftar: 25,
      totalRevenue: 80000
    },
    sahur: {
      targetCount: 2000,
      sponsoredCount: 1100,
      pricePerSahur: 15,
      totalRevenue: 16500
    },
    foodPackage: {
      targetCount: 1000,
      distributedCount: 750,
      pricePerPackage: 200,
      totalRevenue: 150000
    },
    distributionAreas: ['Türkiye', 'Suriye', 'Yemen', 'Somali'],
    campaigns: ['Ramazan Bereketinizi Paylaşın', 'İftar Sofrası', 'Gıda Kolisi'],
    status: 'tamamlandı',
    responsiblePerson: 'Ahmet Yılmaz',
    description: '2024 Ramazan ayı bağış kampanyası',
    specialPrograms: ['Yetim İftarı', 'Yaşlı Bakımevi Ziyareti', 'Sokak İftarı'],
    partnerOrganizations: ['Belediye', 'Diyanet', 'Kızılay'],
    createdDate: '2024-02-01',
    createdBy: 'Admin',
    lastModified: '2024-04-10',
    modifiedBy: 'Admin'
  },
  {
    id: '2',
    name: 'Ramazan 2023',
    year: 2023,
    startDate: '2023-03-23',
    endDate: '2023-04-21',
    targetAmount: 400000,
    collectedAmount: 420000,
    currency: 'TRY',
    donationCount: 980,
    averageDonation: 428,
    topDonation: 30000,
    fitrAmount: 120,
    fitrCount: 720,
    fitrCollected: 86400,
    iftar: {
      targetCount: 4000,
      sponsoredCount: 4200,
      pricePerIftar: 20,
      totalRevenue: 84000
    },
    sahur: {
      targetCount: 1500,
      sponsoredCount: 1300,
      pricePerSahur: 12,
      totalRevenue: 15600
    },
    foodPackage: {
      targetCount: 800,
      distributedCount: 850,
      pricePerPackage: 180,
      totalRevenue: 153000
    },
    distributionAreas: ['Türkiye', 'Suriye', 'Filistin'],
    campaigns: ['Ramazan Yardımı', 'İftar Sponsorluğu'],
    status: 'tamamlandı',
    responsiblePerson: 'Mehmet Özkan',
    description: '2023 Ramazan ayı bağış kampanyası',
    specialPrograms: ['Cami İftarı', 'Ev Ziyaretleri'],
    partnerOrganizations: ['Belediye', 'Diyanet'],
    createdDate: '2023-02-15',
    createdBy: 'Admin',
    lastModified: '2023-04-22',
    modifiedBy: 'Admin'
  },
  {
    id: '3',
    name: 'Ramazan 2025',
    year: 2025,
    startDate: '2025-02-28',
    endDate: '2025-03-29',
    targetAmount: 600000,
    collectedAmount: 0,
    currency: 'TRY',
    donationCount: 0,
    averageDonation: 0,
    topDonation: 0,
    fitrAmount: 180,
    fitrCount: 0,
    fitrCollected: 0,
    iftar: {
      targetCount: 6000,
      sponsoredCount: 0,
      pricePerIftar: 30,
      totalRevenue: 0
    },
    sahur: {
      targetCount: 2500,
      sponsoredCount: 0,
      pricePerSahur: 18,
      totalRevenue: 0
    },
    foodPackage: {
      targetCount: 1200,
      distributedCount: 0,
      pricePerPackage: 250,
      totalRevenue: 0
    },
    distributionAreas: ['Türkiye', 'Suriye', 'Yemen', 'Somali', 'Bangladeş'],
    campaigns: ['Ramazan 2025 Hazırlık'],
    status: 'planlama',
    responsiblePerson: 'Zeynep Kaya',
    description: '2025 Ramazan ayı bağış kampanyası planlaması',
    specialPrograms: ['Dijital İftar', 'Gençlik Programları'],
    partnerOrganizations: ['Belediye', 'Diyanet', 'Üniversiteler'],
    createdDate: '2024-12-01',
    createdBy: 'Admin',
    lastModified: '2024-12-01',
    modifiedBy: 'Admin'
  }
]

const mockRamadanDonations: RamadanDonation[] = [
  {
    id: '1',
    periodId: '1',
    donorName: 'Ali Veli',
    donorPhone: '+90 532 123 4567',
    donorEmail: 'ali.veli@email.com',
    donationType: 'iftar',
    amount: 500,
    currency: 'TRY',
    quantity: 20,
    paymentMethod: 'Kredi Kartı',
    paymentStatus: 'ödendi',
    paymentDate: '2024-03-15',
    distributionArea: 'Türkiye',
    onBehalfOf: 'Ailesi adına',
    isAnonymous: false,
    receiptNumber: 'RM-2024-001',
    createdDate: '2024-03-15'
  },
  {
    id: '2',
    periodId: '1',
    donorName: 'Fatma Yılmaz',
    donorPhone: '+90 533 987 6543',
    donationType: 'fitr',
    amount: 600,
    currency: 'TRY',
    quantity: 4,
    paymentMethod: 'Nakit',
    paymentStatus: 'ödendi',
    paymentDate: '2024-04-08',
    distributionArea: 'Suriye',
    isAnonymous: false,
    receiptNumber: 'RM-2024-002',
    createdDate: '2024-04-08'
  },
  {
    id: '3',
    periodId: '1',
    donorName: 'Anonim Bağışçı',
    donorPhone: '+90 534 111 2233',
    donationType: 'gida-paketi',
    amount: 2000,
    currency: 'TRY',
    quantity: 10,
    paymentMethod: 'Havale',
    paymentStatus: 'ödendi',
    paymentDate: '2024-03-20',
    distributionArea: 'Yemen',
    isAnonymous: true,
    receiptNumber: 'RM-2024-003',
    notes: 'Anonim bağış talebi',
    createdDate: '2024-03-20'
  }
]

export default function RamadanPeriods() {
  const [ramadanPeriods, setRamadanPeriods] = useState<RamadanPeriod[]>(mockRamadanPeriods)
  const [ramadanDonations] = useState<RamadanDonation[]>(mockRamadanDonations)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<RamadanPeriod | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<RamadanPeriod | null>(null)
  const [activeTab, setActiveTab] = useState<'periods' | 'donations' | 'analytics'>('periods')
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    targetAmount: '',
    currency: 'TRY' as RamadanPeriod['currency'],
    fitrAmount: '',
    iftarTargetCount: '',
    iftarPrice: '',
    sahurTargetCount: '',
    sahurPrice: '',
    foodPackageTargetCount: '',
    foodPackagePrice: '',
    distributionAreas: [] as string[],
    campaigns: [] as string[],
    responsiblePerson: '',
    description: '',
    specialPrograms: [] as string[],
    partnerOrganizations: [] as string[]
  })

  const filteredPeriods = useMemo(() => {
    return ramadanPeriods.filter(period => {
      const matchesQuery = JSON.stringify(period).toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !statusFilter || period.status === statusFilter
      const matchesYear = !yearFilter || period.year.toString() === yearFilter
      
      return matchesQuery && matchesStatus && matchesYear
    })
  }, [ramadanPeriods, query, statusFilter, yearFilter])

  const filteredDonations = useMemo(() => {
    return ramadanDonations.filter(donation => {
      const matchesQuery = JSON.stringify(donation).toLowerCase().includes(query.toLowerCase())
      return matchesQuery
    })
  }, [ramadanDonations, query])

  // Analytics hesaplamaları
  const totalPeriods = filteredPeriods.length
  const activePeriods = filteredPeriods.filter(p => p.status === 'aktif').length
  const completedPeriods = filteredPeriods.filter(p => p.status === 'tamamlandı').length
  const totalTargetAmount = filteredPeriods.reduce((sum, p) => sum + p.targetAmount, 0)
  const totalCollectedAmount = filteredPeriods.reduce((sum, p) => sum + p.collectedAmount, 0)
  const collectionRate = totalTargetAmount > 0 ? (totalCollectedAmount / totalTargetAmount) * 100 : 0
  const totalDonations = filteredPeriods.reduce((sum, p) => sum + p.donationCount, 0)
  const totalFitrCollected = filteredPeriods.reduce((sum, p) => sum + p.fitrCollected, 0)
  const totalIftarRevenue = filteredPeriods.reduce((sum, p) => sum + p.iftar.totalRevenue, 0)
  const totalFoodPackageRevenue = filteredPeriods.reduce((sum, p) => sum + p.foodPackage.totalRevenue, 0)

  const periodColumns: Column<RamadanPeriod>[] = [
    { key: 'name', header: 'Dönem Adı' },
    { key: 'year', header: 'Yıl' },
    { 
      key: 'startDate', 
      header: 'Tarih Aralığı',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div>{new Date(period.startDate).toLocaleDateString('tr-TR')}</div>
          <div className="text-gray-500">{new Date(period.endDate).toLocaleDateString('tr-TR')}</div>
        </div>
      )
    },
    { 
      key: 'targetAmount', 
      header: 'Hedef/Toplanan',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div className="font-medium">{period.targetAmount.toLocaleString('tr-TR')} ₺</div>
          <div className="text-green-600">{period.collectedAmount.toLocaleString('tr-TR')} ₺</div>
          <div className="text-xs text-gray-500">
            %{period.targetAmount > 0 ? Math.round((period.collectedAmount / period.targetAmount) * 100) : 0}
          </div>
        </div>
      )
    },
    { 
      key: 'donationCount', 
      header: 'Bağış Sayısı',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div className="font-medium">{period.donationCount}</div>
          <div className="text-gray-500">Ort: {period.averageDonation.toLocaleString('tr-TR')} ₺</div>
        </div>
      )
    },
    { 
      key: 'fitrCollected', 
      header: 'Fıtır',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div className="font-medium">{period.fitrCount} adet</div>
          <div className="text-green-600">{period.fitrCollected.toLocaleString('tr-TR')} ₺</div>
          <div className="text-xs text-gray-500">{period.fitrAmount} ₺/adet</div>
        </div>
      )
    },
    { 
      key: 'iftar', 
      header: 'İftar',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div className="font-medium">{period.iftar.sponsoredCount}/{period.iftar.targetCount}</div>
          <div className="text-green-600">{period.iftar.totalRevenue.toLocaleString('tr-TR')} ₺</div>
          <div className="text-xs text-gray-500">{period.iftar.pricePerIftar} ₺/iftar</div>
        </div>
      )
    },
    { 
      key: 'foodPackage', 
      header: 'Gıda Paketi',
      render: (_, period: RamadanPeriod) => (
        <div className="text-sm">
          <div className="font-medium">{period.foodPackage.distributedCount}/{period.foodPackage.targetCount}</div>
          <div className="text-green-600">{period.foodPackage.totalRevenue.toLocaleString('tr-TR')} ₺</div>
          <div className="text-xs text-gray-500">{period.foodPackage.pricePerPackage} ₺/paket</div>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Durum',
      render: (_, period: RamadanPeriod) => (
        <span className={`px-2 py-1 rounded text-xs ${
          period.status === 'aktif' ? 'bg-green-100 text-green-800' :
          period.status === 'tamamlandı' ? 'bg-blue-100 text-blue-800' :
          period.status === 'planlama' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {period.status}
        </span>
      )
    },
    { key: 'responsiblePerson', header: 'Sorumlu' },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, period: RamadanPeriod) => (
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => handleEdit(period)}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleViewDonations(period)}
            className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
          >
            Bağışlar
          </button>
          <button
            onClick={() => handleViewAnalytics(period)}
            className="text-purple-600 hover:text-purple-800 px-2 py-1 rounded"
          >
            Analitik
          </button>
        </div>
      )
    }
  ]

  const donationColumns: Column<RamadanDonation>[] = [
    { key: 'donorName', header: 'Bağışçı' },
    { key: 'donorPhone', header: 'Telefon' },
    { 
      key: 'donationType', 
      header: 'Bağış Tipi',
      render: (_, donation: RamadanDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          donation.donationType === 'fitr' ? 'bg-green-100 text-green-800' :
          donation.donationType === 'iftar' ? 'bg-blue-100 text-blue-800' :
          donation.donationType === 'sahur' ? 'bg-purple-100 text-purple-800' :
          donation.donationType === 'gida-paketi' ? 'bg-orange-100 text-orange-800' :
          donation.donationType === 'fidye' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {donation.donationType === 'gida-paketi' ? 'Gıda Paketi' :
           donation.donationType === 'fidye' ? 'Fidye' :
           donation.donationType === 'iftar' ? 'İftar' :
           donation.donationType === 'sahur' ? 'Sahur' :
           donation.donationType === 'fitr' ? 'Fıtır' : 'Genel'}
        </span>
      )
    },
    { 
      key: 'amount', 
      header: 'Tutar/Adet',
      render: (_, donation: RamadanDonation) => (
        <div className="text-sm">
          <div className="font-medium">{donation.amount.toLocaleString('tr-TR')} ₺</div>
          {donation.quantity && (
            <div className="text-gray-500">{donation.quantity} adet</div>
          )}
        </div>
      )
    },
    { key: 'paymentMethod', header: 'Ödeme Yöntemi' },
    { 
      key: 'paymentStatus', 
      header: 'Durum',
      render: (_, donation: RamadanDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          donation.paymentStatus === 'ödendi' ? 'bg-green-100 text-green-800' :
          donation.paymentStatus === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {donation.paymentStatus}
        </span>
      )
    },
    { key: 'distributionArea', header: 'Dağıtım Alanı' },
    { 
      key: 'isAnonymous', 
      header: 'Anonim',
      render: (_, donation: RamadanDonation) => donation.isAnonymous ? '✓' : '-'
    },
    { key: 'receiptNumber', header: 'Makbuz No' },
    { 
      key: 'createdDate', 
      header: 'Tarih',
      render: (_, donation: RamadanDonation) => new Date(donation.createdDate).toLocaleDateString('tr-TR')
    }
  ]

  const handleEdit = (period: RamadanPeriod) => {
    setEditingPeriod(period)
    setFormData({
      name: period.name,
      year: period.year,
      startDate: period.startDate,
      endDate: period.endDate,
      targetAmount: period.targetAmount.toString(),
      currency: period.currency,
      fitrAmount: period.fitrAmount.toString(),
      iftarTargetCount: period.iftar.targetCount.toString(),
      iftarPrice: period.iftar.pricePerIftar.toString(),
      sahurTargetCount: period.sahur.targetCount.toString(),
      sahurPrice: period.sahur.pricePerSahur.toString(),
      foodPackageTargetCount: period.foodPackage.targetCount.toString(),
      foodPackagePrice: period.foodPackage.pricePerPackage.toString(),
      distributionAreas: period.distributionAreas,
      campaigns: period.campaigns,
      responsiblePerson: period.responsiblePerson,
      description: period.description || '',
      specialPrograms: period.specialPrograms,
      partnerOrganizations: period.partnerOrganizations
    })
    setIsModalOpen(true)
  }

  const handleViewDonations = (period: RamadanPeriod) => {
    setSelectedPeriod(period)
    setIsDonationModalOpen(true)
  }

  const handleViewAnalytics = (period: RamadanPeriod) => {
    setSelectedPeriod(period)
    setIsAnalyticsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const targetAmount = parseFloat(formData.targetAmount)
    const fitrAmount = parseFloat(formData.fitrAmount)
    const iftarTargetCount = parseInt(formData.iftarTargetCount)
    const iftarPrice = parseFloat(formData.iftarPrice)
    const sahurTargetCount = parseInt(formData.sahurTargetCount)
    const sahurPrice = parseFloat(formData.sahurPrice)
    const foodPackageTargetCount = parseInt(formData.foodPackageTargetCount)
    const foodPackagePrice = parseFloat(formData.foodPackagePrice)
    
    if (editingPeriod) {
      // Güncelleme
      setRamadanPeriods(ramadanPeriods.map(period => 
        period.id === editingPeriod.id 
          ? { 
              ...period, 
              ...formData,
              targetAmount,
              fitrAmount,
              iftar: {
                ...period.iftar,
                targetCount: iftarTargetCount,
                pricePerIftar: iftarPrice
              },
              sahur: {
                ...period.sahur,
                targetCount: sahurTargetCount,
                pricePerSahur: sahurPrice
              },
              foodPackage: {
                ...period.foodPackage,
                targetCount: foodPackageTargetCount,
                pricePerPackage: foodPackagePrice
              },
              lastModified: new Date().toISOString().split('T')[0],
              modifiedBy: 'Admin'
            }
          : period
      ))
    } else {
      // Yeni ekleme
      const newPeriod: RamadanPeriod = {
        id: Date.now().toString(),
        ...formData,
        targetAmount,
        collectedAmount: 0,
        donationCount: 0,
        averageDonation: 0,
        topDonation: 0,
        fitrAmount,
        fitrCount: 0,
        fitrCollected: 0,
        iftar: {
          targetCount: iftarTargetCount,
          sponsoredCount: 0,
          pricePerIftar: iftarPrice,
          totalRevenue: 0
        },
        sahur: {
          targetCount: sahurTargetCount,
          sponsoredCount: 0,
          pricePerSahur: sahurPrice,
          totalRevenue: 0
        },
        foodPackage: {
          targetCount: foodPackageTargetCount,
          distributedCount: 0,
          pricePerPackage: foodPackagePrice,
          totalRevenue: 0
        },
        status: 'planlama',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        lastModified: new Date().toISOString().split('T')[0],
        modifiedBy: 'Admin'
      }
      setRamadanPeriods([...ramadanPeriods, newPeriod])
    }
    
    setIsModalOpen(false)
    setEditingPeriod(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      targetAmount: '',
      currency: 'TRY',
      fitrAmount: '',
      iftarTargetCount: '',
      iftarPrice: '',
      sahurTargetCount: '',
      sahurPrice: '',
      foodPackageTargetCount: '',
      foodPackagePrice: '',
      distributionAreas: [],
      campaigns: [],
      responsiblePerson: '',
      description: '',
      specialPrograms: [],
      partnerOrganizations: []
    })
  }

  const openAddModal = () => {
    setEditingPeriod(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[]
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value]
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter(item => item !== value)
      })
    }
  }

  const availableDistributionAreas = ['Türkiye', 'Suriye', 'Yemen', 'Somali', 'Bangladeş', 'Filistin', 'Afganistan', 'Pakistan']
  const availableCampaigns = ['Ramazan Bereketinizi Paylaşın', 'İftar Sofrası', 'Gıda Kolisi', 'Fıtır Kampanyası', 'Sahur Sponsorluğu']
  const availableSpecialPrograms = ['Yetim İftarı', 'Yaşlı Bakımevi Ziyareti', 'Sokak İftarı', 'Cami İftarı', 'Ev Ziyaretleri', 'Dijital İftar', 'Gençlik Programları']
  const availablePartnerOrganizations = ['Belediye', 'Diyanet', 'Kızılay', 'Üniversiteler', 'STK\'lar', 'Özel Sektör']
  const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 5 + i)

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Ramazan Dönemleri</h2>
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
                onClick={() => setActiveTab('donations')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'donations' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bağışlar
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Genel Analitik
              </button>
            </div>
          </div>
          {activeTab === 'periods' && (
            <button
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Yeni Dönem
            </button>
          )}
        </div>

        {activeTab === 'periods' && (
          <>
            {/* Özet Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Toplam Dönem</h3>
                <p className="text-2xl font-bold text-blue-900">{totalPeriods}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Aktif Dönem</h3>
                <p className="text-2xl font-bold text-green-900">{activePeriods}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Tamamlanan</h3>
                <p className="text-2xl font-bold text-purple-900">{completedPeriods}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600">Hedef Tutar</h3>
                <p className="text-2xl font-bold text-orange-900">{totalTargetAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-600">Toplanan</h3>
                <p className="text-2xl font-bold text-indigo-900">{totalCollectedAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-pink-600">Başarı Oranı</h3>
                <p className="text-2xl font-bold text-pink-900">{Math.round(collectionRate)}%</p>
              </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Dönem adı ile ara..."
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Durumlar</option>
                <option value="planlama">Planlama</option>
                <option value="aktif">Aktif</option>
                <option value="tamamlandı">Tamamlandı</option>
                <option value="iptal">İptal</option>
              </select>
              <select 
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Yıllar</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  // exportToCsv('ramazan-donemleri.csv', filteredPeriods)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Excel İndir
              </button>
            </div>

            <DataTable columns={periodColumns} data={filteredPeriods} />
          </>
        )}

        {activeTab === 'donations' && (
          <>
            <div className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="Bağışçı adı, telefon ile ara..."
              />
            </div>
            <DataTable columns={donationColumns} data={filteredDonations} />
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-600 mb-2">Toplam Bağış</h3>
                <p className="text-3xl font-bold text-blue-900">{totalDonations}</p>
                <p className="text-sm text-blue-600 mt-1">Tüm dönemler</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-600 mb-2">Toplam Gelir</h3>
                <p className="text-3xl font-bold text-green-900">{totalCollectedAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-green-600 mt-1">Brüt tutar</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-600 mb-2">Fıtır Geliri</h3>
                <p className="text-3xl font-bold text-purple-900">{totalFitrCollected.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-purple-600 mt-1">Sadece fıtır</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-orange-600 mb-2">İftar Geliri</h3>
                <p className="text-3xl font-bold text-orange-900">{totalIftarRevenue.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-orange-600 mt-1">İftar sponsorluğu</p>
              </div>
            </div>

            {/* Dönem Karşılaştırması */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Dönem Karşılaştırması</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Dönem</th>
                      <th className="text-right py-2">Hedef</th>
                      <th className="text-right py-2">Toplanan</th>
                      <th className="text-right py-2">Başarı %</th>
                      <th className="text-right py-2">Bağış Sayısı</th>
                      <th className="text-right py-2">Ortalama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeriods.map(period => (
                      <tr key={period.id} className="border-b">
                        <td className="py-2">{period.name}</td>
                        <td className="text-right py-2">{period.targetAmount.toLocaleString('tr-TR')} ₺</td>
                        <td className="text-right py-2">{period.collectedAmount.toLocaleString('tr-TR')} ₺</td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            (period.collectedAmount / period.targetAmount) * 100 >= 100 ? 'bg-green-100 text-green-800' :
                            (period.collectedAmount / period.targetAmount) * 100 >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {period.targetAmount > 0 ? Math.round((period.collectedAmount / period.targetAmount) * 100) : 0}%
                          </span>
                        </td>
                        <td className="text-right py-2">{period.donationCount}</td>
                        <td className="text-right py-2">{period.averageDonation.toLocaleString('tr-TR')} ₺</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bağış Türü Dağılımı */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Bağış Türü Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Fıtır</div>
                  <div className="text-2xl font-bold text-green-600">{totalFitrCollected.toLocaleString('tr-TR')} ₺</div>
                  <div className="text-sm text-gray-500">
                    %{totalCollectedAmount > 0 ? Math.round((totalFitrCollected / totalCollectedAmount) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">İftar</div>
                  <div className="text-2xl font-bold text-blue-600">{totalIftarRevenue.toLocaleString('tr-TR')} ₺</div>
                  <div className="text-sm text-gray-500">
                    %{totalCollectedAmount > 0 ? Math.round((totalIftarRevenue / totalCollectedAmount) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Sahur</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredPeriods.reduce((sum, p) => sum + p.sahur.totalRevenue, 0).toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-sm text-gray-500">
                    %{totalCollectedAmount > 0 ? Math.round((filteredPeriods.reduce((sum, p) => sum + p.sahur.totalRevenue, 0) / totalCollectedAmount) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Gıda Paketi</div>
                  <div className="text-2xl font-bold text-orange-600">{totalFoodPackageRevenue.toLocaleString('tr-TR')} ₺</div>
                  <div className="text-sm text-gray-500">
                    %{totalCollectedAmount > 0 ? Math.round((totalFoodPackageRevenue / totalCollectedAmount) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Diğer</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {(totalCollectedAmount - totalFitrCollected - totalIftarRevenue - totalFoodPackageRevenue - filteredPeriods.reduce((sum, p) => sum + p.sahur.totalRevenue, 0)).toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="text-sm text-gray-500">
                    %{totalCollectedAmount > 0 ? Math.round(((totalCollectedAmount - totalFitrCollected - totalIftarRevenue - totalFoodPackageRevenue - filteredPeriods.reduce((sum, p) => sum + p.sahur.totalRevenue, 0)) / totalCollectedAmount) * 100) : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dönem Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPeriod ? 'Ramazan Dönemi Düzenle' : 'Yeni Ramazan Dönemi'}
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
                placeholder="Ramazan 2024"
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
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hedef Tutar *</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as RamadanPeriod['currency']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fıtır Tutarı *</label>
              <input
                type="number"
                step="0.01"
                value={formData.fitrAmount}
                onChange={(e) => setFormData({...formData, fitrAmount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İftar Hedef Sayısı</label>
              <input
                type="number"
                value={formData.iftarTargetCount}
                onChange={(e) => setFormData({...formData, iftarTargetCount: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">İftar Fiyatı</label>
              <input
                type="number"
                step="0.01"
                value={formData.iftarPrice}
                onChange={(e) => setFormData({...formData, iftarPrice: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sahur Hedef Sayısı</label>
              <input
                type="number"
                value={formData.sahurTargetCount}
                onChange={(e) => setFormData({...formData, sahurTargetCount: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sahur Fiyatı</label>
              <input
                type="number"
                step="0.01"
                value={formData.sahurPrice}
                onChange={(e) => setFormData({...formData, sahurPrice: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gıda Paketi Hedef Sayısı</label>
              <input
                type="number"
                value={formData.foodPackageTargetCount}
                onChange={(e) => setFormData({...formData, foodPackageTargetCount: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gıda Paketi Fiyatı</label>
              <input
                type="number"
                step="0.01"
                value={formData.foodPackagePrice}
                onChange={(e) => setFormData({...formData, foodPackagePrice: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Dağıtım Alanları</label>
            <div className="grid grid-cols-4 gap-2">
              {availableDistributionAreas.map((area) => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.distributionAreas.includes(area)}
                    onChange={(e) => handleArrayChange('distributionAreas', area, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{area}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Kampanyalar</label>
            <div className="grid grid-cols-2 gap-2">
              {availableCampaigns.map((campaign) => (
                <label key={campaign} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.campaigns.includes(campaign)}
                    onChange={(e) => handleArrayChange('campaigns', campaign, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{campaign}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Özel Programlar</label>
            <div className="grid grid-cols-2 gap-2">
              {availableSpecialPrograms.map((program) => (
                <label key={program} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.specialPrograms.includes(program)}
                    onChange={(e) => handleArrayChange('specialPrograms', program, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{program}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Partner Kuruluşlar</label>
            <div className="grid grid-cols-3 gap-2">
              {availablePartnerOrganizations.map((org) => (
                <label key={org} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.partnerOrganizations.includes(org)}
                    onChange={(e) => handleArrayChange('partnerOrganizations', org, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{org}</span>
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
              rows={3}
              placeholder="Dönem hakkında açıklama..."
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

      {/* Bağışlar Modal */}
      <Modal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        title={`${selectedPeriod?.name} - Bağışlar`}
      >
        {selectedPeriod && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Toplam Bağış:</span>
                  <span className="ml-2 font-medium">{selectedPeriod.donationCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Toplanan:</span>
                  <span className="ml-2 font-medium">{selectedPeriod.collectedAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div>
                  <span className="text-gray-600">Ortalama:</span>
                  <span className="ml-2 font-medium">{selectedPeriod.averageDonation.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <DataTable 
                columns={donationColumns} 
                data={ramadanDonations.filter(d => d.periodId === selectedPeriod.id)} 
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Analitik Modal */}
      <Modal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        title={`${selectedPeriod?.name} - Detaylı Analitik`}
      >
        {selectedPeriod && (
          <div className="space-y-6">
            {/* Genel Özet */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="text-sm font-medium text-blue-600">Hedef Tutar</h4>
                <p className="text-xl font-bold text-blue-900">{selectedPeriod.targetAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <h4 className="text-sm font-medium text-green-600">Toplanan</h4>
                <p className="text-xl font-bold text-green-900">{selectedPeriod.collectedAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <h4 className="text-sm font-medium text-purple-600">Başarı Oranı</h4>
                <p className="text-xl font-bold text-purple-900">
                  {selectedPeriod.targetAmount > 0 ? Math.round((selectedPeriod.collectedAmount / selectedPeriod.targetAmount) * 100) : 0}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <h4 className="text-sm font-medium text-orange-600">Bağış Sayısı</h4>
                <p className="text-xl font-bold text-orange-900">{selectedPeriod.donationCount}</p>
              </div>
            </div>

            {/* Bağış Türü Detayları */}
            <div className="bg-white border rounded p-4">
              <h4 className="font-medium mb-4">Bağış Türü Detayları</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded p-3">
                  <h5 className="text-sm font-medium text-green-600 mb-2">Fıtır</h5>
                  <div className="space-y-1 text-sm">
                    <div>Adet: {selectedPeriod.fitrCount}</div>
                    <div>Birim: {selectedPeriod.fitrAmount} ₺</div>
                    <div className="font-medium">Toplam: {selectedPeriod.fitrCollected.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <h5 className="text-sm font-medium text-blue-600 mb-2">İftar</h5>
                  <div className="space-y-1 text-sm">
                    <div>Hedef: {selectedPeriod.iftar.targetCount}</div>
                    <div>Sponsor: {selectedPeriod.iftar.sponsoredCount}</div>
                    <div>Birim: {selectedPeriod.iftar.pricePerIftar} ₺</div>
                    <div className="font-medium">Toplam: {selectedPeriod.iftar.totalRevenue.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <h5 className="text-sm font-medium text-purple-600 mb-2">Sahur</h5>
                  <div className="space-y-1 text-sm">
                    <div>Hedef: {selectedPeriod.sahur.targetCount}</div>
                    <div>Sponsor: {selectedPeriod.sahur.sponsoredCount}</div>
                    <div>Birim: {selectedPeriod.sahur.pricePerSahur} ₺</div>
                    <div className="font-medium">Toplam: {selectedPeriod.sahur.totalRevenue.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
                <div className="border rounded p-3">
                  <h5 className="text-sm font-medium text-orange-600 mb-2">Gıda Paketi</h5>
                  <div className="space-y-1 text-sm">
                    <div>Hedef: {selectedPeriod.foodPackage.targetCount}</div>
                    <div>Dağıtılan: {selectedPeriod.foodPackage.distributedCount}</div>
                    <div>Birim: {selectedPeriod.foodPackage.pricePerPackage} ₺</div>
                    <div className="font-medium">Toplam: {selectedPeriod.foodPackage.totalRevenue.toLocaleString('tr-TR')} ₺</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dağıtım Alanları */}
            <div className="bg-white border rounded p-4">
              <h4 className="font-medium mb-4">Dağıtım Alanları</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPeriod.distributionAreas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Kampanyalar ve Programlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border rounded p-4">
                <h4 className="font-medium mb-4">Kampanyalar</h4>
                <div className="space-y-2">
                  {selectedPeriod.campaigns.map((campaign, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">{campaign}</div>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded p-4">
                <h4 className="font-medium mb-4">Özel Programlar</h4>
                <div className="space-y-2">
                  {selectedPeriod.specialPrograms.map((program, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">{program}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner Kuruluşlar */}
            <div className="bg-white border rounded p-4">
              <h4 className="font-medium mb-4">Partner Kuruluşlar</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPeriod.partnerOrganizations.map((org, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                    {org}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
