import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2, Eye, Users, Package, Heart } from 'lucide-react'

interface AidCategory {
  id: string
  name: string
  code: string
  type: 'Nakdi' | 'Ayni' | 'Hizmet'
  description: string
  targetGroup: string
  unitPrice: number | null
  currency: string
  isActive: boolean
  totalBeneficiaries: number
  totalAmount: number
  lastDistribution: string
  priority: 'Düşük' | 'Orta' | 'Yüksek' | 'Kritik'
  responsibleUnit: string
}

const mockCategories: AidCategory[] = [
  {
    id: '1',
    name: 'Gıda Paketi',
    code: 'AID-FD-001',
    type: 'Ayni',
    description: 'Aylık temel gıda ihtiyaçları paketi',
    targetGroup: 'İhtiyaç Sahibi Aileler',
    unitPrice: 500,
    currency: 'TRY',
    isActive: true,
    totalBeneficiaries: 245,
    totalAmount: 122500,
    lastDistribution: '2024-01-15',
    priority: 'Yüksek',
    responsibleUnit: 'Gıda Dağıtım Birimi'
  },
  {
    id: '2',
    name: 'Eğitim Bursu',
    code: 'AID-EDU-001',
    type: 'Nakdi',
    description: 'Öğrenciler için aylık eğitim destegi',
    targetGroup: 'Üniversite Öğrencileri',
    unitPrice: 1000,
    currency: 'TRY',
    isActive: true,
    totalBeneficiaries: 85,
    totalAmount: 85000,
    lastDistribution: '2024-01-10',
    priority: 'Yüksek',
    responsibleUnit: 'Eğitim Destek Birimi'
  },
  {
    id: '3',
    name: 'Sağlık Kontrolü',
    code: 'AID-HLT-001',
    type: 'Hizmet',
    description: 'Ücretsiz sağlık taraması ve kontrolü',
    targetGroup: 'Yaşlılar ve Çocuklar',
    unitPrice: null,
    currency: 'TRY',
    isActive: true,
    totalBeneficiaries: 150,
    totalAmount: 0,
    lastDistribution: '2024-01-12',
    priority: 'Kritik',
    responsibleUnit: 'Sağlık Hizmetleri Birimi'
  },
  {
    id: '4',
    name: 'Kıyafet Yardımı',
    code: 'AID-CLT-001',
    type: 'Ayni',
    description: 'Mevsimlik kıyafet ve ayakkabı yardımı',
    targetGroup: 'Çocuklar ve Gençler',
    unitPrice: 300,
    currency: 'TRY',
    isActive: true,
    totalBeneficiaries: 120,
    totalAmount: 36000,
    lastDistribution: '2024-01-08',
    priority: 'Orta',
    responsibleUnit: 'Giyim Yardım Birimi'
  },
  {
    id: '5',
    name: 'Acil Nakit Yardımı',
    code: 'AID-EMG-001',
    type: 'Nakdi',
    description: 'Acil durumlar için nakit desteği',
    targetGroup: 'Acil Durum Mağdurları',
    unitPrice: 2000,
    currency: 'TRY',
    isActive: false,
    totalBeneficiaries: 35,
    totalAmount: 70000,
    lastDistribution: '2023-12-20',
    priority: 'Kritik',
    responsibleUnit: 'Acil Müdahale Birimi'
  }
]

