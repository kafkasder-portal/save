import React, { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

interface CreditCardDonation {
  id: string
  date: string
  donorName: string
  donorPhone?: string
  donorEmail?: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  cardNumber: string // Masked
  cardType: 'Visa' | 'Mastercard' | 'Troy' | 'American Express'
  bankName: string
  transactionId: string
  authCode: string
  installments: number
  purpose: string
  status: 'başarılı' | 'beklemede' | 'başarısız' | 'iade'
  commission: number
  netAmount: number
  notes?: string
}

const mockCreditCardDonations: CreditCardDonation[] = [
  {
    id: '1',
    date: '2024-01-15',
    donorName: 'Ayşe Demir',
    donorPhone: '+90 532 123 4567',
    donorEmail: 'ayse.demir@email.com',
    amount: 500,
    currency: 'TRY',
    cardNumber: '****-****-****-1234',
    cardType: 'Visa',
    bankName: 'İş Bankası',
    transactionId: 'TXN789123456',
    authCode: 'AUTH123',
    installments: 1,
    purpose: 'Eğitim Yardımı',
    status: 'başarılı',
    commission: 15,
    netAmount: 485,
    notes: 'Online bağış'
  },
  {
    id: '2',
    date: '2024-01-14',
    donorName: 'Mehmet Kaya',
    donorPhone: '+90 533 987 6543',
    amount: 1000,
    currency: 'TRY',
    cardNumber: '****-****-****-5678',
    cardType: 'Mastercard',
    bankName: 'Garanti BBVA',
    transactionId: 'TXN456789123',
    authCode: 'AUTH456',
    installments: 3,
    purpose: 'Genel Bağış',
    status: 'başarılı',
    commission: 30,
    netAmount: 970
  },
  {
    id: '3',
    date: '2024-01-13',
    donorName: 'Fatma Özkan',
    donorEmail: 'fatma.ozkan@email.com',
    amount: 250,
    currency: 'TRY',
    cardNumber: '****-****-****-9012',
    cardType: 'Troy',
    bankName: 'Ziraat Bankası',
    transactionId: 'TXN321654987',
    authCode: 'AUTH789',
    installments: 1,
    purpose: 'Kurban',
    status: 'beklemede',
    commission: 7.5,
    netAmount: 242.5
  }
]

export default function CreditCardDonations() {
  const [donations, setDonations] = useState<CreditCardDonation[]>(mockCreditCardDonations)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<CreditCardDonation | null>(null)
  const [refundingDonation, setRefundingDonation] = useState<CreditCardDonation | null>(null)
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    amount: '',
    currency: 'TRY' as CreditCardDonation['currency'],
    cardNumber: '',
    cardType: 'Visa' as CreditCardDonation['cardType'],
    bankName: '',
    transactionId: '',
    authCode: '',
    installments: '1',
    purpose: '',
    notes: ''
  })
  const [refundData, setRefundData] = useState({
    refundAmount: '',
    refundReason: '',
    refundNotes: ''
  })

  const filteredDonations = useMemo(() => 
    donations.filter(donation => 
      JSON.stringify(donation).toLowerCase().includes(query.toLowerCase())
    ), [donations, query]
  )

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const totalCommission = filteredDonations.reduce((sum, donation) => sum + donation.commission, 0)
  const totalNetAmount = filteredDonations.reduce((sum, donation) => sum + donation.netAmount, 0)


  const columns: Column<CreditCardDonation>[] = [
    { key: 'date', header: 'Tarih' },
    { key: 'transactionId', header: 'İşlem No' },
    { key: 'donorName', header: 'Bağışçı' },
    { key: 'cardNumber', header: 'Kart No' },
    { 
      key: 'cardType', 
      header: 'Kart Tipi',
      render: (_, donation: CreditCardDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          donation.cardType === 'Visa' ? 'bg-blue-100 text-blue-800' :
          donation.cardType === 'Mastercard' ? 'bg-red-100 text-red-800' :
          donation.cardType === 'Troy' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {donation.cardType}
        </span>
      )
    },
    { 
      key: 'amount', 
      header: 'Tutar',
      render: (_, donation: CreditCardDonation) => `${donation.amount.toLocaleString('tr-TR')} ${donation.currency}`
    },
    { 
      key: 'installments', 
      header: 'Taksit',
      render: (_, donation: CreditCardDonation) => donation.installments === 1 ? 'Peşin' : `${donation.installments} Taksit`
    },
    { 
      key: 'commission', 
      header: 'Komisyon',
      render: (_, donation: CreditCardDonation) => `${donation.commission.toLocaleString('tr-TR')} ₺`
    },
    { 
      key: 'netAmount', 
      header: 'Net Tutar',
      render: (_, donation: CreditCardDonation) => `${donation.netAmount.toLocaleString('tr-TR')} ₺`
    },
    { key: 'purpose', header: 'Amaç' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (_, donation: CreditCardDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          donation.status === 'başarılı' ? 'bg-green-100 text-green-800' :
          donation.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
          donation.status === 'başarısız' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {donation.status}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, donation: CreditCardDonation) => (
        <div className="flex gap-2">
          {donation.status === 'başarılı' && (
            <button
              onClick={() => handleRefund(donation)}
              className="text-orange-600 hover:text-orange-800 text-sm"
            >
              İade
            </button>
          )}
          <button
            onClick={() => handleEdit(donation)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleDelete(donation.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Sil
          </button>
        </div>
      )
    }
  ]

  const handleEdit = (donation: CreditCardDonation) => {
    setEditingDonation(donation)
    setFormData({
      donorName: donation.donorName,
      donorPhone: donation.donorPhone || '',
      donorEmail: donation.donorEmail || '',
      amount: donation.amount.toString(),
      currency: donation.currency,
      cardNumber: donation.cardNumber,
      cardType: donation.cardType,
      bankName: donation.bankName,
      transactionId: donation.transactionId,
      authCode: donation.authCode,
      installments: donation.installments.toString(),
      purpose: donation.purpose,
      notes: donation.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleRefund = (donation: CreditCardDonation) => {
    setRefundingDonation(donation)
    setRefundData({
      refundAmount: donation.amount.toString(),
      refundReason: '',
      refundNotes: ''
    })
    setIsRefundModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu kredi kartı bağışını silmek istediğinizden emin misiniz?')) {
      setDonations(donations.filter(donation => donation.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(formData.amount)
    const commission = amount * 0.03 // %3 komisyon
    const netAmount = amount - commission
    
    if (editingDonation) {
      // Güncelleme
      setDonations(donations.map(donation => 
        donation.id === editingDonation.id 
          ? { 
              ...donation, 
              ...formData,
              amount,
              installments: parseInt(formData.installments),
              commission,
              netAmount
            }
          : donation
      ))
    } else {
      // Yeni ekleme
      const newDonation: CreditCardDonation = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...formData,
        amount,
        installments: parseInt(formData.installments),
        commission,
        netAmount,
        status: 'başarılı'
      }
      setDonations([...donations, newDonation])
    }
    
    setIsModalOpen(false)
    setEditingDonation(null)
    resetForm()
  }

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (refundingDonation) {
      setDonations(donations.map(donation => 
        donation.id === refundingDonation.id 
          ? { 
              ...donation,
              status: 'iade',
              notes: `İade: ${refundData.refundReason}. ${refundData.refundNotes}`
            }
          : donation
      ))
    }
    
    setIsRefundModalOpen(false)
    setRefundingDonation(null)
    setRefundData({
      refundAmount: '',
      refundReason: '',
      refundNotes: ''
    })
  }

  const resetForm = () => {
    setFormData({
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      amount: '',
      currency: 'TRY',
      cardNumber: '',
      cardType: 'Visa',
      bankName: '',
      transactionId: '',
      authCode: '',
      installments: '1',
      purpose: '',
      notes: ''
    })
  }

  const openAddModal = () => {
    setEditingDonation(null)
    resetForm()
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Kredi Kartı Bağışları</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Kredi Kartı Bağışı
          </button>
        </div>

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Toplam İşlem</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredDonations.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Brüt Tutar</h3>
            <p className="text-2xl font-bold text-green-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600">Komisyon</h3>
            <p className="text-2xl font-bold text-orange-900">{totalCommission.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Net Tutar</h3>
            <p className="text-2xl font-bold text-purple-900">{totalNetAmount.toLocaleString('tr-TR')} ₺</p>
          </div>
        </div>

        {/* Kart Tipi Dağılımı */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Kart Tipi Dağılımı</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Visa', 'Mastercard', 'Troy', 'American Express'].map((cardType) => {
              const count = filteredDonations.filter(d => d.cardType === cardType).length
              const amount = filteredDonations
                .filter(d => d.cardType === cardType)
                .reduce((sum, d) => sum + d.amount, 0)
              
              return (
                <div key={cardType} className="border rounded-lg p-4">
                  <h4 className="font-medium">{cardType}</h4>
                  <p className="text-sm text-gray-600">{count} işlem</p>
                  <p className="text-lg font-bold">{amount.toLocaleString('tr-TR')} ₺</p>
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
            placeholder="Bağışçı, kart no, işlem no ile ara..."
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Durumlar</option>
            <option value="başarılı">Başarılı</option>
            <option value="beklemede">Beklemede</option>
            <option value="başarısız">Başarısız</option>
            <option value="iade">İade</option>
          </select>
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Kart Tipleri</option>
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="Troy">Troy</option>
            <option value="American Express">American Express</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
          />
          <button
            onClick={() => {
              // exportToCsv('kredi-karti-bagislar.csv', filteredDonations)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Excel İndir
          </button>
        </div>

        <DataTable columns={columns} data={filteredDonations} />
      </div>

      {/* Kredi Kartı Bağışı Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDonation ? 'Kredi Kartı Bağışı Düzenle' : 'Yeni Kredi Kartı Bağışı'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bağışçı Adı</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.donorPhone}
                onChange={(e) => setFormData({...formData, donorPhone: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={formData.donorEmail}
              onChange={(e) => setFormData({...formData, donorEmail: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tutar</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value as CreditCardDonation['currency']})}
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
              <label className="block text-sm font-medium mb-1">Kart Numarası (Maskelenmiş)</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="****-****-****-1234"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kart Tipi</label>
              <select
                value={formData.cardType}
                onChange={(e) => setFormData({...formData, cardType: e.target.value as CreditCardDonation['cardType']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Troy">Troy</option>
                <option value="American Express">American Express</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Banka</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Taksit Sayısı</label>
              <select
                value={formData.installments}
                onChange={(e) => setFormData({...formData, installments: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="1">Peşin</option>
                <option value="2">2 Taksit</option>
                <option value="3">3 Taksit</option>
                <option value="6">6 Taksit</option>
                <option value="9">9 Taksit</option>
                <option value="12">12 Taksit</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">İşlem No</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Yetki Kodu</label>
              <input
                type="text"
                value={formData.authCode}
                onChange={(e) => setFormData({...formData, authCode: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bağış Amacı</label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData({...formData, purpose: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seçiniz</option>
              <option value="Genel Bağış">Genel Bağış</option>
              <option value="Eğitim Yardımı">Eğitim Yardımı</option>
              <option value="Sağlık Yardımı">Sağlık Yardımı</option>
              <option value="Gıda Yardımı">Gıda Yardımı</option>
              <option value="Kurban">Kurban</option>
              <option value="Ramazan">Ramazan</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
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
              {editingDonation ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* İade Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Kredi Kartı İadesi"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">İşlem Bilgileri</h4>
            <p><strong>Bağışçı:</strong> {refundingDonation?.donorName}</p>
            <p><strong>Tutar:</strong> {refundingDonation?.amount.toLocaleString('tr-TR')} {refundingDonation?.currency}</p>
            <p><strong>İşlem No:</strong> {refundingDonation?.transactionId}</p>
            <p><strong>Kart:</strong> {refundingDonation?.cardNumber}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İade Tutarı</label>
            <input
              type="number"
              step="0.01"
              value={refundData.refundAmount}
              onChange={(e) => setRefundData({...refundData, refundAmount: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İade Sebebi</label>
            <select
              value={refundData.refundReason}
              onChange={(e) => setRefundData({...refundData, refundReason: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seçiniz</option>
              <option value="Bağışçı Talebi">Bağışçı Talebi</option>
              <option value="Teknik Hata">Teknik Hata</option>
              <option value="Yanlış İşlem">Yanlış İşlem</option>
              <option value="İptal Talebi">İptal Talebi</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İade Notları</label>
            <textarea
              value={refundData.refundNotes}
              onChange={(e) => setRefundData({...refundData, refundNotes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="İade ile ilgili ek bilgiler..."
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              İade İşlemini Başlat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
