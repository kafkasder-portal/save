import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2 } from 'lucide-react'

interface FundRegion {
  id: string
  name: string
  code: string
  city: string
  district: string
  totalFunds: number
  activeProjects: number
  status: 'Aktif' | 'Pasif'
  lastActivity: string
}

const mockRegions: FundRegion[] = [
  {
    id: '1',
    name: 'İstanbul Anadolu',
    code: 'IST-AN',
    city: 'İstanbul',
    district: 'Kadıköy',
    totalFunds: 125000,
    activeProjects: 8,
    status: 'Aktif',
    lastActivity: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ankara Merkez',
    code: 'ANK-MRK',
    city: 'Ankara',
    district: 'Çankaya',
    totalFunds: 85000,
    activeProjects: 5,
    status: 'Aktif',
    lastActivity: '2024-01-14'
  },
  {
    id: '3',
    name: 'İzmir Karşıyaka',
    code: 'IZM-KAR',
    city: 'İzmir',
    district: 'Karşıyaka',
    totalFunds: 65000,
    activeProjects: 3,
    status: 'Aktif',
    lastActivity: '2024-01-12'
  }
]

export default function FundRegions() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  
  const filtered = useMemo(() => mockRegions.filter((r) => 
    JSON.stringify(r).toLowerCase().includes(query.toLowerCase())
  ), [query])

  const columns: Column<FundRegion>[] = [
    { key: 'code', header: 'Bölge Kodu' },
    { key: 'name', header: 'Bölge Adı' },
    { key: 'city', header: 'İl' },
    { key: 'district', header: 'İlçe' },
    { 
      key: 'totalFunds', 
      header: 'Toplam Fon (TL)',
      render: (value: any) => `₺${Number(value ?? 0).toLocaleString()}`
    },
    { key: 'activeProjects', header: 'Aktif Proje' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (value) => (
        <span className={`rounded-full px-2 py-1 text-xs ${
          value === 'Aktif' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {String(value ?? '')}
        </span>
      )
    },
    { key: 'lastActivity', header: 'Son Faaliyet' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: () => (
        <div className="flex gap-2">
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50">
            <Edit className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Bölge
        </button>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Bölge ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('fon-bolgeleri.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Bölge | ₺{filtered.reduce((sum, r) => sum + r.totalFunds, 0).toLocaleString()} Toplam Fon
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Bölge</h3>
          <p className="text-2xl font-bold">{mockRegions.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Bölge</h3>
          <p className="text-2xl font-bold text-green-600">
            {mockRegions.filter(r => r.status === 'Aktif').length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Fon</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₺{mockRegions.reduce((sum, r) => sum + r.totalFunds, 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Proje</h3>
          <p className="text-2xl font-bold">
            {mockRegions.reduce((sum, r) => sum + r.activeProjects, 0)}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Region Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Bölge Ekle</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Bölge Kodu</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Bölge Adı</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">İl</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">İlçe</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
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
    </div>
  )
}
