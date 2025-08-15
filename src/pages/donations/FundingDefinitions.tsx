import React, { useState, useMemo, FormEvent } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

interface FundingDefinition {
  id: string
  code: string
  name: string
  description: string
  category: 'genel' | 'eğitim' | 'sağlık' | 'gıda' | 'kurban' | 'ramazan' | 'acil' | 'proje'
  targetAmount?: number
  collectedAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  startDate?: string
  endDate?: string
  isActive: boolean
  priority: 'düşük' | 'orta' | 'yüksek' | 'kritik'
  allowedPaymentMethods: string[]
  autoAllocation: boolean
  allocationRules?: string
  responsiblePerson: string
  approvalRequired: boolean
  donationCount: number
  lastDonationDate?: string
  notes?: string
  createdDate: string
  createdBy: string
}

const mockFundingDefinitions: FundingDefinition[] = [
  {
    id: '1',
    code: 'GENEL001',
    name: 'Genel Bağış Fonu',
    description: 'Derneğin genel faaliyetleri için kullanılacak bağışlar',
    category: 'genel',
    targetAmount: 100000,
    collectedAmount: 75000,
    currency: 'TRY',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    priority: 'yüksek',
    allowedPaymentMethods: ['Nakit', 'Banka', 'Kredi Kartı', 'Online'],
    autoAllocation: true,
    allocationRules: 'Gelen bağışların %100\'ü bu fona aktarılır',
    responsiblePerson: 'Ahmet Yılmaz',
    approvalRequired: false,
    donationCount: 245,
    lastDonationDate: '2024-01-14',
    notes: 'Ana bağış fonu',
    createdDate: '2024-01-01',
    createdBy: 'Admin'
  },
  {
    id: '2',
    code: 'EGITIM001',
    name: 'Eğitim Yardımı Fonu',
    description: 'Öğrencilere burs ve eğitim materyali desteği',
    category: 'eğitim',
    targetAmount: 50000,
    collectedAmount: 32000,
    currency: 'TRY',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    isActive: true,
    priority: 'yüksek',
    allowedPaymentMethods: ['Banka', 'Kredi Kartı', 'Online'],
    autoAllocation: false,
    responsiblePerson: 'Zeynep Kaya',
    approvalRequired: true,
    donationCount: 89,
    lastDonationDate: '2024-01-13',
    notes: 'Okul öncesi ve ilkokul öğrencileri öncelikli',
    createdDate: '2024-01-01',
    createdBy: 'Admin'
  },
  {
    id: '3',
    code: 'SAGLIK001',
    name: 'Sağlık Yardımı Fonu',
    description: 'Tedavi masrafları ve ilaç yardımları',
    category: 'sağlık',
    targetAmount: 30000,
    collectedAmount: 18500,
    currency: 'TRY',
    startDate: '2024-01-01',
    isActive: true,
    priority: 'kritik',
    allowedPaymentMethods: ['Nakit', 'Banka', 'Kredi Kartı'],
    autoAllocation: false,
    responsiblePerson: 'Dr. Mehmet Öz',
    approvalRequired: true,
    donationCount: 67,
    lastDonationDate: '2024-01-12',
    notes: 'Acil tedavi durumları öncelikli',
    createdDate: '2024-01-01',
    createdBy: 'Admin'
  },
  {
    id: '4',
    code: 'KURBAN2024',
    name: 'Kurban Bağışları 2024',
    description: '2024 yılı kurban bağışları ve organizasyonu',
    category: 'kurban',
    targetAmount: 80000,
    collectedAmount: 45000,
    currency: 'TRY',
    startDate: '2024-03-01',
    endDate: '2024-07-31',
    isActive: true,
    priority: 'yüksek',
    allowedPaymentMethods: ['Nakit', 'Banka', 'Kredi Kartı', 'Online'],
    autoAllocation: true,
    allocationRules: 'Kurban bağışları otomatik olarak bu fona aktarılır',
    responsiblePerson: 'Ali Demir',
    approvalRequired: false,
    donationCount: 156,
    lastDonationDate: '2024-01-14',
    createdDate: '2024-03-01',
    createdBy: 'Admin'
  },
  {
    id: '5',
    code: 'RAMAZAN2024',
    name: 'Ramazan Yardımları 2024',
    description: 'Ramazan ayı gıda kolisi ve iftar organizasyonları',
    category: 'ramazan',
    targetAmount: 60000,
    collectedAmount: 25000,
    currency: 'TRY',
    startDate: '2024-02-01',
    endDate: '2024-05-31',
    isActive: true,
    priority: 'yüksek',
    allowedPaymentMethods: ['Nakit', 'Banka', 'Online'],
    autoAllocation: false,
    responsiblePerson: 'Fatma Şahin',
    approvalRequired: false,
    donationCount: 98,
    lastDonationDate: '2024-01-11',
    notes: 'Gıda kolisi ve iftar organizasyonu',
    createdDate: '2024-02-01',
    createdBy: 'Admin'
  }
]

