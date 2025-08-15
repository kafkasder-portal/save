import React, { useState, useMemo, FormEvent } from 'react'
import { QrCode } from 'lucide-react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
import { MapModal } from '@components/MapModal'
import LazyQRScannerModal from '@components/LazyQRScannerModal'
import { QRCodeModal } from '@components/QRCodeModal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { generateQRCode, generateUniqueBankNumber } from '@utils/qrCodeUtils'

interface PiggyBank {
  id: string
  bankNumber: string
  assignedTo: string
  assignedDate: string
  location: string
  locationDetails: string
  address?: string
  contactPerson: string
  contactPhone: string
  contactEmail?: string
  initialAmount: number
  currentAmount: number
  lastCollectionDate?: string
  lastCollectionAmount?: number
  totalCollected: number
  collectionCount: number
  averageCollection: number
  status: 'aktif' | 'dolu' | 'bakımda' | 'kayıp' | 'iptal'
  bankType: 'standart' | 'büyük' | 'özel' | 'dijital'
  material: 'plastik' | 'metal' | 'cam' | 'karton'
  capacity: number
  weight?: number
  qrCode?: string
  notes?: string
  assignedBy: string
  createdDate: string
  lastModified: string
  modifiedBy: string
}

interface Collection {
  id: string
  bankId: string
  collectionDate: string
  collectedBy: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  coinCount?: number
  billCount?: number
  foreignCurrency?: {
    amount: number
    currency: string
    exchangeRate: number
    tryEquivalent: number
  }[]
  condition: 'iyi' | 'hasarlı' | 'değişim-gerekli'
  notes?: string
  receiptNumber?: string
  collectorSignature?: string
  witnessName?: string
  witnessSignature?: string
  photoTaken: boolean
  nextCollectionDate?: string
  createdDate: string
}

interface Assignment {
  id: string
  bankId: string
  assignedTo: string
  assignedDate: string
  location: string
  locationDetails: string
  contactPerson: string
  contactPhone: string
  expectedDuration: number // gün
  targetAmount?: number
  purpose: string
  assignedBy: string
  status: 'aktif' | 'tamamlandı' | 'iptal'
  returnDate?: string
  returnReason?: string
  notes?: string
  createdDate: string
}

