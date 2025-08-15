import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface FundDefinition {
  id: string
  name: string
  code: string
  description: string
  type: 'Genel' | 'Özel' | 'Proje' | 'Acil Durum'
  currency: string
  minAmount: number
  maxAmount: number | null
  isActive: boolean
  createdDate: string
  totalCollected: number
}

const mockFundDefinitions: FundDefinition[] = [
  {
    id: '1',
    name: 'Genel Bağış Fonu',
    code: 'GEN-001',
    description: 'Genel amaçlı bağış toplama fonu',
    type: 'Genel',
    currency: 'TRY',
    minAmount: 10,
    maxAmount: null,
    isActive: true,
    createdDate: '2023-01-15',
    totalCollected: 125000
  },
  {
    id: '2',
    name: 'Eğitim Bursu Fonu',
    code: 'EDU-001',
    description: 'Öğrenci burs destekleri için özel fon',
    type: 'Özel',
    currency: 'TRY',
    minAmount: 100,
    maxAmount: 10000,
    isActive: true,
    createdDate: '2023-03-20',
    totalCollected: 85000
  },
  {
    id: '3',
    name: 'Ramazan Paketi Projesi',
    code: 'RAM-2024',
    description: '2024 Ramazan ayı gıda paketi dağıtım projesi',
    type: 'Proje',
    currency: 'TRY',
    minAmount: 50,
    maxAmount: 500,
    isActive: true,
    createdDate: '2024-01-10',
    totalCollected: 65000
  },
  {
    id: '4',
    name: 'Deprem Yardım Fonu',
    code: 'ACL-DEP-001',
    description: 'Deprem mağdurları için acil yardım fonu',
    type: 'Acil Durum',
    currency: 'TRY',
    minAmount: 1,
    maxAmount: null,
    isActive: false,
    createdDate: '2023-02-06',
    totalCollected: 235000
  }
]

export default function FundDefinitions() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedFund, setSelectedFund] = useState<FundDefinition | null>(null)
  
  const filtered = useMemo(() => {
    let result = mockFundDefinitions
    
    if (selectedType !== 'all') {
      result = result.filter(fund => fund.type === selectedType)
    }
    
    if (query) {
      result = result.filter((fund) => 
        JSON.stringify(fund).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedType])

  const columns: Column<FundDefinition>[] = [
    { key: 'code', header: 'Fon Kodu' },
    { key: 'name', header: 'Fon Adı' },
    { 
      key: 'type', 
      header: 'Tip',
      render: (value: any) => {
        const colors = {
          'Genel': 'bg-blue-100 text-blue-700',
          'Özel': 'bg-purple-100 text-purple-700',
          'Proje': 'bg-green-100 text-green-700',
          'Acil Durum': 'bg-red-100 text-red-700'
        } as const
        const type = value as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[type] || colors['Genel']}`}>
            {value}
          </span>
        )
      }
    },
    { 
      key: 'minAmount', 
      header: 'Min. Tutar',
       render: (value: any) => `₺${Number(value ?? 0).toLocaleString()}`
    },
    { 
      key: 'maxAmount', 
      header: 'Max. Tutar',
       render: (value: any) => value ? `₺${Number(value).toLocaleString()}` : 'Sınırsız'
    },
    { 
      key: 'totalCollected', 
      header: 'Toplanan (TL)',
       render: (value: any) => `₺${Number(value ?? 0).toLocaleString()}`
    },
    { 
      key: 'isActive', 
      header: 'Durum',
      render: (value) => (
        <span className={`rounded-full px-2 py-1 text-xs ${
          value 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    { key: 'createdDate', header: 'Oluşturma Tarihi' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedFund(row)}
            className="rounded p-1 text-gray-600 hover:bg-gray-50" 
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50" title="Düzenle">
            <Edit className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const fundTypes = ['Genel', 'Özel', 'Proje', 'Acil Durum']

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Fon
        </button>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {fundTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Fon tanımı ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('fon-tanimlari.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Fon | ₺{filtered.reduce((sum, f) => sum + f.totalCollected, 0).toLocaleString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Fon</h3>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Fon</h3>
          <p className="text-2xl font-bold text-green-600">
            {filtered.filter(f => f.isActive).length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Tutar</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₺{filtered.reduce((sum, f) => sum + f.totalCollected, 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Ortalama Tutar</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₺{Math.round(filtered.reduce((sum, f) => sum + f.totalCollected, 0) / filtered.length).toLocaleString()}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Fund Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Fon Tanımı Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Fon Kodu</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Fon Adı</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Açıklama</label>
                <textarea className="mt-1 w-full rounded border px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Tip</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    {fundTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Para Birimi</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Minimum Tutar</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Maksimum Tutar</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="Sınırsız için boş bırakın" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded border px-4 py-2 text-sm"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fund Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Fon Detayları</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Fon Kodu</label>
                  <p className="text-sm">{selectedFund.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Fon Adı</label>
                  <p className="text-sm">{selectedFund.name}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Açıklama</label>
                <p className="text-sm">{selectedFund.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Tip</label>
                  <p className="text-sm">{selectedFund.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Para Birimi</label>
                  <p className="text-sm">{selectedFund.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Durum</label>
                  <p className="text-sm">{selectedFund.isActive ? 'Aktif' : 'Pasif'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Min. Tutar</label>
                  <p className="text-sm">₺{selectedFund.minAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Max. Tutar</label>
                  <p className="text-sm">{selectedFund.maxAmount ? `₺${selectedFund.maxAmount.toLocaleString()}` : 'Sınırsız'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Toplanan Tutar</label>
                  <p className="text-lg font-bold text-green-600">₺{selectedFund.totalCollected.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Oluşturma Tarihi</label>
                <p className="text-sm">{selectedFund.createdDate}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setSelectedFund(null)}
                className="rounded bg-gray-600 px-4 py-2 text-sm text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
