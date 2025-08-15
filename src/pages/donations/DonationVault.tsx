import { useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'

interface VaultTransaction {
  id: string
  date: string
  type: 'giriş' | 'çıkış'
  amount: number
  description: string
  operator: string
  balance: number
}

const mockVaultData: VaultTransaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'giriş',
    amount: 5000,
    description: 'Nakit bağış girişi',
    operator: 'Ahmet Yılmaz',
    balance: 15000
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'çıkış',
    amount: 2000,
    description: 'Yardım ödemesi',
    operator: 'Fatma Demir',
    balance: 10000
  }
]

export default function DonationVault() {
  const [transactions] = useState<VaultTransaction[]>(mockVaultData)
  const [newTransaction, setNewTransaction] = useState({
    type: 'giriş' as 'giriş' | 'çıkış',
    amount: '',
    description: ''
  })

  const columns: Column<VaultTransaction>[] = [
    { key: 'date', header: 'Tarih' },
    {
      key: 'type',
      header: 'İşlem Türü',
      render: (_, row: VaultTransaction) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.type === 'giriş' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.type}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Tutar',
      render: (_, row: VaultTransaction) => `${row.amount.toLocaleString('tr-TR')} ₺`
    },
    { key: 'description', header: 'Açıklama' },
    { key: 'operator', header: 'İşlem Yapan' },
    {
      key: 'balance',
      header: 'Kasa Bakiyesi',
      render: (_, row: VaultTransaction) => `${row.balance.toLocaleString('tr-TR')} ₺`
    }
  ]

  const currentBalance = transactions.length > 0 ? transactions[0].balance : 0

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Bağış Kabul Veznesi</h2>
        
        {/* Kasa Durumu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Güncel Bakiye</h3>
            <p className="text-2xl font-bold text-blue-900">{currentBalance.toLocaleString('tr-TR')} ₺</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Bugünkü Giriş</h3>
            <p className="text-2xl font-bold text-green-900">5.000 ₺</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-red-600">Bugünkü Çıkış</h3>
            <p className="text-2xl font-bold text-red-900">2.000 ₺</p>
          </div>
        </div>

        {/* Yeni İşlem Formu */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Yeni İşlem</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'giriş' | 'çıkış'})}
              className="border rounded px-3 py-2"
            >
              <option value="giriş">Giriş</option>
              <option value="çıkış">Çıkış</option>
            </select>
            <input
              type="number"
              placeholder="Tutar"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Açıklama"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="border rounded px-3 py-2"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              İşlem Ekle
            </button>
          </div>
        </div>
      </div>

      {/* İşlem Geçmişi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">İşlem Geçmişi</h3>
        <DataTable columns={columns} data={transactions} />
      </div>
    </div>
  )
}
