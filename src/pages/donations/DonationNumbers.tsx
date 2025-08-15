import React, { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import LazyCameraScanner from '@components/LazyCameraScanner'
import { Camera } from 'lucide-react'
import { log } from '@/utils/logger'

interface DonationNumber {
  id: string
  donationNumber: string
  generatedDate: string
  donorName?: string
  donorPhone?: string
  donorEmail?: string
  purpose: string
  targetAmount: number
  collectedAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  expiryDate?: string
  status: 'aktif' | 'tamamlandı' | 'süresi doldu' | 'iptal'
  qrCode?: string
  shortUrl?: string
  usageCount: number
  lastUsedDate?: string
  notes?: string
  createdBy: string
}

const mockDonationNumbers: DonationNumber[] = [
  {
    id: '1',
    donationNumber: 'DN2024001',
    generatedDate: '2024-01-15',
    donorName: 'Ahmet Yılmaz',
    donorPhone: '+90 532 123 4567',
    donorEmail: 'ahmet.yilmaz@email.com',
    purpose: 'Eğitim Yardımı',
    targetAmount: 5000,
    collectedAmount: 3500,
    currency: 'TRY',
    expiryDate: '2024-06-15',
    status: 'aktif',
    qrCode: 'QR_DN2024001',
    shortUrl: 'https://bagis.org/dn001',
    usageCount: 7,
    lastUsedDate: '2024-01-14',
    notes: 'Okul öncesi eğitim için',
    createdBy: 'Admin'
  },
  {
    id: '2',
    donationNumber: 'DN2024002',
    generatedDate: '2024-01-10',
    purpose: 'Genel Bağış',
    targetAmount: 10000,
    collectedAmount: 10000,
    currency: 'TRY',
    expiryDate: '2024-12-31',
    status: 'tamamlandı',
    qrCode: 'QR_DN2024002',
    shortUrl: 'https://bagis.org/dn002',
    usageCount: 25,
    lastUsedDate: '2024-01-13',
    notes: 'Genel amaçlı bağış kampanyası',
    createdBy: 'Operator1'
  },
  {
    id: '3',
    donationNumber: 'DN2024003',
    generatedDate: '2024-01-05',
    donorName: 'Zeynep Kaya',
    donorPhone: '+90 533 987 6543',
    purpose: 'Kurban',
    targetAmount: 2500,
    collectedAmount: 1200,
    currency: 'TRY',
    expiryDate: '2024-03-01',
    status: 'süresi doldu',
    qrCode: 'QR_DN2024003',
    shortUrl: 'https://bagis.org/dn003',
    usageCount: 3,
    lastUsedDate: '2024-02-28',
    createdBy: 'Admin'
  }
]

export default function DonationNumbers() {
  const [donationNumbers, setDonationNumbers] = useState<DonationNumber[]>(mockDonationNumbers)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [editingNumber, setEditingNumber] = useState<DonationNumber | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<DonationNumber | null>(null)
  const [formData, setFormData] = useState({
    donorName: '',
    donorPhone: '',
    donorEmail: '',
    purpose: '',
    targetAmount: '',
    currency: 'TRY' as DonationNumber['currency'],
    expiryDate: '',
    notes: ''
  })
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const filteredNumbers = useMemo(() => 
    donationNumbers.filter(number => 
      JSON.stringify(number).toLowerCase().includes(query.toLowerCase())
    ), [donationNumbers, query]
  )

  const totalTarget = filteredNumbers.reduce((sum, number) => sum + number.targetAmount, 0)
  const totalCollected = filteredNumbers.reduce((sum, number) => sum + number.collectedAmount, 0)
  const activeCount = filteredNumbers.filter(n => n.status === 'aktif').length
  const completedCount = filteredNumbers.filter(n => n.status === 'tamamlandı').length

  const columns: Column<DonationNumber>[] = [
    { key: 'donationNumber', header: 'Bağış No' },
    { key: 'generatedDate', header: 'Oluşturma Tarihi' },
    { key: 'donorName', header: 'Bağışçı' },
    { key: 'purpose', header: 'Amaç' },
    { 
      key: 'targetAmount', 
      header: 'Hedef Tutar',
      render: (_, row: DonationNumber) => `${row.targetAmount.toLocaleString('tr-TR')} ${row.currency}`
    },
    { 
      key: 'collectedAmount', 
      header: 'Toplanan',
      render: (_, row: DonationNumber) => `${row.collectedAmount.toLocaleString('tr-TR')} ${row.currency}`
    },
    { 
      key: 'targetAmount', 
      header: 'Tamamlanma',
      render: (_, row: DonationNumber) => {
        const percentage = Math.round((row.collectedAmount / row.targetAmount) * 100)
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
    { key: 'usageCount', header: 'Kullanım' },
    { key: 'expiryDate', header: 'Son Tarih' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (_, row: DonationNumber) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'aktif' ? 'bg-green-100 text-green-800' :
          row.status === 'tamamlandı' ? 'bg-blue-100 text-blue-800' :
          row.status === 'süresi doldu' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, row: DonationNumber) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleShowQr(row)}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            QR Kod
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
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

  const handleEdit = (number: DonationNumber) => {
    setEditingNumber(number)
    setFormData({
      donorName: number.donorName || '',
      donorPhone: number.donorPhone || '',
      donorEmail: number.donorEmail || '',
      purpose: number.purpose,
      targetAmount: number.targetAmount.toString(),
      currency: number.currency,
      expiryDate: number.expiryDate || '',
      notes: number.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleShowQr = (number: DonationNumber) => {
    setSelectedNumber(number)
    setIsQrModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu bağış numarasını silmek istediğinizden emin misiniz?')) {
      setDonationNumbers(donationNumbers.filter(number => number.id !== id))
    }
  }

  const generateDonationNumber = () => {
    const year = new Date().getFullYear()
    const count = donationNumbers.length + 1
    return `DN${year}${count.toString().padStart(3, '0')}`
  }

  const generateShortUrl = (donationNumber: string) => {
    const shortCode = donationNumber.toLowerCase().replace('dn', 'dn')
    return `https://bagis.org/${shortCode}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingNumber) {
      // Güncelleme
      setDonationNumbers(donationNumbers.map(number => 
        number.id === editingNumber.id 
          ? { 
              ...number, 
              ...formData,
              targetAmount: parseFloat(formData.targetAmount)
            }
          : number
      ))
    } else {
      // Yeni ekleme
      const donationNumber = generateDonationNumber()
      const newNumber: DonationNumber = {
        id: Date.now().toString(),
        donationNumber,
        generatedDate: new Date().toISOString().split('T')[0],
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        collectedAmount: 0,
        status: 'aktif',
        qrCode: `QR_${donationNumber}`,
        shortUrl: generateShortUrl(donationNumber),
        usageCount: 0,
        createdBy: 'Admin' // Bu gerçek uygulamada oturum açan kullanıcıdan gelecek
      }
      setDonationNumbers([...donationNumbers, newNumber])
    }
    
    setIsModalOpen(false)
    setEditingNumber(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      donorName: '',
      donorPhone: '',
      donorEmail: '',
      purpose: '',
      targetAmount: '',
      currency: 'TRY',
      expiryDate: '',
      notes: ''
    })
  }

  const handleScanResult = (data: { donorName?: string; donorPhone?: string; donorEmail?: string; purpose?: string; targetAmount?: number; currency?: string; expiryDate?: string; notes?: string; firstName?: string; lastName?: string; phone?: string; idNumber?: string; passportNumber?: string; address?: string; birthDate?: string }) => {
    if (data) {
      // QR kod, barkod veya OCR verilerini form alanlarına doldur
      if (data.donorName != null) setFormData(prev => ({ ...prev, donorName: data.donorName ?? prev.donorName }))
      if (data.donorPhone != null) setFormData(prev => ({ ...prev, donorPhone: data.donorPhone ?? prev.donorPhone }))
      if (data.donorEmail != null) setFormData(prev => ({ ...prev, donorEmail: data.donorEmail ?? prev.donorEmail }))
      if (data.purpose != null) setFormData(prev => ({ ...prev, purpose: data.purpose ?? prev.purpose }))
      if (data.targetAmount != null) setFormData(prev => ({ ...prev, targetAmount: (data.targetAmount ?? Number(prev.targetAmount || 0)).toString() }))
      if (data.currency != null) setFormData(prev => ({ ...prev, currency: (['TRY','USD','EUR'] as const).includes(data.currency as any) ? (data.currency as typeof prev.currency) : prev.currency }))
      if (data.expiryDate != null) setFormData(prev => ({ ...prev, expiryDate: data.expiryDate ?? prev.expiryDate }))
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
    setEditingNumber(null)
    resetForm()
    setIsModalOpen(true)
  }


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Panoya kopyalandı!')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bağış Numaraları</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Bağış Numarası
          </button>
        </div>

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Toplam Numara</h3>
            <p className="text-2xl font-bold text-blue-900">{filteredNumbers.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Aktif</h3>
            <p className="text-2xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Tamamlanan</h3>
            <p className="text-2xl font-bold text-purple-900">{completedCount}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600">Toplama Oranı</h3>
            <p className="text-2xl font-bold text-orange-900">
              {totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Durum Dağılımı */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Durum Dağılımı</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['aktif', 'tamamlandı', 'süresi doldu', 'iptal'].map((status) => {
              const count = filteredNumbers.filter(n => n.status === status).length
              const amount = filteredNumbers
                .filter(n => n.status === status)
                .reduce((sum, n) => sum + n.collectedAmount, 0)
              
              return (
                <div key={status} className="border rounded-lg p-4">
                  <h4 className="font-medium capitalize">{status}</h4>
                  <p className="text-sm text-gray-600">{count} numara</p>
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
            placeholder="Bağış no, bağışçı, amaç ile ara..."
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="tamamlandı">Tamamlandı</option>
            <option value="süresi doldu">Süresi Doldu</option>
            <option value="iptal">İptal</option>
          </select>
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Amaçlar</option>
            <option value="Genel Bağış">Genel Bağış</option>
            <option value="Eğitim Yardımı">Eğitim Yardımı</option>
            <option value="Sağlık Yardımı">Sağlık Yardımı</option>
            <option value="Kurban">Kurban</option>
            <option value="Ramazan">Ramazan</option>
          </select>
          <input
            type="date"
            className="border rounded px-3 py-2"
            placeholder="Başlangıç tarihi"
          />
          <button
            onClick={() => {
              // exportToCsv('bagis-numaralari.csv', filteredNumbers)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Excel İndir
          </button>
        </div>

        <DataTable columns={columns} data={filteredNumbers} />
      </div>

      {/* Bağış Numarası Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center justify-between">
            <span>{editingNumber ? 'Bağış Numarası Düzenle' : 'Yeni Bağış Numarası'}</span>
            <button
              type="button"
              onClick={() => setIsScannerOpen(!isScannerOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Camera size={16} />
              {isScannerOpen ? 'Kamerayı Kapat' : 'Kamera Tara'}
            </button>
          </div>
        }
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
              <label className="block text-sm font-medium mb-1">Bağışçı Adı (Opsiyonel)</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="Belirli bir bağışçı için"
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hedef Tutar</label>
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
                onChange={(e) => setFormData({...formData, currency: e.target.value as DonationNumber['currency']})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Son Kullanım Tarihi (Opsiyonel)</label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Bağış numarası hakkında ek bilgiler..."
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
              {editingNumber ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Kod Modal */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="QR Kod ve Bağış Linki"
      >
        {selectedNumber && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">{selectedNumber.donationNumber}</h3>
              <p className="text-gray-600 mb-4">{selectedNumber.purpose}</p>
              
              {/* QR Kod Placeholder */}
              <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-sm text-gray-500">QR Kod</div>
                  <div className="text-xs text-gray-400">{selectedNumber.qrCode}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bağış Linki</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedNumber.shortUrl}
                    readOnly
                    className="flex-1 border rounded px-3 py-2 bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedNumber.shortUrl!)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Kopyala
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hedef Tutar</label>
                  <div className="text-lg font-bold">
                    {selectedNumber.targetAmount.toLocaleString('tr-TR')} {selectedNumber.currency}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Toplanan</label>
                  <div className="text-lg font-bold text-green-600">
                    {selectedNumber.collectedAmount.toLocaleString('tr-TR')} {selectedNumber.currency}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kullanım Sayısı</label>
                  <div className="text-lg font-bold">{selectedNumber.usageCount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Son Kullanım</label>
                  <div className="text-sm">{selectedNumber.lastUsedDate || 'Henüz kullanılmadı'}</div>
                </div>
              </div>
              
              {selectedNumber.expiryDate && (
                <div>
                  <label className="block text-sm font-medium mb-1">Son Tarih</label>
                  <div className="text-sm">{selectedNumber.expiryDate}</div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => window.open(selectedNumber.shortUrl, '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Bağış Sayfasını Aç
              </button>
              <button
                onClick={() => copyToClipboard(selectedNumber.shortUrl!)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Linki Paylaş
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