const mockPiggyBanks: PiggyBank[] = [
  {
    id: '1',
    bankNumber: 'KB-2024-001',
    assignedTo: 'Ahmet Market',
    assignedDate: '2024-01-15',
    location: 'Fatih/İstanbul',
    locationDetails: 'Ahmet Market - Kasa yanı',
    address: 'Fatih Mahallesi, Atatürk Caddesi No:15, Fatih/İstanbul',
    contactPerson: 'Ahmet Yılmaz',
    contactPhone: '+90 532 123 4567',
    contactEmail: 'ahmet@market.com',
    initialAmount: 0,
    currentAmount: 1250,
    lastCollectionDate: '2024-11-15',
    lastCollectionAmount: 850,
    totalCollected: 3400,
    collectionCount: 4,
    averageCollection: 850,
    status: 'aktif',
    bankType: 'standart',
    material: 'plastik',
    capacity: 2000,
    weight: 1.2,
    qrCode: 'KB001QR',
    notes: 'Düzenli toplama yapılıyor',
    assignedBy: 'Admin',
    createdDate: '2024-01-15',
    lastModified: '2024-11-15',
    modifiedBy: 'Collector1'
  },
  {
    id: '2',
    bankNumber: 'KB-2024-002',
    assignedTo: 'Merkez Cami',
    assignedDate: '2024-02-01',
    location: 'Üsküdar/İstanbul',
    locationDetails: 'Merkez Cami - Giriş holü',
    address: 'Merkez Mahallesi, Cami Sokak No:5, Üsküdar/İstanbul',
    contactPerson: 'İmam Mehmet Bey',
    contactPhone: '+90 533 987 6543',
    initialAmount: 0,
    currentAmount: 1950,
    lastCollectionDate: '2024-11-10',
    lastCollectionAmount: 1200,
    totalCollected: 5600,
    collectionCount: 5,
    averageCollection: 1120,
    status: 'dolu',
    bankType: 'büyük',
    material: 'metal',
    capacity: 2000,
    weight: 2.1,
    qrCode: 'KB002QR',
    notes: 'Cuma namazı sonrası yoğun bağış',
    assignedBy: 'Admin',
    createdDate: '2024-02-01',
    lastModified: '2024-11-10',
    modifiedBy: 'Collector2'
  },
  {
    id: '3',
    bankNumber: 'KB-2024-003',
    assignedTo: 'Özel Okul',
    assignedDate: '2024-03-10',
    location: 'Kadıköy/İstanbul',
    locationDetails: 'Özel Okul - Öğretmenler odası',
    address: 'Eğitim Mahallesi, Okul Caddesi No:25, Kadıköy/İstanbul',
    contactPerson: 'Zeynep Öğretmen',
    contactPhone: '+90 534 111 2233',
    contactEmail: 'zeynep@okul.edu.tr',
    initialAmount: 0,
    currentAmount: 0,
    lastCollectionDate: '2024-11-20',
    lastCollectionAmount: 650,
    totalCollected: 2100,
    collectionCount: 3,
    averageCollection: 700,
    status: 'bakımda',
    bankType: 'özel',
    material: 'plastik',
    capacity: 1500,
    weight: 0.8,
    qrCode: 'KB003QR',
    notes: 'Kilit arızası - tamir edilecek',
    assignedBy: 'Admin',
    createdDate: '2024-03-10',
    lastModified: '2024-11-20',
    modifiedBy: 'Maintenance'
  },
  {
    id: '4',
    bankNumber: 'KB-2024-004',
    assignedTo: 'Hastane Kantini',
    assignedDate: '2024-04-05',
    location: 'Şişli/İstanbul',
    locationDetails: 'Hastane Kantini - Kasa üstü',
    address: 'Sağlık Mahallesi, Hastane Caddesi No:10, Şişli/İstanbul',
    contactPerson: 'Fatma Hanım',
    contactPhone: '+90 535 444 5566',
    initialAmount: 0,
    currentAmount: 320,
    totalCollected: 1800,
    collectionCount: 6,
    averageCollection: 300,
    status: 'aktif',
    bankType: 'standart',
    material: 'plastik',
    capacity: 1000,
    weight: 0.9,
    qrCode: 'KB004QR',
    assignedBy: 'Admin',
    createdDate: '2024-04-05',
    lastModified: '2024-11-18',
    modifiedBy: 'Collector1'
  },
  {
    id: '5',
    bankNumber: 'KB-2024-005',
    assignedTo: 'Kayıp',
    assignedDate: '2024-05-20',
    location: 'Bilinmiyor',
    locationDetails: 'Son bilinen: Beşiktaş Çarşı',
    address: 'Beşiktaş Çarşı, İstanbul (Son bilinen konum)',
    contactPerson: 'Bilinmiyor',
    contactPhone: 'Bilinmiyor',
    initialAmount: 0,
    currentAmount: 0,
    totalCollected: 450,
    collectionCount: 1,
    averageCollection: 450,
    status: 'kayıp',
    bankType: 'standart',
    material: 'plastik',
    capacity: 1000,
    notes: 'Kayıp raporu verildi - 2024-10-15',
    assignedBy: 'Admin',
    createdDate: '2024-05-20',
    lastModified: '2024-10-15',
    modifiedBy: 'Admin'
  }
]