export default function FundingDefinitions() {
  const [fundingDefinitions, setFundingDefinitions] = useState<FundingDefinition[]>(mockFundingDefinitions)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDefinition, setEditingDefinition] = useState<FundingDefinition | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'genel' as FundingDefinition['category'],
    targetAmount: '',
    currency: 'TRY' as FundingDefinition['currency'],
    startDate: '',
    endDate: '',
    priority: 'orta' as FundingDefinition['priority'],
    allowedPaymentMethods: [] as string[],
    autoAllocation: false,
    allocationRules: '',
    responsiblePerson: '',
    approvalRequired: false,
    notes: ''
  })

  const filteredDefinitions = useMemo(() => {
    return fundingDefinitions.filter(definition => {
      const matchesQuery = JSON.stringify(definition).toLowerCase().includes(query.toLowerCase())
      const matchesCategory = !categoryFilter || definition.category === categoryFilter
      const matchesStatus = !statusFilter || 
        (statusFilter === 'aktif' && definition.isActive) ||
        (statusFilter === 'pasif' && !definition.isActive)
      
      return matchesQuery && matchesCategory && matchesStatus
    })
  }, [fundingDefinitions, query, categoryFilter, statusFilter])

  const totalTarget = filteredDefinitions.reduce((sum, def) => sum + (def.targetAmount || 0), 0)
  const totalCollected = filteredDefinitions.reduce((sum, def) => sum + def.collectedAmount, 0)
  const activeCount = filteredDefinitions.filter(def => def.isActive).length


  const columns: Column<FundingDefinition>[] = [
    { key: 'code', header: 'Kod' },
    { key: 'name', header: 'Fon Adı' },
    { 
      key: 'category', 
      header: 'Kategori',
      render: (_, definition: FundingDefinition) => (
        <span className={`px-2 py-1 rounded text-xs ${
          definition.category === 'genel' ? 'bg-gray-100 text-gray-800' :
          definition.category === 'eğitim' ? 'bg-blue-100 text-blue-800' :
          definition.category === 'sağlık' ? 'bg-red-100 text-red-800' :
          definition.category === 'gıda' ? 'bg-green-100 text-green-800' :
          definition.category === 'kurban' ? 'bg-purple-100 text-purple-800' :
          definition.category === 'ramazan' ? 'bg-yellow-100 text-yellow-800' :
          definition.category === 'acil' ? 'bg-red-100 text-red-800' :
          'bg-indigo-100 text-indigo-800'
        }`}>
          {definition.category}
        </span>
      )
    },
    { 
      key: 'targetAmount', 
      header: 'Hedef',
      render: (_, definition: FundingDefinition) => definition.targetAmount ? `${definition.targetAmount.toLocaleString('tr-TR')} ${definition.currency}` : '-'
    },
    { 
      key: 'collectedAmount', 
      header: 'Toplanan',
      render: (_, definition: FundingDefinition) => `${definition.collectedAmount.toLocaleString('tr-TR')} ${definition.currency}`
    },
    { 
      key: 'targetAmount', 
      header: 'İlerleme',
      render: (_, definition: FundingDefinition) => {
        if (!definition.targetAmount) return '-'
        const percentage = Math.round((definition.collectedAmount / definition.targetAmount) * 100)
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm">{percentage}%</span>
          </div>
        )
      }
    },
    { 
      key: 'priority', 
      header: 'Öncelik',
      render: (_, definition: FundingDefinition) => (
        <span className={`px-2 py-1 rounded text-xs ${
          definition.priority === 'kritik' ? 'bg-red-100 text-red-800' :
          definition.priority === 'yüksek' ? 'bg-orange-100 text-orange-800' :
          definition.priority === 'orta' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {definition.priority}
        </span>
      )
    },
    { key: 'donationCount', header: 'Bağış Sayısı' },
    { key: 'responsiblePerson', header: 'Sorumlu' },
    { 
      key: 'isActive', 
      header: 'Durum',
      render: (_, definition: FundingDefinition) => (
        <span className={`px-2 py-1 rounded text-xs ${
          definition.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {definition.isActive ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, definition: FundingDefinition) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(definition)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleToggleStatus(definition.id)}
            className={`text-sm ${
              definition.isActive
                ? 'text-red-600 hover:text-red-800'
                : 'text-green-600 hover:text-green-800'
            }`}
          >
            {definition.isActive ? 'Pasifleştir' : 'Aktifleştir'}
          </button>
          <button
            onClick={() => handleDelete(definition.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Sil
          </button>
        </div>
      )
    }
  ]

  const handleEdit = (definition: FundingDefinition) => {
    setEditingDefinition(definition)
    setFormData({
      code: definition.code,
      name: definition.name,
      description: definition.description,
      category: definition.category,
      targetAmount: definition.targetAmount?.toString() || '',
      currency: definition.currency,
      startDate: definition.startDate || '',
      endDate: definition.endDate || '',
      priority: definition.priority,
      allowedPaymentMethods: definition.allowedPaymentMethods,
      autoAllocation: definition.autoAllocation,
      allocationRules: definition.allocationRules || '',
      responsiblePerson: definition.responsiblePerson,
      approvalRequired: definition.approvalRequired,
      notes: definition.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleToggleStatus = (id: string) => {
    setFundingDefinitions(fundingDefinitions.map(definition => 
      definition.id === id 
        ? { ...definition, isActive: !definition.isActive }
        : definition
    ))
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu fonlama tanımını silmek istediğinizden emin misiniz?')) {
      setFundingDefinitions(fundingDefinitions.filter(definition => definition.id !== id))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    if (editingDefinition) {
      // Güncelleme
      setFundingDefinitions(fundingDefinitions.map(definition => 
        definition.id === editingDefinition.id 
          ? { 
              ...definition, 
              ...formData,
              targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined
            }
          : definition
      ))
    } else {
      // Yeni ekleme
      const newDefinition: FundingDefinition = {
        id: Date.now().toString(),
        ...formData,
        targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        collectedAmount: 0,
        isActive: true,
        donationCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: 'Admin' // Bu gerçek uygulamada oturum açan kullanıcıdan gelecek
      }
      setFundingDefinitions([...fundingDefinitions, newDefinition])
    }
    
    setIsModalOpen(false)
    setEditingDefinition(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'genel',
      targetAmount: '',
      currency: 'TRY',
      startDate: '',
      endDate: '',
      priority: 'orta',
      allowedPaymentMethods: [],
      autoAllocation: false,
      allocationRules: '',
      responsiblePerson: '',
      approvalRequired: false,
      notes: ''
    })
  }

  const openAddModal = () => {
    setEditingDefinition(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        allowedPaymentMethods: [...formData.allowedPaymentMethods, method]
      })
    } else {
      setFormData({
        ...formData,
        allowedPaymentMethods: formData.allowedPaymentMethods.filter(m => m !== method)
      })
    }
  }

  const paymentMethods = ['Nakit', 'Banka', 'Kredi Kartı', 'Online', 'Çek', 'Havale']

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Fonlama Tanımları</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Fonlama Tanımı
          </button>
        </div>

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Toplam Fon</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredDefinitions.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Aktif Fon</h3>
            <p className="text-2xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Toplam Hedef</h3>
            <p className="text-2xl font-bold text-purple-900">{totalTarget.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600">Toplanan</h3>
            <p className="text-2xl font-bold text-orange-900">{totalCollected.toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>

        {/* Kategori Dağılımı */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Kategori Dağılımı</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {['genel', 'eğitim', 'sağlık', 'gıda', 'kurban', 'ramazan', 'acil', 'proje'].map((category) => {
              const count = filteredDefinitions.filter(def => def.category === category).length
              const amount = filteredDefinitions
                .filter(def => def.category === category)
                .reduce((sum, def) => sum + def.collectedAmount, 0)
              
              return (
                <div key={category} className="border rounded-lg p-3 text-center">
                  <h4 className="font-medium capitalize text-sm">{category}</h4>
                  <p className="text-xs text-gray-600">{count} fon</p>
                  <p className="text-sm font-bold">{amount.toLocaleString('tr-TR')} ₺</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex items-center gap-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Fon adı, kod, sorumlu ile ara..."
          />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="genel">Genel</option>
            <option value="eğitim">Eğitim</option>
            <option value="sağlık">Sağlık</option>
            <option value="gıda">Gıda</option>
            <option value="kurban">Kurban</option>
            <option value="ramazan">Ramazan</option>
            <option value="acil">Acil</option>
            <option value="proje">Proje</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            placeholder="Başlangıç tarihi"
          />
          <button
            onClick={() => {
              // exportToCsv('fonlama-tanimlari.csv', filteredDefinitions)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Excel İndir
          </button>
        </div>

        <DataTable columns={columns} data={filteredDefinitions} />
      </div>

      {/* Fonlama Tanımı Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDefinition ? 'Fonlama Tanımı Düzenle' : 'Yeni Fonlama Tanımı'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fon Kodu *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="GENEL001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as FundingDefinition['category']})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="genel">Genel</option>
                <option value="eğitim">Eğitim</option>
                <option value="sağlık">Sağlık</option>
                <option value="gıda">Gıda</option>
                <option value="kurban">Kurban</option>
                <option value="ramazan">Ramazan</option>
                <option value="acil">Acil</option>
                <option value="proje">Proje</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Fon Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="Genel Bağış Fonu"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Açıklama *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Fonun amacı ve kullanım alanları..."
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hedef Tutar</label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="100000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as FundingDefinition['currency']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Öncelik</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as FundingDefinition['priority']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="düşük">Düşük</option>
                <option value="orta">Orta</option>
                <option value="yüksek">Yüksek</option>
                <option value="kritik">Kritik</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Başlangıç Tarihi</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
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
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">İzin Verilen Ödeme Yöntemleri</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowedPaymentMethods.includes(method)}
                    onChange={(e) => handlePaymentMethodChange(method, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">{method}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.autoAllocation}
                onChange={(e) => setFormData({...formData, autoAllocation: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Otomatik Tahsis</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.approvalRequired}
                onChange={(e) => setFormData({...formData, approvalRequired: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Onay Gerekli</span>
            </label>
          </div>
          
          {formData.autoAllocation && (
            <div>
              <label className="block text-sm font-medium mb-1">Tahsis Kuralları</label>
              <textarea
                value={formData.allocationRules}
                onChange={(e) => setFormData({...formData, allocationRules: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={2}
                placeholder="Otomatik tahsis kurallarını açıklayın..."
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={2}
              placeholder="Ek bilgiler ve notlar..."
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
              {editingDefinition ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
