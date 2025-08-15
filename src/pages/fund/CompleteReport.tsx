import { useMemo, useState } from 'react'
import { LazyRechartsComponents } from '@utils/lazyCharts'

const mockFundData = [
  { month: 'Ocak', gelir: 45000, gider: 32000, bakiye: 13000 },
  { month: 'Şubat', gelir: 52000, gider: 38000, bakiye: 14000 },
  { month: 'Mart', gelir: 48000, gider: 35000, bakiye: 13000 },
  { month: 'Nisan', gelir: 55000, gider: 42000, bakiye: 13000 },
]

const mockFundBreakdown = [
  { name: 'Genel Fon', value: 150000, color: '#0088FE' },
  { name: 'Yardım Fonu', value: 85000, color: '#00C49F' },
  { name: 'Eğitim Fonu', value: 65000, color: '#FFBB28' },
  { name: 'Sağlık Fonu', value: 45000, color: '#FF8042' },
]

export default function CompleteReport() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024')
  
  const totalBalance = useMemo(() => 
    mockFundBreakdown.reduce((sum, fund) => sum + fund.value, 0)
  , [])

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center gap-4 rounded border p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Dönem:</label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded border bg-background px-3 py-1 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
        <button className="rounded bg-green-600 px-4 py-2 text-sm text-white">Rapor Oluştur</button>
        <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white">PDF İndir</button>
        <button className="rounded border px-4 py-2 text-sm">Excel İndir</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-green-600">₺{mockFundData.reduce((sum, m) => sum + m.gelir, 0).toLocaleString()}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Gider</h3>
          <p className="text-2xl font-bold text-red-600">₺{mockFundData.reduce((sum, m) => sum + m.gider, 0).toLocaleString()}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Net Bakiye</h3>
          <p className="text-2xl font-bold text-blue-600">₺{totalBalance.toLocaleString()}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Aktif Fon Sayısı</h3>
          <p className="text-2xl font-bold">{mockFundBreakdown.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <div className="rounded border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Aylık Gelir-Gider Trendi</h3>
          <LazyRechartsComponents>
            {({ ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar }) => (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockFundData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="gelir" fill="#22c55e" name="Gelir" />
                  <Bar dataKey="gider" fill="#ef4444" name="Gider" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </LazyRechartsComponents>
        </div>

        {/* Fund Distribution Pie Chart */}
        <div className="rounded border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Fon Dağılımı</h3>
          <LazyRechartsComponents>
            {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip }) => (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockFundBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockFundBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </LazyRechartsComponents>
        </div>
      </div>

      {/* Fund Details Table */}
      <div className="rounded border bg-card">
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold">Fon Detayları</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-3 text-left text-sm font-medium">Fon Adı</th>
                <th className="p-3 text-left text-sm font-medium">Bakiye (TL)</th>
                <th className="p-3 text-left text-sm font-medium">Oran (%)</th>
                <th className="p-3 text-left text-sm font-medium">Son Hareket</th>
                <th className="p-3 text-left text-sm font-medium">Durum</th>
              </tr>
            </thead>
            <tbody>
              {mockFundBreakdown.map((fund, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 text-sm">{fund.name}</td>
                  <td className="p-3 text-sm font-medium">₺{fund.value.toLocaleString()}</td>
                  <td className="p-3 text-sm">{((fund.value / totalBalance) * 100).toFixed(1)}%</td>
                  <td className="p-3 text-sm text-muted-foreground">2024-01-15</td>
                  <td className="p-3 text-sm">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Aktif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
