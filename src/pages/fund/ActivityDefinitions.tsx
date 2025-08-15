import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react'
import { log } from '@/utils/logger'

interface ActivityDefinition {
  id: string
  name: string
  code: string
  category: string
  description: string
  budgetType: 'Sabit' | 'Değişken' | 'Sınırsız'
  defaultBudget: number | null
  isActive: boolean
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik'
  responsibleUnit: string
  createdDate: string
  usageCount: number
}

const mockActivities: ActivityDefinition[] = [
  {
    id: '1',
    name: 'Gıda Paketi Dağıtımı',
    code: 'ACT-FD-001',
    category: 'Gıda Yardımı',
    description: 'İhtiyaç sahibi ailelere aylık gıda paketi dağıtımı',
    budgetType: 'Sabit',
    defaultBudget: 500,
    isActive: true,
    priority: 'Yüksek',
    responsibleUnit: 'Yardım Birimleri',
    createdDate: '2023-01-15',
    usageCount: 245
  },
  {
    id: '2',
    name: 'Eğitim Bursu Ödemesi',
    code: 'ACT-EDU-001',
    category: 'Eğitim Destegi',
    description: 'Öğrencilere aylık eğitim bursu ödemesi',
    budgetType: 'Değişken',
    defaultBudget: 1000,
    isActive: true,
    priority: 'Yüksek',
    responsibleUnit: 'Eğitim Birimleri',
    createdDate: '2023-02-10',
    usageCount: 156
  },
  {
    id: '3',
    name: 'Acil Sağlık Yardımı',
    code: 'ACT-HLT-001',
    category: 'Sağlık Desteği',
    description: 'Acil durumlarda sağlık giderlerinin karşılanması',
    budgetType: 'Sınırsız',
    defaultBudget: null,
    isActive: true,
    priority: 'Kritik',
    responsibleUnit: 'Sağlık Birimleri',
    createdDate: '2023-01-20',
    usageCount: 78
  },
  {
    id: '4',
    name: 'Kırtasiye Yardımı',
    code: 'ACT-STT-001',
    category: 'Eğitim Destegi',
    description: 'Okul öncesi ve ilkokul öğrencilerine kırtasiye malzemesi',
    budgetType: 'Sabit',
    defaultBudget: 250,
    isActive: false,
    priority: 'Orta',
    responsibleUnit: 'Eğitim Birimleri',
    createdDate: '2023-03-05',
    usageCount: 89
  }
]

export default function ActivityDefinitions() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedActivity, setSelectedActivity] = useState<ActivityDefinition | null>(null)
  
  const filtered = useMemo(() => {
    let result = mockActivities
    
    if (selectedCategory !== 'all') {
      result = result.filter(activity => activity.category === selectedCategory)
    }
    
    if (query) {
      result = result.filter((activity) => 
        JSON.stringify(activity).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedCategory])

  const columns: Column<ActivityDefinition>[] = [
    { key: 'code', header: 'Faaliyet Kodu' },
    { key: 'name', header: 'Faaliyet Adı' },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'budgetType', 
      header: 'Bütçe Tipi',
      render: (value) => {
        const colors = {
          'Sabit': 'bg-blue-100 text-blue-700',
          'Değişken': 'bg-yellow-100 text-yellow-700',
          'Sınırsız': 'bg-green-100 text-green-700'
        } as const
        const budgetType = value as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[budgetType] || colors['Sabit']}`}>
            {String(value ?? '')}
          </span>
        )
      }
    },
    { 
      key: 'defaultBudget', 
      header: 'Varsayılan Bütçe',
      render: (value) => value ? `₺${value.toLocaleString()}` : 'Belirsiz'
    },
    { 
      key: 'priority', 
      header: 'Öncelik',
      render: (value) => {
        const colors = {
          'Düşük': 'bg-gray-100 text-gray-700',
          'Orta': 'bg-yellow-100 text-yellow-700',
          'Yüksek': 'bg-orange-100 text-orange-700',
          'Kritik': 'bg-red-100 text-red-700'
        } as const
        const priority = value as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[priority] || colors['Düşük']}`}>
            {String(value ?? '')}
          </span>
        )
      }
    },
    { key: 'usageCount', header: 'Kullanım' },
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
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedActivity(row)}
            className="rounded p-1 text-gray-600 hover:bg-gray-50" 
            title="Detay"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-blue-600 hover:bg-blue-50" title="Düzenle">
            <Edit className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-green-600 hover:bg-green-50" title="Kopyala">
            <Copy className="h-4 w-4" />
          </button>
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const categories = Array.from(new Set(mockActivities.map(activity => activity.category)))

  const handleExport = () => {
    log.info('Exporting activities...')
    // Export logic here
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Faaliyet
        </button>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Faaliyet ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={handleExport}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Faaliyet | {filtered.reduce((sum, a) => sum + a.usageCount, 0)} Kullanım
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Faaliyet</h3>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Faaliyet</h3>
          <p className="text-2xl font-bold text-green-600">
            {filtered.filter(a => a.isActive).length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Kritik Öncelik</h3>
          <p className="text-2xl font-bold text-red-600">
            {filtered.filter(a => a.priority === 'Kritik').length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Kullanım</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filtered.reduce((sum, a) => sum + a.usageCount, 0)}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Kategori Sayısı</h3>
          <p className="text-2xl font-bold text-purple-600">
            {categories.length}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Faaliyet Tanımı Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Faaliyet Kodu</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Faaliyet Adı</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Açıklama</label>
                <textarea className="mt-1 w-full rounded border px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Kategori</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option>Seçiniz...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Bütçe Tipi</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Sabit">Sabit</option>
                    <option value="Değişken">Değişken</option>
                    <option value="Sınırsız">Sınırsız</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Varsayılan Bütçe</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Öncelik</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Düşük">Düşük</option>
                    <option value="Orta">Orta</option>
                    <option value="Yüksek">Yüksek</option>
                    <option value="Kritik">Kritik</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Sorumlu Birim</label>
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

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Faaliyet Detayları</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Faaliyet Kodu</label>
                  <p className="text-sm">{selectedActivity.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Faaliyet Adı</label>
                  <p className="text-sm">{selectedActivity.name}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Açıklama</label>
                <p className="text-sm">{selectedActivity.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Kategori</label>
                  <p className="text-sm">{selectedActivity.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Bütçe Tipi</label>
                  <p className="text-sm">{selectedActivity.budgetType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Öncelik</label>
                  <p className="text-sm">{selectedActivity.priority}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Varsayılan Bütçe</label>
                  <p className="text-sm">{selectedActivity.defaultBudget ? `₺${selectedActivity.defaultBudget.toLocaleString()}` : 'Belirsiz'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Kullanım Sayısı</label>
                  <p className="text-lg font-bold text-blue-600">{selectedActivity.usageCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Durum</label>
                  <p className="text-sm">{selectedActivity.isActive ? 'Aktif' : 'Pasif'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Sorumlu Birim</label>
                  <p className="text-sm">{selectedActivity.responsibleUnit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Oluşturma Tarihi</label>
                  <p className="text-sm">{selectedActivity.createdDate}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => setSelectedActivity(null)}
                className="rounded bg-gray-600 px-4 py-2 text-sm text-white"
              >
                Kapat
              </button>
              <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
                Düzenle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
