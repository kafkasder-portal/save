import React, { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
// import LazyCameraScanner from '@components/LazyCameraScanner'
import { Camera, FileSpreadsheet, FileText } from 'lucide-react'
// import { exportApplicationsToExcel } from '../../utils/excelExport'
// import { exportDonationsToPDF } from '@utils/lazyPdfExport'

interface CashDonation {
  id: string
  date: string
  donorName: string
  donorPhone: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  purpose: string
  receiptNo: string
  receivedBy: string
  notes?: string
  status: 'onaylandı' | 'beklemede' | 'iptal'
}

const mockCashDonations: CashDonation[] = [
  {
    id: '1',
    date: '2024-01-15',
    donorName: 'Ahmet Yılmaz',
    donorPhone: '0532 123 4567',
    amount: 1000,
    currency: 'TRY',
    purpose: 'Genel Bağış',
    receiptNo: 'NAK-2024-001',
    receivedBy: 'Fatma Demir',
    notes: 'Nakit olarak teslim alındı',
    status: 'onaylandı'
  },
  {
    id: '2',
    date: '2024-01-14',
    donorName: 'Zeynep Kaya',
    donorPhone: '0543 987 6543',
    amount: 500,
    currency: 'TRY',
    purpose: 'Eğitim Yardımı',
    receiptNo: 'NAK-2024-002',
    receivedBy: 'Mehmet Özkan',
    status: 'onaylandı'
  }
]

export default function CashDonations() {
  const [donations, setDonations] = useState<CashDonation[]>(mockCashDonations)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<CashDonation | null>(null)
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    amount: '',
    currency: 'TRY' as CashDonation['currency'],
    purpose: '',
    notes: ''
  })
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const filteredDonations = useMemo(() => 
    donations.filter(donation => 
      JSON.stringify(donation).toLowerCase().includes(query.toLowerCase())
    ), [donations, query]
  )

  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)

  const columns: Column<CashDonation>[] = [
    { key: 'date', header: 'Tarih' },
    { key: 'receiptNo', header: 'Fiş No' },
    { key: 'donorName', header: 'Bağışçı Adı' },
    { key: 'donorPhone', header: 'Telefon' },
    {
      key: 'amount',
      header: 'Tutar',
      render: (_, row: CashDonation) => `${row.amount.toLocaleString('tr-TR')} ${row.currency}`
    },
    { key: 'purpose', header: 'Amaç' },
    { key: 'receivedBy', header: 'Teslim Alan' },
    {
      key: 'status',
      header: 'Durum',
      render: (_, row: CashDonation) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'onaylandı' ? 'bg-green-100 text-green-800' :
          row.status === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, row: CashDonation) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handlePrint(row)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            Yazdır
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Sil
          </button>
        </div>
      )
    }
  ]

  const handleEdit = (donation: CashDonation) => {
    setEditingDonation(donation)
    setFormData({
      donorName: donation.donorName,
      donorPhone: donation.donorPhone,
      amount: donation.amount.toString(),
      currency: donation.currency,
      purpose: donation.purpose,
      notes: donation.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu nakit bağışı silmek istediğinizden emin misiniz?')) {
      setDonations(donations.filter(donation => donation.id !== id))
    }
  }

  const handlePrint = (donation: CashDonation) => {
    // Makbuz yazdırma işlemi
    alert(`${donation.receiptNo} numaralı makbuz yazdırılıyor...`)
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
      const newDonation: CashDonation = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...formData,
        amount: parseFloat(formData.amount),
        receiptNo: `NAK-${new Date().getFullYear()}-${String(donations.length + 1).padStart(3, '0')}`,
        receivedBy: 'Sistem Kullanıcısı', // Gerçek uygulamada oturum açan kullanıcı
        status: 'onaylandı'
      }
      setDonations([...donations, newDonation])
    }
    
    setIsModalOpen(false)
    setEditingDonation(null)
    setFormData({
      donorName: '',
      donorPhone: '',
      amount: '',
      currency: 'TRY',
      purpose: '',
      notes: ''
    })
  }

  const handleScanResult = (data: { donorName?: string; donorPhone?: string; amount?: number; currency?: string; purpose?: string; notes?: string; firstName?: string; lastName?: string; phone?: string; idNumber?: string; passportNumber?: string; address?: string; birthDate?: string }) => {
    if (data) {
      // QR kod, barkod veya OCR verilerini form alanlarına doldur
      if (data.donorName != null) setFormData(prev => ({ ...prev, donorName: data.donorName ?? prev.donorName }))
      if (data.donorPhone != null) setFormData(prev => ({ ...prev, donorPhone: data.donorPhone ?? prev.donorPhone }))
      if (data.amount != null) setFormData(prev => ({ ...prev, amount: (data.amount ?? Number(prev.amount || 0)).toString() }))
      if (data.currency != null) setFormData(prev => ({ ...prev, currency: (['TRY','USD','EUR'] as const).includes(data.currency as any) ? (data.currency as typeof prev.currency) : prev.currency }))
      if (data.purpose != null) setFormData(prev => ({ ...prev, purpose: data.purpose ?? prev.purpose }))
      if (data.notes != null) setFormData(prev => ({ ...prev, notes: data.notes ?? prev.notes }))
      
      // OCR'dan gelen kimlik/pasaport verileri
      if (data.firstName && data.lastName) {
        setFormData(prev => ({ ...prev, donorName: `${data.firstName} ${data.lastName}` }))
      }
      if (data.phone) {
        setFormData(prev => ({ ...prev, donorPhone: data.phone || '' }))
      }
      if (data.idNumber) {
        setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} | TC: ${data.idNumber}` : `TC: ${data.idNumber}` }))
      }
      if (data.passportNumber) {
        setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes} | Pasaport: ${data.passportNumber}` : `Pasaport: ${data.passportNumber}` }))
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
    setFormData({
      donorName: '',
      donorPhone: '',
      amount: '',
      currency: 'TRY',
      purpose: '',
      notes: ''
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nakit Bağışlar</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Nakit Bağış
          </button>
        </div>

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Toplam Bağış</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredDonations.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Toplam Tutar</h3>
            <p className="text-2xl font-bold text-green-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Bugünkü Bağış</h3>
            <p className="text-2xl font-bold text-purple-900">2</p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex items-center gap-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Bağışçı adı, telefon, fiş no ile ara..."
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Durumlar</option>
            <option value="onaylandı">Onaylandı</option>
            <option value="beklemede">Beklemede</option>
            <option value="iptal">İptal</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {/* exportToCsv('nakit-bagislar.csv', filteredDonations) */}}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <FileText size={16} />
              CSV İndir
            </button>
            <button
              onClick={() => {/* exportDonationsToExcel(filteredDonations, { type: 'cash' }) */}}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FileSpreadsheet size={16} />
              Excel İndir
            </button>
            <button
              onClick={() => {/* exportDonationsToPDF(filteredDonations, { type: 'cash' }) */}}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <FileText size={16} />
              PDF İndir
            </button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredDonations} />
      </div>

      {/* Nakit Bağış Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDonation ? 'Nakit Bağış Düzenle' : 'Yeni Nakit Bağış'}
      >
        <div className="p-4">
          {!isScannerOpen && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Camera size={16} />
                Kamera Tara
              </button>
            </div>
          )}
          
          {isScannerOpen && (
            <div className="mb-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded mb-3">
                <span className="text-sm font-medium">Kamera Tarama Aktif</span>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(false)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Kapat
                </button>
              </div>
              <div className="bg-gray-100 p-4 rounded text-center">
                <p className="text-gray-600">Kamera tarama özelliği geliştiriliyor...</p>
              </div>
            </div>
          )}
          
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
                  onChange={(e) => setFormData({...formData, currency: e.target.value as CashDonation['currency']})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="TRY">TRY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
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
                {editingDonation ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