export default function AidCategories() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<AidCategory | null>(null)
  
  const filtered = useMemo(() => {
    let result = mockCategories
    
    if (selectedType !== 'all') {
      result = result.filter(category => category.type === selectedType)
    }
    
    if (query) {
      result = result.filter((category) => 
        JSON.stringify(category).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedType])

  const columns: Column<AidCategory>[] = [
    { key: 'code', header: 'Kategori Kodu' },
    { key: 'name', header: 'Kategori Adı' },
    { 
      key: 'type', 
      header: 'Tip',
      render: (value) => {
        const colors = {
          'Nakdi': 'bg-green-100 text-green-700',
          'Ayni': 'bg-blue-100 text-blue-700',
          'Hizmet': 'bg-purple-100 text-purple-700'
        }
        const icons = {
          'Nakdi': <Heart className="h-3 w-3" />,
          'Ayni': <Package className="h-3 w-3" />,
          'Hizmet': <Users className="h-3 w-3" />
        } as const
        const type = value as keyof typeof icons
        return (
          <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${colors[type] || colors['Nakdi']}`}>
            {icons[type] || icons['Nakdi']}
            {String(value ?? '')}
          </span>
        )
      }
    },
    { key: 'targetGroup', header: 'Hedef Grup' },
    { 
      key: 'unitPrice', 
      header: 'Birim Fiyat',
      render: (value) => value ? `₺${value.toLocaleString()}` : 'Hizmet'
    },
    { key: 'totalBeneficiaries', header: 'Faydalanıcı' },
    { 
      key: 'totalAmount', 
      header: 'Toplam Tutar',
      render: (value: unknown) => {
        const amount = Number(value) || 0;
        return `₺${amount.toLocaleString()}`;
      }
    },
    { 
      key: 'priority', 
      header: 'Öncelik',
      render: (value: unknown) => {
        const colors = {
          'Düşük': 'bg-gray-100 text-gray-700',
          'Orta': 'bg-yellow-100 text-yellow-700',
          'Yüksek': 'bg-orange-100 text-orange-700',
          'Kritik': 'bg-red-100 text-red-700'
        } as const
        const priorityValue = String(value || '');
        const priority = priorityValue as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[priority] || colors['Düşük']}`}>
            {priorityValue}
          </span>
        )
      }
    },
    { 
      key: 'isActive', 
      header: 'Durum',
      render: (value: unknown) => {
        const isActive = Boolean(value);
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${
            isActive 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isActive ? 'Aktif' : 'Pasif'}
          </span>
        );
      }
    },
    { key: 'lastDistribution', header: 'Son Dağıtım' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedCategory(row)}
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

  const aidTypes = ['Nakdi', 'Ayni', 'Hizmet']

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori
        </button>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {aidTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Yardım kategorisi ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('yardim-kategorileri.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Kategori | {filtered.reduce((sum, c) => sum + c.totalBeneficiaries, 0)} Faydalanıcı
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Kategori</h3>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Kategori</h3>
          <p className="text-2xl font-bold text-green-600">
            {filtered.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Faydalanıcı</h3>
          <p className="text-2xl font-bold text-blue-600">
            {filtered.reduce((sum, c) => sum + c.totalBeneficiaries, 0)}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Tutar</h3>
          <p className="text-2xl font-bold text-purple-600">
            ₺{filtered.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Kritik Öncelik</h3>
          <p className="text-2xl font-bold text-red-600">
            {filtered.filter(c => c.priority === 'Kritik').length}
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Yardım Kategorisi Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Kategori Kodu</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Kategori Adı</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Açıklama</label>
                <textarea className="mt-1 w-full rounded border px-3 py-2 text-sm" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Yardım Tipi</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    {aidTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
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
                <label className="block text-sm font-medium">Hedef Grup</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Birim Fiyat (TL)</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="Hizmet için boş bırakın" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Sorumlu Birim</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
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

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Kategori Detayları</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Kategori Kodu</label>
                  <p className="text-sm">{selectedCategory.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Kategori Adı</label>
                  <p className="text-sm">{selectedCategory.name}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Açıklama</label>
                <p className="text-sm">{selectedCategory.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Yardım Tipi</label>
                  <p className="text-sm">{selectedCategory.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Hedef Grup</label>
                  <p className="text-sm">{selectedCategory.targetGroup}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Öncelik</label>
                  <p className="text-sm">{selectedCategory.priority}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Birim Fiyat</label>
                  <p className="text-sm">{selectedCategory.unitPrice ? `₺${selectedCategory.unitPrice.toLocaleString()}` : 'Hizmet'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Faydalanıcı Sayısı</label>
                  <p className="text-lg font-bold text-blue-600">{selectedCategory.totalBeneficiaries}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Toplam Tutar</label>
                  <p className="text-lg font-bold text-green-600">₺{selectedCategory.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Durum</label>
                  <p className="text-sm">{selectedCategory.isActive ? 'Aktif' : 'Pasif'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Sorumlu Birim</label>
                  <p className="text-sm">{selectedCategory.responsibleUnit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Son Dağıtım</label>
                  <p className="text-sm">{selectedCategory.lastDistribution}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => setSelectedCategory(null)}
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
