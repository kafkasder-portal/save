import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2, MapPin } from 'lucide-react'

interface WorkArea {
  id: string
  name: string
  code: string
  region: string
  coordinator: string
  activeWorkers: number
  totalBeneficiaries: number
  budget: number
  status: 'Aktif' | 'Pasif' | 'Geçici Kapalı'
  lastUpdate: string
}

const mockWorkAreas: WorkArea[] = [
  {
    id: '1',
    name: 'Kadıköy Merkez',
    code: 'KDK-MRK',
    region: 'İstanbul Anadolu',
    coordinator: 'Ahmet Yılmaz',
    activeWorkers: 12,
    totalBeneficiaries: 245,
    budget: 85000,
    status: 'Aktif',
    lastUpdate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ümraniye Doğu',
    code: 'UMR-DGU',
    region: 'İstanbul Anadolu',
    coordinator: 'Fatma Demir',
    activeWorkers: 8,
    totalBeneficiaries: 180,
    budget: 65000,
    status: 'Aktif',
    lastUpdate: '2024-01-14'
  },
  {
    id: '3',
    name: 'Çankaya Kızılay',
    code: 'CNK-KZL',
    region: 'Ankara Merkez',
    coordinator: 'Mehmet Öz',
    activeWorkers: 6,
    totalBeneficiaries: 120,
    budget: 45000,
    status: 'Geçici Kapalı',
    lastUpdate: '2024-01-10'
  }
]

export default function WorkAreas() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('all')
  
  const filtered = useMemo(() => {
    let result = mockWorkAreas
    
    if (selectedRegion !== 'all') {
      result = result.filter(area => area.region === selectedRegion)
    }
    
    if (query) {
      result = result.filter((area) => 
        JSON.stringify(area).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedRegion])

  const columns: Column<WorkArea>[] = [
    { key: 'code', header: 'Alan Kodu' },
    { key: 'name', header: 'Çalışma Alanı' },
    { key: 'region', header: 'Bölge' },
    { key: 'coordinator', header: 'Koordinatör' },
    { key: 'activeWorkers', header: 'Aktif Çalışan' },
    { key: 'totalBeneficiaries', header: 'Toplam Faydalanıcı' },
    { 
      key: 'budget', 
      header: 'Bütçe (TL)',
      render: (value: unknown) => {
        const budget = Number(value) || 0;
        return `₺${budget.toLocaleString()}`;
      }
    },
    { 
      key: 'status', 
      header: 'Durum',
      render: (value: unknown) => {
        const colors = {
          'Aktif': 'bg-green-100 text-green-700',
          'Pasif': 'bg-red-100 text-red-700',
          'Geçici Kapalı': 'bg-yellow-100 text-yellow-700'
        } as const
        const statusValue = String(value || '');
        const status = statusValue as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[status] || colors['Aktif']}`}>
            {statusValue}
          </span>
        )
      }
    },
    { key: 'lastUpdate', header: 'Son Güncelleme' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: () => (
        <div className="flex gap-2">
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50" title="Düzenle">
            <Edit className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-green-600 hover:bg-green-50" title="Haritada Göster">
            <MapPin className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const regions = Array.from(new Set(mockWorkAreas.map(area => area.region)))

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Alan
        </button>
        <select 
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Bölgeler</option>
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Çalışma alanı ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('calisma-alanlari.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Alan | {filtered.reduce((sum, a) => sum + a.activeWorkers, 0)} Çalışan
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Alan</h3>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Alan</h3>
          <p className="text-2xl font-bold text-green-600">
            {filtered.filter(a => a.status === 'Aktif').length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Çalışan</h3>
          <p className="text-2xl font-bold">
            {filtered.reduce((sum, a) => sum + a.activeWorkers, 0)}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Faydalanıcı</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filtered.reduce((sum, a) => sum + a.totalBeneficiaries, 0)}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Bütçe</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₺{filtered.reduce((sum, a) => sum + a.budget, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Work Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Çalışma Alanı Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Alan Kodu</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Alan Adı</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Bölge</label>
                <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                  <option>Seçiniz...</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Koordinatör</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Başlangıç Bütçesi</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Durum</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                    <option value="Geçici Kapalı">Geçici Kapalı</option>
                  </select>
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
    </div>
  )
}
