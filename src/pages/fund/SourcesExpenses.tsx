import { useState, useMemo } from 'react'
import { DataTable } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { TrendingUp, Edit, Trash2, Plus } from 'lucide-react'
import { LazyRechartsComponents } from '@utils/lazyCharts.tsx'

interface SourceExpense {
  id: string
  name: string
  code: string
  type: 'Kaynak' | 'Harcama'
  category: string
  amount: number
  date: string
  description: string
  fund: string
  status: 'Onaylandı' | 'Beklemede' | 'İptal'
  responsible: string
}

const mockData: SourceExpense[] = [
  {
    id: '1',
    name: 'Kurumsal Bağış - ABC Şirketi',
    code: 'SRC-001',
    type: 'Kaynak',
    category: 'Kurumsal Bağış',
    amount: 50000,
    date: '2024-01-15',
    description: 'ABC Şirketi kurumsal bağışı',
    fund: 'Genel Fon',
    status: 'Onaylandı',
    responsible: 'Ahmet Yılmaz'
  },
  {
    id: '2',
    name: 'Gıda Paketi Alımı',
    code: 'EXP-001',
    type: 'Harcama',
    category: 'Gıda Malzemesi',
    amount: -15000,
    date: '2024-01-14',
    description: 'Aylık gıda paketi malzeme alımı',
    fund: 'Yardım Fonu',
    status: 'Onaylandı',
    responsible: 'Fatma Demir'
  },
  {
    id: '3',
    name: 'Bireysel Bağışlar',
    code: 'SRC-002',
    type: 'Kaynak',
    category: 'Bireysel Bağış',
    amount: 25000,
    date: '2024-01-13',
    description: 'Çeşitli bireysel bağışların toplamı',
    fund: 'Genel Fon',
    status: 'Onaylandı',
    responsible: 'Mehmet Öz'
  },
  {
    id: '4',
    name: 'Eğitim Materyali',
    code: 'EXP-002',
    type: 'Harcama',
    category: 'Eğitim Malzemesi',
    amount: -8000,
    date: '2024-01-12',
    description: 'Öğrenci kırtasiye ve kitap alımı',
    fund: 'Eğitim Fonu',
    status: 'Beklemede',
    responsible: 'Ayşe Kaya'
  }
]

const chartData = [
  { name: 'Kurumsal Bağış', kaynak: 50000, harcama: 0 },
  { name: 'Bireysel Bağış', kaynak: 25000, harcama: 0 },
  { name: 'Gıda Malzemesi', kaynak: 0, harcama: 15000 },
  { name: 'Eğitim Malzemesi', kaynak: 0, harcama: 8000 },
]

const pieData = [
  { name: 'Kurumsal Bağış', value: 50000, color: '#0088FE' },
  { name: 'Bireysel Bağış', value: 25000, color: '#00C49F' },
  { name: 'Gıda Malzemesi', value: 15000, color: '#FFBB28' },
  { name: 'Eğitim Malzemesi', value: 8000, color: '#FF8042' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function SourcesExpenses() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const filtered = useMemo(() => {
    let result = mockData
    
    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType)
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus)
    }
    
    if (query) {
      result = result.filter((item) => 
        JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedType, selectedStatus])

  const totalSources = useMemo(() => 
    filtered.filter(item => item.type === 'Kaynak').reduce((sum, item) => sum + item.amount, 0)
  , [filtered])

  const totalExpenses = useMemo(() => 
    Math.abs(filtered.filter(item => item.type === 'Harcama').reduce((sum, item) => sum + item.amount, 0))
  , [filtered])

  const columns = [
    { key: 'code', header: 'Kod' },
    { key: 'name', header: 'Açıklama' },
    { 
      key: 'type', 
      header: 'Tip',
      render: (value: unknown) => {
        const typeValue = String(value || '');
        return (
          <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
            typeValue === 'Kaynak' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {typeValue === 'Kaynak' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {typeValue}
          </span>
        );
      }
    },
    { key: 'category', header: 'Kategori' },
    { 
      key: 'amount', 
      header: 'Tutar (TL)',
      render: (value: unknown) => {
        const amount = Number(value) || 0;
        return (
          <span className={amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            ₺{Math.abs(amount).toLocaleString()}
          </span>
        );
      }
    },
    { key: 'fund', header: 'Fon' },
    { key: 'date', header: 'Tarih' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (value: unknown) => {
        const colors = {
          'Onaylandı': 'bg-green-100 text-green-700',
          'Beklemede': 'bg-yellow-100 text-yellow-700',
          'İptal': 'bg-red-100 text-red-700'
        } as const
        const statusValue = String(value || '');
        const status = statusValue as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[status] || colors['Beklemede']}`}>
            {statusValue}
          </span>
        )
      }
    },
    { key: 'responsible', header: 'Sorumlu' },
    {
      key: 'actions',
      header: 'İşlemler',
      render: () => (
        <div className="flex gap-2">
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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni Kayıt
        </button>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          <option value="Kaynak">Kaynak</option>
          <option value="Harcama">Harcama</option>
        </select>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="Onaylandı">Onaylandı</option>
          <option value="Beklemede">Beklemede</option>
          <option value="İptal">İptal</option>
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Kaynak/Harcama ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('kaynak-harcama.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Kayıt
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Kaynak</h3>
          <p className="text-2xl font-bold text-green-600">₺{totalSources.toLocaleString()}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Harcama</h3>
          <p className="text-2xl font-bold text-red-600">₺{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Net Bakiye</h3>
          <p className={`text-2xl font-bold ${totalSources - totalExpenses > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₺{(totalSources - totalExpenses).toLocaleString()}
          </p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Bekleyen İşlem</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {filtered.filter(item => item.status === 'Beklemede').length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar Chart */}
        <div className="rounded border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Kaynak vs Harcama</h3>
          <LazyRechartsComponents>
              {({ ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar }: any) => (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="kaynak" fill="#22c55e" name="Kaynak" />
                    <Bar dataKey="harcama" fill="#ef4444" name="Harcama" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </LazyRechartsComponents>
        </div>

        {/* Pie Chart */}
        <div className="rounded border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Kategori Dağılımı</h3>
          <LazyRechartsComponents>
              {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip }: any) => (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </LazyRechartsComponents>
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filtered} />

      {/* Add Source/Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni Kaynak/Harcama Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Kod</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tip</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Kaynak">Kaynak</option>
                    <option value="Harcama">Harcama</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Açıklama</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Kategori</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option>Seçiniz...</option>
                    <option>Kurumsal Bağış</option>
                    <option>Bireysel Bağış</option>
                    <option>Gıda Malzemesi</option>
                    <option>Eğitim Malzemesi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Fon</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option>Seçiniz...</option>
                    <option>Genel Fon</option>
                    <option>Yardım Fonu</option>
                    <option>Eğitim Fonu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Tutar (TL)</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tarih</label>
                  <input type="date" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Sorumlu Kişi</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Detay Açıklama</label>
                <textarea className="mt-1 w-full rounded border px-3 py-2 text-sm" rows={3}></textarea>
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
