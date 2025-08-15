import React, { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import LazyCameraScanner from '@components/LazyCameraScanner'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { exportDonationsToExcel } from '@utils/excelExport'
import { exportDonationsToPDF } from '@utils/pdfExport'
import { log } from '@/utils/logger'

interface BankDonation {
  id: string
  date: string
  transactionDate: string
  donorName: string
  donorIban?: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  bankName: string
  accountName: string
  transactionRef: string
  description: string
  purpose: string
  status: 'onaylandı' | 'beklemede' | 'iptal' | 'eşleştirildi'
  matchedDonor?: string
  notes?: string
}

const mockBankDonations: BankDonation[] = [
  {
    id: '1',
    date: '2024-01-15',
    transactionDate: '2024-01-15',
    donorName: 'Mehmet Yılmaz',
    donorIban: 'TR33 0006 1005 1978 6457 8413 26',
    amount: 2500,
    currency: 'TRY',
    bankName: 'Ziraat Bankası',
    accountName: 'Dernek Genel Hesap',
    transactionRef: 'TXN123456789',
    description: 'EFT Gönderimi',
    purpose: 'Genel Bağış',
    status: 'eşleştirildi',
    matchedDonor: 'Mehmet Yılmaz',
    notes: 'Düzenli bağışçı'
  },
  {
    id: '2',
    date: '2024-01-14',
    transactionDate: '2024-01-14',
    donorName: 'Bilinmeyen',
    amount: 1000,
    currency: 'TRY',
    bankName: 'İş Bankası',
    accountName: 'Dernek Eğitim Hesap',
    transactionRef: 'TXN987654321',
    description: 'Havale',
    purpose: 'Belirsiz',
    status: 'beklemede',
    notes: 'Bağışçı bilgisi eksik'
  }
]

const bankAccounts = [
  { name: 'Dernek Genel Hesap', iban: 'TR33 0006 1005 1978 6457 8413 26', bank: 'Ziraat Bankası' },
  { name: 'Dernek Eğitim Hesap', iban: 'TR64 0001 2009 4520 0058 0012 34', bank: 'İş Bankası' },
  { name: 'Dernek Sağlık Hesap', iban: 'TR98 0004 6007 8800 0000 1234 56', bank: 'Akbank' }
]

export default function BankDonations() {
  const [donations, setDonations] = useState<BankDonation[]>(mockBankDonations)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<BankDonation | null>(null)
  const [matchingDonation, setMatchingDonation] = useState<BankDonation | null>(null)
  const [formData, setFormData] = useState({
    donorName: '',
    donorIban: '',
    amount: '',
    currency: 'TRY' as BankDonation['currency'],
    bankName: '',
    accountName: '',
    transactionRef: '',
    description: '',
    purpose: '',
    notes: ''
  })
  const [matchData, setMatchData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    purpose: ''
  })
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const filteredDonations = useMemo(() => 
    donations.filter(donation => 
      JSON.stringify(donation).toLowerCase().includes(query.toLowerCase())
    ), [donations, query]
  )

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)
  const pendingCount = filteredDonations.filter(d => d.status === 'beklemede').length

  const columns: Column<BankDonation>[] = [
    { key: 'transactionDate', header: 'İşlem Tarihi' },
    { key: 'transactionRef', header: 'Referans No' },
    { key: 'donorName', header: 'Gönderen' },
    {
      key: 'amount',
      header: 'Tutar',
      render: (_, donation: BankDonation) => `${donation.amount.toLocaleString('tr-TR')} ${donation.currency}`
    },
    { key: 'bankName', header: 'Banka' },
    { key: 'accountName', header: 'Hesap' },
    { key: 'description', header: 'Açıklama' },
    { key: 'purpose', header: 'Amaç' },
    {
      key: 'status',
      header: 'Durum',
      render: (_, donation: BankDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          donation.status === 'eşleştirildi' ? 'bg-green-100 text-green-800' :
          donation.status === 'onaylandı' ? 'bg-blue-100 text-blue-800' :
          donation.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {donation.status}
        </span>
      )
    },
    { 
      key: 'id',
      header: 'İşlemler',
      render: (_, donation: BankDonation) => (
        <div className="flex gap-2">
          {donation.status === 'beklemede' && (
            <button
              onClick={() => handleMatch(donation)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Eşleştir
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
    },
  ]

  const handleEdit = (donation: BankDonation) => {
    setEditingDonation(donation)
    setFormData({
      donorName: donation.donorName,
      donorIban: donation.donorIban || '',
      amount: donation.amount.toString(),
      currency: donation.currency,
      bankName: donation.bankName,
      accountName: donation.accountName,
      transactionRef: donation.transactionRef,
      description: donation.description,
      purpose: donation.purpose,
      notes: donation.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleMatch = (donation: BankDonation) => {
    setMatchingDonation(donation)
    setMatchData({
      donorName: donation.donorName !== 'Bilinmeyen' ? donation.donorName : '',
      donorPhone: '',
      donorEmail: '',
      purpose: donation.purpose !== 'Belirsiz' ? donation.purpose : ''
    })
    setIsMatchModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu banka bağışını silmek istediğinizden emin misiniz?')) {
      setDonations(donations.filter(donation => donation.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingDonation) {
      // Güncelleme
      setDonations(donations.map(donation => 
        donation.id === editingDonation.id 
          ? { 
              ...donation, 
              ...formData,
              amount: parseFloat(formData.amount)
            }
          : donation
      ))
    } else {
      // Yeni ekleme
      const newDonation: BankDonation = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        transactionDate: new Date().toISOString().split('T')[0],
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'onaylandı'
      }
      setDonations([...donations, newDonation])
    }
    
    setIsModalOpen(false)
    setEditingDonation(null)
    resetForm()
  }

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (matchingDonation) {
      setDonations(donations.map(donation => 
        donation.id === matchingDonation.id 
          ? { 
              ...donation,
              donorName: matchData.donorName,
              purpose: matchData.purpose,
              status: 'eşleştirildi',
              matchedDonor: matchData.donorName
            }
          : donation
      ))
    }
    
    setIsMatchModalOpen(false)
    setMatchingDonation(null)
    setMatchData({
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      purpose: ''
    })
  }

  const resetForm = () => {
    setFormData({
      donorName: '',
      donorIban: '',
      amount: '',
      currency: 'TRY',
      bankName: '',
      accountName: '',
      transactionRef: '',
      description: '',
      purpose: '',
      notes: ''
    })
  }

  const handleScanResult = (data: { donorName?: string; donorIban?: string; amount?: number; currency?: string; bankName?: string; transactionRef?: string; description?: string; purpose?: string; notes?: string; firstName?: string; lastName?: string; idNumber?: string; passportNumber?: string; phone?: string; address?: string; birthDate?: string }) => {
    if (data) {
      // QR kod, barkod veya OCR verilerini form alanlarına doldur
      if (data.donorName != null) setFormData(prev => ({ ...prev, donorName: data.donorName ?? prev.donorName }))
      if (data.donorIban != null) setFormData(prev => ({ ...prev, donorIban: data.donorIban ?? prev.donorIban }))
      if (data.amount != null) setFormData(prev => ({ ...prev, amount: (data.amount ?? Number(prev.amount || 0)).toString() }))
      if (data.currency != null) setFormData(prev => ({ ...prev, currency: (['TRY','USD','EUR'] as const).includes(data.currency as any) ? (data.currency as BankDonation['currency']) : prev.currency }))
      if (data.bankName != null) setFormData(prev => ({ ...prev, bankName: data.bankName ?? prev.bankName }))
      if (data.transactionRef != null) setFormData(prev => ({ ...prev, transactionRef: data.transactionRef ?? prev.transactionRef }))
      if (data.description != null) setFormData(prev => ({ ...prev, description: data.description ?? prev.description }))
      if (data.purpose != null) setFormData(prev => ({ ...prev, purpose: data.purpose ?? prev.purpose }))
      if (data.notes != null) setFormData(prev => ({ ...prev, notes: data.notes ?? prev.notes }))
      
      // OCR'dan gelen kimlik/pasaport verileri
      if (data.firstName && data.lastName) {
        setFormData(prev => ({ ...prev, donorName: `${data.firstName} ${data.lastName}` }))
      }
      if (data.idNumber) {
        setFormData(prev => ({ ...prev, description: `TC: ${data.idNumber}` }))
      }
      if (data.passportNumber) {
        setFormData(prev => ({ ...prev, description: `Pasaport: ${data.passportNumber}` }))
      }
      if (data.phone) {
        setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} | Tel: ${data.phone}` : `Tel: ${data.phone}` }))
      }
      if (data.address) {
        setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} | Adres: ${data.address}` : `Adres: ${data.address}` }))
      }
      if (data.birthDate) {
        setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} | Doğum: ${data.birthDate}` : `Doğum: ${data.birthDate}` }))
      }
      
      setIsScannerOpen(false)
    }
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
          <h2 className="text-xl font-semibold">Banka Bağışları</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Banka Bağışı
          </button>
        </div>

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Toplam Bağış</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredDonations.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Toplam Tutar</h3>
            <p className="text-2xl font-bold text-green-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-600">Bekleyen</h3>
            <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Bugünkü</h3>
            <p className="text-2xl font-bold text-purple-900">1</p>
          </div>
        </div>

        {/* Banka Hesapları */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Banka Hesaplarımız</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bankAccounts.map((account, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium">{account.name}</h4>
                <p className="text-sm text-gray-600">{account.bank}</p>
                <p className="text-sm font-mono">{account.iban}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex items-center gap-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Gönderen, referans no, banka ile ara..."
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Durumlar</option>
            <option value="eşleştirildi">Eşleştirildi</option>
            <option value="onaylandı">Onaylandı</option>
            <option value="beklemede">Beklemede</option>
            <option value="iptal">İptal</option>
          </select>
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Bankalar</option>
            <option value="Ziraat Bankası">Ziraat Bankası</option>
            <option value="İş Bankası">İş Bankası</option>
            <option value="Akbank">Akbank</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                // exportToCsv('banka-bagislar.csv', filteredDonations)
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <FileText size={16} />
              CSV İndir
            </button>
            <button
              onClick={() => exportDonationsToExcel(filteredDonations, { type: 'bank' })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              Excel İndir
            </button>
            <button
              onClick={() => exportDonationsToPDF(filteredDonations, { type: 'bank' })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <FileText size={16} />
              PDF İndir
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredDonations} />
      </div>

      {/* Banka Bağışı Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDonation ? 'Banka Bağışı Düzenle' : 'Yeni Banka Bağışı'}
      >
        {isScannerOpen && (
          <div className="mb-4">
            <LazyCameraScanner
              onScanResult={handleScanResult}
              onError={(error: string) => log.error('Tarama hatası:', error)}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gönderen Adı</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gönderen IBAN</label>
              <input
                type="text"
                value={formData.donorIban}
                onChange={(e) => setFormData({...formData, donorIban: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="TR33 0006 1005 1978 6457 8413 26"
              />
            </div>
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
                onChange={(e) => setFormData({...formData, currency: e.target.value as BankDonation['currency']})}
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
              <label className="block text-sm font-medium mb-1">Alıcı Hesap</label>
              <select
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seçiniz</option>
                {bankAccounts.map((account, index) => (
                  <option key={index} value={account.name}>{account.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Referans No</label>
            <input
              type="text"
              value={formData.transactionRef}
              onChange={(e) => setFormData({...formData, transactionRef: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İşlem Açıklaması</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="EFT, Havale, vb."
            />
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

      {/* Bağışçı Eşleştirme Modal */}
      <Modal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        title="Bağışçı Eşleştir"
      >
        <form onSubmit={handleMatchSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">İşlem Bilgileri</h4>
            <p><strong>Tutar:</strong> {matchingDonation?.amount.toLocaleString('tr-TR')} {matchingDonation?.currency}</p>
            <p><strong>Referans:</strong> {matchingDonation?.transactionRef}</p>
            <p><strong>Tarih:</strong> {matchingDonation?.transactionDate}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bağışçı Adı</label>
            <input
              type="text"
              value={matchData.donorName}
              onChange={(e) => setMatchData({...matchData, donorName: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={matchData.donorPhone}
              onChange={(e) => setMatchData({...matchData, donorPhone: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={matchData.donorEmail}
              onChange={(e) => setMatchData({...matchData, donorEmail: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bağış Amacı</label>
            <select
              value={matchData.purpose}
              onChange={(e) => setMatchData({...matchData, purpose: e.target.value})}
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
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsMatchModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Eşleştir
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
