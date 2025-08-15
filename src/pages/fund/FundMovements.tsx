import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

interface FundMovement {
  id: string
  date: string
  type: string
  description: string
  amount: number
  balance: number
  fund: string
  region: string
  activity: string
}

const mockMovements: FundMovement[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Giriş',
    description: 'Bağış - Genel Fon',
    amount: 5000,
    balance: 15000,
    fund: 'Genel Fon',
    region: 'İstanbul',
    activity: 'Bağış Toplama'
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'Çıkış',
    description: 'Nakdi Yardım',
    amount: -2500,
    balance: 10000,
    fund: 'Yardım Fonu',
    region: 'Ankara',
    activity: 'Yardım Dağıtımı'
  }
]

export default function FundMovements() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => mockMovements.filter((m) => 
    JSON.stringify(m).toLowerCase().includes(query.toLowerCase())
  ), [query])

  const columns: Column<FundMovement>[] = [
    { key: 'date', header: 'Tarih' },
    { key: 'type', header: 'İşlem Tipi' },
    { key: 'description', header: 'Açıklama' },
    { key: 'fund', header: 'Fon' },
    { key: 'region', header: 'Bölge' },
    { key: 'activity', header: 'Faaliyet' },
    { key: 'amount', header: 'Tutar (TL)' },
    { key: 'balance', header: 'Bakiye (TL)' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <select className="rounded border bg-background px-2 py-1 text-sm">
          <option>Tüm Fonlar</option>
          <option>Genel Fon</option>
          <option>Yardım Fonu</option>
          <option>Eğitim Fonu</option>
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Fon hareketi ara..." 
        />
        <button className="rounded bg-green-600 px-3 py-1 text-sm text-white">Ara</button>
        <button className="rounded border px-3 py-1 text-sm">Filtre</button>
        <button 
          onClick={() => {
            // exportToCsv('fon-hareketleri.csv', filtered)
          }}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Kayıt | {filtered.reduce((sum, m) => sum + Math.abs(m.amount), 0).toLocaleString()} TL
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  )
}