const mockCollections: Collection[] = [
  {
    id: '1',
    bankId: '1',
    collectionDate: '2024-11-15',
    collectedBy: 'Collector1',
    amount: 850,
    currency: 'TRY',
    coinCount: 45,
    billCount: 12,
    condition: 'iyi',
    receiptNumber: 'TOP-2024-115',
    collectorSignature: 'İmzalandı',
    witnessName: 'Ahmet Yılmaz',
    witnessSignature: 'İmzalandı',
    photoTaken: true,
    nextCollectionDate: '2024-12-15',
    notes: 'Normal toplama',
    createdDate: '2024-11-15'
  },
  {
    id: '2',
    bankId: '2',
    collectionDate: '2024-11-10',
    collectedBy: 'Collector2',
    amount: 1200,
    currency: 'TRY',
    coinCount: 80,
    billCount: 18,
    foreignCurrency: [
      {
        amount: 5,
        currency: 'USD',
        exchangeRate: 34.5,
        tryEquivalent: 172.5
      },
      {
        amount: 2,
        currency: 'EUR',
        exchangeRate: 37.2,
        tryEquivalent: 74.4
      }
    ],
    condition: 'iyi',
    receiptNumber: 'TOP-2024-110',
    collectorSignature: 'İmzalandı',
    witnessName: 'İmam Mehmet Bey',
    witnessSignature: 'İmzalandı',
    photoTaken: true,
    notes: 'Yabancı para da var',
    createdDate: '2024-11-10'
  },
  {
    id: '3',
    bankId: '3',
    collectionDate: '2024-11-20',
    collectedBy: 'Collector1',
    amount: 650,
    currency: 'TRY',
    coinCount: 35,
    billCount: 8,
    condition: 'hasarlı',
    receiptNumber: 'TOP-2024-120',
    collectorSignature: 'İmzalandı',
    witnessName: 'Zeynep Öğretmen',
    witnessSignature: 'İmzalandı',
    photoTaken: true,
    notes: 'Kilit problemi tespit edildi',
    createdDate: '2024-11-20'
  }
]

const mockAssignments: Assignment[] = [
  {
    id: '1',
    bankId: '1',
    assignedTo: 'Ahmet Market',
    assignedDate: '2024-01-15',
    location: 'Fatih/İstanbul',
    locationDetails: 'Ahmet Market - Kasa yanı',
    contactPerson: 'Ahmet Yılmaz',
    contactPhone: '+90 532 123 4567',
    expectedDuration: 365,
    targetAmount: 5000,
    purpose: 'Genel bağış toplama',
    assignedBy: 'Admin',
    status: 'aktif',
    notes: 'Yıllık anlaşma',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    bankId: '2',
    assignedTo: 'Merkez Cami',
    assignedDate: '2024-02-01',
    location: 'Üsküdar/İstanbul',
    locationDetails: 'Merkez Cami - Giriş holü',
    contactPerson: 'İmam Mehmet Bey',
    contactPhone: '+90 533 987 6543',
    expectedDuration: 365,
    targetAmount: 8000,
    purpose: 'Cami bakım ve yardım fonu',
    assignedBy: 'Admin',
    status: 'aktif',
    notes: 'Cuma namazı sonrası aktif',
    createdDate: '2024-02-01'
  }
]

export default function PiggyBankTracking() {
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>(mockPiggyBanks)
  const [collections] = useState<Collection[]>(mockCollections)
  const [assignments] = useState<Assignment[]>(mockAssignments)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [bankTypeFilter, setBankTypeFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [isQRScannerModalOpen, setIsQRScannerModalOpen] = useState(false)
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<PiggyBank | null>(null)
  const [selectedBank, setSelectedBank] = useState<PiggyBank | null>(null)
  const [selectedBankForMap, setSelectedBankForMap] = useState<PiggyBank | null>(null)
  const [selectedBankForQR, setSelectedBankForQR] = useState<PiggyBank | null>(null)
  const [activeTab, setActiveTab] = useState<'banks' | 'collections' | 'assignments' | 'analytics'>('banks')
  const [formData, setFormData] = useState({
    bankNumber: '',
    assignedTo: '',
    location: '',
    locationDetails: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    bankType: 'standart' as PiggyBank['bankType'],
    material: 'plastik' as PiggyBank['material'],
    capacity: '',
    weight: '',
    notes: ''
  })

  const filteredBanks = useMemo(() => {
    return piggyBanks.filter(bank => {
      const matchesQuery = JSON.stringify(bank).toLowerCase().includes(query.toLowerCase())
      const matchesStatus = !statusFilter || bank.status === statusFilter
      const matchesLocation = !locationFilter || bank.location.toLowerCase().includes(locationFilter.toLowerCase())
      const matchesBankType = !bankTypeFilter || bank.bankType === bankTypeFilter
      
      return matchesQuery && matchesStatus && matchesLocation && matchesBankType
    })
  }, [piggyBanks, query, statusFilter, locationFilter, bankTypeFilter])

  const filteredCollections = useMemo(() => {
    return collections.filter(collection => {
      const matchesQuery = JSON.stringify(collection).toLowerCase().includes(query.toLowerCase())
      return matchesQuery
    })
  }, [collections, query])

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesQuery = JSON.stringify(assignment).toLowerCase().includes(query.toLowerCase())
      return matchesQuery
    })
  }, [assignments, query])

  // Analytics hesaplamaları
  const totalBanks = filteredBanks.length
  const activeBanks = filteredBanks.filter(b => b.status === 'aktif').length
  const fullBanks = filteredBanks.filter(b => b.status === 'dolu').length
  const maintenanceBanks = filteredBanks.filter(b => b.status === 'bakımda').length
  const lostBanks = filteredBanks.filter(b => b.status === 'kayıp').length
  const totalCurrentAmount = filteredBanks.reduce((sum, b) => sum + b.currentAmount, 0)
  const totalCollectedAmount = filteredBanks.reduce((sum, b) => sum + b.totalCollected, 0)
  const totalCollections = filteredBanks.reduce((sum, b) => sum + b.collectionCount, 0)
  const averagePerBank = totalBanks > 0 ? totalCollectedAmount / totalBanks : 0
  const averagePerCollection = totalCollections > 0 ? totalCollectedAmount / totalCollections : 0

  const bankColumns: Column<PiggyBank>[] = [
    { key: 'bankNumber', header: 'Kumbara No' },
    { key: 'assignedTo', header: 'Atanan Yer' },
    { key: 'location', header: 'Lokasyon' },
    { 
      key: 'address', 
      header: 'Adres',
      render: (_, row: PiggyBank) => (
        <button
          onClick={() => handleOpenMap(row)}
          className="text-blue-600 hover:text-blue-800 underline text-sm max-w-32 truncate text-left"
          title={row.address || row.locationDetails}
        >
          {row.address || row.locationDetails}
        </button>
      )
    },
    { key: 'contactPerson', header: 'İletişim' },
    { key: 'contactPhone', header: 'Telefon' },
    { 
      key: 'currentAmount', 
      header: 'Mevcut/Toplam',
      render: (_, row: PiggyBank) => (
        <div className="text-sm">
          <div className="font-medium">{row.currentAmount.toLocaleString('tr-TR')} ₺</div>
          <div className="text-gray-500">{row.totalCollected.toLocaleString('tr-TR')} ₺</div>
          <div className="text-xs text-gray-400">{row.collectionCount} toplama</div>
        </div>
      )
    },
    { 
      key: 'bankType', 
      header: 'Tip/Kapasite',
      render: (_, row: PiggyBank) => (
        <div className="text-sm">
          <div className="font-medium">{row.bankType}</div>
          <div className="text-gray-500">{row.capacity} ₺</div>
          <div className="text-xs text-gray-400">{row.material}</div>
        </div>
      )
    },
    { 
      key: 'lastCollectionDate', 
      header: 'Son Toplama',
      render: (_, row: PiggyBank) => (
        <div className="text-sm">
          {row.lastCollectionDate ? (
            <>
              <div>{new Date(row.lastCollectionDate).toLocaleDateString('tr-TR')}</div>
              <div className="text-gray-500">{row.lastCollectionAmount?.toLocaleString('tr-TR')} ₺</div>
            </>
          ) : (
            <span className="text-gray-400">Henüz yok</span>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Durum',
      render: (_, row: PiggyBank) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'aktif' ? 'bg-green-100 text-green-800' :
          row.status === 'dolu' ? 'bg-blue-100 text-blue-800' :
          row.status === 'bakımda' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'kayıp' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, row: PiggyBank) => (
        <div className="flex gap-1 text-xs flex-wrap">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleViewCollections(row)}
            className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
          >
            Toplamalar
          </button>
          <button
            onClick={() => handleOpenQRCode(row)}
            className="text-orange-600 hover:text-orange-800 px-2 py-1 rounded"
          >
            QR Kod
          </button>
          <button
            onClick={() => handleCollect(row)}
            className="text-purple-600 hover:text-purple-800 px-2 py-1 rounded"
            disabled={row.status !== 'aktif' && row.status !== 'dolu'}
          >
            Topla
          </button>
        </div>
      )
    }
  ]

  const collectionColumns: Column<Collection>[] = [
    { 
      key: 'collectionDate', 
      header: 'Tarih',
      render: (_, row: Collection) => new Date(row.collectionDate).toLocaleDateString('tr-TR')
    },
    { 
      key: 'bankId', 
      header: 'Kumbara',
      render: (_, row: Collection) => {
        const bank = piggyBanks.find(b => b.id === row.bankId)
        return bank ? bank.bankNumber : 'Bilinmiyor'
      }
    },
    { key: 'collectedBy', header: 'Toplayan' },
    { 
      key: 'amount', 
      header: 'Tutar/Adet',
      render: (_, row: Collection) => (
        <div className="text-sm">
          <div className="font-medium">{row.amount.toLocaleString('tr-TR')} ₺</div>
          <div className="text-gray-500">
            {row.coinCount}M + {row.billCount}K
          </div>
          {row.foreignCurrency && row.foreignCurrency.length > 0 && (
            <div className="text-xs text-blue-600">+Yabancı para</div>
          )}
        </div>
      )
    },
    { 
      key: 'condition', 
      header: 'Durum',
      render: (_, row: Collection) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.condition === 'iyi' ? 'bg-green-100 text-green-800' :
          row.condition === 'hasarlı' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.condition}
        </span>
      )
    },
    { key: 'receiptNumber', header: 'Makbuz No' },
    { 
      key: 'photoTaken', 
      header: 'Fotoğraf',
      render: (_, row: Collection) => (row.photoTaken ? '✓' : '-')
    },
    { key: 'witnessName', header: 'Şahit' }
  ]

  const assignmentColumns: Column<Assignment>[] = [
    { 
      key: 'assignedDate', 
      header: 'Atama Tarihi',
      render: (_, row: Assignment) => new Date(row.assignedDate).toLocaleDateString('tr-TR')
    },
    { 
      key: 'bankId', 
      header: 'Kumbara',
      render: (_, row: Assignment) => {
        const bank = piggyBanks.find(b => b.id === row.bankId)
        return bank ? bank.bankNumber : 'Bilinmiyor'
      }
    },
    { key: 'assignedTo', header: 'Atanan Yer' },
    { key: 'location', header: 'Lokasyon' },
    { key: 'contactPerson', header: 'İletişim' },
    { 
      key: 'expectedDuration', 
      header: 'Süre/Hedef',
      render: (_, row: Assignment) => (
        <div className="text-sm">
          <div>{row.expectedDuration} gün</div>
          {row.targetAmount && (
            <div className="text-gray-500">{row.targetAmount.toLocaleString('tr-TR')} ₺</div>
          )}
        </div>
      )
    },
    { key: 'purpose', header: 'Amaç' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (_, row: Assignment) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'aktif' ? 'bg-green-100 text-green-800' :
          row.status === 'tamamlandı' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { key: 'assignedBy', header: 'Atayan' }
  ]

  const handleEdit = (bank: PiggyBank) => {
    setEditingBank(bank)
    setFormData({
      bankNumber: bank.bankNumber,
      assignedTo: bank.assignedTo,
      location: bank.location,
      locationDetails: bank.locationDetails,
      address: bank.address || '',
      contactPerson: bank.contactPerson,
      contactPhone: bank.contactPhone,
      contactEmail: bank.contactEmail || '',
      bankType: bank.bankType,
      material: bank.material,
      capacity: bank.capacity.toString(),
      weight: bank.weight?.toString() || '',
      notes: bank.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleViewCollections = (bank: PiggyBank) => {
    setSelectedBank(bank)
    setIsCollectionModalOpen(true)
  }

  const handleCollect = (bank: PiggyBank) => {
    setSelectedBank(bank)
    // Toplama modalı açılabilir
    alert(`${bank.bankNumber} numaralı kumbara için toplama işlemi başlatılacak.`)
  }

  const handleOpenMap = (bank: PiggyBank) => {
    setSelectedBankForMap(bank)
    setIsMapModalOpen(true)
  }

  const handleOpenQRScanner = () => {
    setIsQRScannerModalOpen(true)
  }

  const handleOpenQRCode = (bank: PiggyBank) => {
    setSelectedBankForQR(bank)
    setIsQRCodeModalOpen(true)
  }

  const handleQRScanResult = (bankData: { bankNumber?: string }) => {
    if (bankData && bankData.bankNumber) {
      const bank = piggyBanks.find(b => b.bankNumber === bankData.bankNumber)
      if (bank) {
        handleEdit(bank)
      } else {
        alert('Kumbara bulunamadı!')
      }
    }
    setIsQRScannerModalOpen(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const capacity = parseFloat(formData.capacity)
    const weight = formData.weight ? parseFloat(formData.weight) : undefined
    
    if (editingBank) {
      // Güncelleme
      setPiggyBanks(piggyBanks.map(bank => 
        bank.id === editingBank.id 
          ? { 
              ...bank, 
              ...formData,
              capacity,
              weight,
              lastModified: new Date().toISOString().split('T')[0],
              modifiedBy: 'Admin'
            }
          : bank
      ))
    } else {
      // Yeni ekleme - Otomatik benzersiz QR kod oluştur
      const uniqueBankNumber = generateUniqueBankNumber(piggyBanks)
      const qrCode = generateQRCode({
        bankNumber: formData.bankNumber || uniqueBankNumber,
        assignedTo: formData.assignedTo,
        location: formData.location,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone
      })
      
      const newBank: PiggyBank = {
        id: Date.now().toString(),
        ...formData,
        bankNumber: formData.bankNumber || uniqueBankNumber,
        capacity,
        weight,
        assignedDate: new Date().toISOString().split('T')[0],
        initialAmount: 0,
        currentAmount: 0,
        totalCollected: 0,
        collectionCount: 0,
        averageCollection: 0,
        status: 'aktif',
        qrCode,
        assignedBy: 'Admin',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        modifiedBy: 'Admin'
      }
      setPiggyBanks([...piggyBanks, newBank])
    }
    
    setIsModalOpen(false)
    setEditingBank(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      bankNumber: '',
      assignedTo: '',
      location: '',
      locationDetails: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      bankType: 'standart',
      material: 'plastik',
      capacity: '',
      weight: '',
      notes: ''
    })
  }

  const openAddModal = () => {
    setEditingBank(null)
    resetForm()
    // Otomatik kumbara numarası oluştur
    const nextNumber = (piggyBanks.length + 1).toString().padStart(3, '0')
    setFormData(prev => ({
      ...prev,
      bankNumber: `KB-2024-${nextNumber}`
    }))
    setIsModalOpen(true)
  }

  const locations = [...new Set(piggyBanks.map(b => b.location))]

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Kumbara Takibi</h2>
            <div className="flex border rounded">
              <button
                onClick={() => setActiveTab('banks')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'banks' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Kumbaralar
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'collections' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Toplamalar
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-4 py-2 text-sm ${
                  activeTab === 'assignments' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Atamalar
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
          {activeTab === 'banks' && (
            <div className="flex gap-2">
              <button
                onClick={handleOpenQRScanner}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR Tara
              </button>
              <button
                onClick={openAddModal}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yeni Kumbara
              </button>
            </div>
          )}
        </div>

        {activeTab === 'banks' && (
          <>
            {/* Özet Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600">Toplam Kumbara</h3>
                <p className="text-2xl font-bold text-blue-900">{totalBanks}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600">Aktif</h3>
                <p className="text-2xl font-bold text-green-900">{activeBanks}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600">Dolu</h3>
                <p className="text-2xl font-bold text-purple-900">{fullBanks}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-600">Bakımda</h3>
                <p className="text-2xl font-bold text-yellow-900">{maintenanceBanks}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-red-600">Kayıp</h3>
                <p className="text-2xl font-bold text-red-900">{lostBanks}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-indigo-600">Mevcut Tutar</h3>
                <p className="text-2xl font-bold text-indigo-900">{totalCurrentAmount.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>

            {/* Arama ve Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2"
                placeholder="Kumbara no, yer adı ile ara..."
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Durumlar</option>
                <option value="aktif">Aktif</option>
                <option value="dolu">Dolu</option>
                <option value="bakımda">Bakımda</option>
                <option value="kayıp">Kayıp</option>
                <option value="iptal">İptal</option>
              </select>
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Lokasyonlar</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <select 
                value={bankTypeFilter}
                onChange={(e) => setBankTypeFilter(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Tüm Tipler</option>
                <option value="standart">Standart</option>
                <option value="büyük">Büyük</option>
                <option value="özel">Özel</option>
                <option value="dijital">Dijital</option>
              </select>
              <button
                onClick={() => {
                  // exportToCsv('kumbaralar.csv', filteredBanks)
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Excel İndir
              </button>
            </div>

            <DataTable columns={bankColumns} data={filteredBanks} />
          </>
        )}

        {activeTab === 'collections' && (
          <>
            <div className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="Kumbara no, toplayan kişi ile ara..."
              />
            </div>
            <DataTable columns={collectionColumns} data={filteredCollections} />
          </>
        )}

        {activeTab === 'assignments' && (
          <>
            <div className="mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded px-3 py-2 w-full max-w-md"
                placeholder="Atanan yer, kişi ile ara..."
              />
            </div>
            <DataTable columns={assignmentColumns} data={filteredAssignments} />
          </>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Genel İstatistikler */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-600 mb-2">Toplam Gelir</h3>
                <p className="text-3xl font-bold text-blue-900">{totalCollectedAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-blue-600 mt-1">Tüm toplamalar</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-600 mb-2">Mevcut Tutar</h3>
                <p className="text-3xl font-bold text-green-900">{totalCurrentAmount.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-green-600 mt-1">Kumbaralarda</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-600 mb-2">Kumbara Başına</h3>
                <p className="text-3xl font-bold text-purple-900">{averagePerBank.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-purple-600 mt-1">Ortalama gelir</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-orange-600 mb-2">Toplama Başına</h3>
                <p className="text-3xl font-bold text-orange-900">{averagePerCollection.toLocaleString('tr-TR')} ₺</p>
                <p className="text-sm text-orange-600 mt-1">Ortalama tutar</p>
              </div>
            </div>

            {/* Durum Dağılımı */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Kumbara Durum Dağılımı</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-green-600 mb-1">Aktif</div>
                  <div className="text-2xl font-bold text-green-600">{activeBanks}</div>
                  <div className="text-sm text-gray-500">
                    %{totalBanks > 0 ? Math.round((activeBanks / totalBanks) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-blue-600 mb-1">Dolu</div>
                  <div className="text-2xl font-bold text-blue-600">{fullBanks}</div>
                  <div className="text-sm text-gray-500">
                    %{totalBanks > 0 ? Math.round((fullBanks / totalBanks) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-yellow-600 mb-1">Bakımda</div>
                  <div className="text-2xl font-bold text-yellow-600">{maintenanceBanks}</div>
                  <div className="text-sm text-gray-500">
                    %{totalBanks > 0 ? Math.round((maintenanceBanks / totalBanks) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-red-600 mb-1">Kayıp</div>
                  <div className="text-2xl font-bold text-red-600">{lostBanks}</div>
                  <div className="text-sm text-gray-500">
                    %{totalBanks > 0 ? Math.round((lostBanks / totalBanks) * 100) : 0}
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">İptal</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {filteredBanks.filter(b => b.status === 'iptal').length}
                  </div>
                  <div className="text-sm text-gray-500">
                    %{totalBanks > 0 ? Math.round((filteredBanks.filter(b => b.status === 'iptal').length / totalBanks) * 100) : 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Lokasyon Performansı */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Lokasyon Performansı</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Lokasyon</th>
                      <th className="text-right py-2">Kumbara Sayısı</th>
                      <th className="text-right py-2">Toplam Gelir</th>
                      <th className="text-right py-2">Ortalama</th>
                      <th className="text-right py-2">Mevcut Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map(location => {
                      const locationBanks = filteredBanks.filter(b => b.location === location)
                      const locationTotal = locationBanks.reduce((sum, b) => sum + b.totalCollected, 0)
                      const locationCurrent = locationBanks.reduce((sum, b) => sum + b.currentAmount, 0)
                      const locationAverage = locationBanks.length > 0 ? locationTotal / locationBanks.length : 0
                      
                      return (
                        <tr key={location} className="border-b">
                          <td className="py-2">{location}</td>
                          <td className="text-right py-2">{locationBanks.length}</td>
                          <td className="text-right py-2">{locationTotal.toLocaleString('tr-TR')} ₺</td>
                          <td className="text-right py-2">{locationAverage.toLocaleString('tr-TR')} ₺</td>
                          <td className="text-right py-2">{locationCurrent.toLocaleString('tr-TR')} ₺</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kumbara Tipi Analizi */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Kumbara Tipi Analizi</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['standart', 'büyük', 'özel', 'dijital'].map(type => {
                  const typeBanks = filteredBanks.filter(b => b.bankType === type)
                  const typeTotal = typeBanks.reduce((sum, b) => sum + b.totalCollected, 0)
                  const typeAverage = typeBanks.length > 0 ? typeTotal / typeBanks.length : 0
                  
                  return (
                    <div key={type} className="border rounded p-4">
                      <div className="text-sm font-medium text-gray-600 mb-1">{type}</div>
                      <div className="text-xl font-bold text-gray-900">{typeBanks.length} adet</div>
                      <div className="text-sm text-gray-500">{typeTotal.toLocaleString('tr-TR')} ₺</div>
                      <div className="text-xs text-gray-400">Ort: {typeAverage.toLocaleString('tr-TR')} ₺</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kumbara Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBank ? 'Kumbara Düzenle' : 'Yeni Kumbara'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kumbara Numarası *</label>
              <input
                type="text"
                value={formData.bankNumber}
                onChange={(e) => setFormData({...formData, bankNumber: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="KB-2024-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Atanan Yer *</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Market, Cami, Okul vb."
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lokasyon *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="İlçe/İl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lokasyon Detayı</label>
              <input
                type="text"
                value={formData.locationDetails}
                onChange={(e) => setFormData({...formData, locationDetails: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Kasa yanı, giriş holü vb."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tam Adres</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Mahalle, Cadde/Sokak No, İlçe/İl"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İletişim Kişisi *</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon *</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kumbara Tipi</label>
              <select
                value={formData.bankType}
                onChange={(e) => setFormData({...formData, bankType: e.target.value as PiggyBank['bankType']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="standart">Standart</option>
                <option value="büyük">Büyük</option>
                <option value="özel">Özel</option>
                <option value="dijital">Dijital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Malzeme</label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value as PiggyBank['material']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="plastik">Plastik</option>
                <option value="metal">Metal</option>
                <option value="cam">Cam</option>
                <option value="karton">Karton</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kapasite (₺) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ağırlık (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Kumbara hakkında notlar..."
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
              {editingBank ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toplamalar Modal */}
      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title={`${selectedBank?.bankNumber} - Toplama Geçmişi`}
      >
        {selectedBank && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Toplam Toplama:</span>
                  <span className="ml-2 font-medium">{selectedBank.collectionCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Toplam Gelir:</span>
                  <span className="ml-2 font-medium">{selectedBank.totalCollected.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div>
                  <span className="text-gray-600">Ortalama:</span>
                  <span className="ml-2 font-medium">{selectedBank.averageCollection.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <DataTable 
                columns={collectionColumns} 
                data={collections.filter(c => c.bankId === selectedBank.id)} 
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Harita Modal */}
      {selectedBankForMap && (
        <MapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          address={selectedBankForMap.address || selectedBankForMap.location}
          bankNumber={selectedBankForMap.bankNumber}
          assignedTo={selectedBankForMap.assignedTo}
        />
      )}

      {/* QR Kod Tarama Modal */}
  <LazyQRScannerModal
        isOpen={isQRScannerModalOpen}
        onClose={() => setIsQRScannerModalOpen(false)}
        onScanSuccess={handleQRScanResult}
      />

      {/* QR Kod Görüntüleme Modal */}
      {selectedBankForQR && (
        <QRCodeModal
          isOpen={isQRCodeModalOpen}
          onClose={() => setIsQRCodeModalOpen(false)}
          bank={selectedBankForQR}
        />
      )}
    </div>
  )
}
