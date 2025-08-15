import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// // import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted // Removed - file deleted
import { AlertTriangle, Trash2, RefreshCw, Search } from 'lucide-react'

interface WarningMessage {
  id: string
  message: string
  url: string
  lastOccurrence: string
  repeatCount: number
  ipAddress: string
  userAgent: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

const mockWarningMessages: WarningMessage[] = [
  {
    id: '1',
    message: 'Kullanıcı adı veya şifre hatalı',
    url: 'http://172.29.188.109/login',
    lastOccurrence: '09.08.2025 02:01:09',
    repeatCount: 6,
    ipAddress: '172.29.188.109',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Medium'
  },
  {
    id: '2',
    message: 'Hızlı geri bildirim için tanımlı kategori bulunamadı. Ayrıca "İş Kategorisi " içindeki "İş Kaydı Birimleri " sekmesindeki birimlerde "Hızlı Geri Bildirim Yapılabilir" işaretlenmiş olmalıdır. Lütfen sistem yöneticinizle iletişime geçiniz.',
    url: 'http://172.29.188.109/crea/feedback',
    lastOccurrence: '06.08.2025 19:42:59',
    repeatCount: 1,
    ipAddress: '172.29.188.109',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'High'
  },
  {
    id: '3',
    message: 'Kullanıcı adı veya şifre hatalı',
    url: 'http://172.29.178.79/login',
    lastOccurrence: '24.07.2025 13:04:34',
    repeatCount: 2,
    ipAddress: '172.29.178.79',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    severity: 'Medium'
  },
  {
    id: '4',
    message: 'Kullanıcı adı veya şifre hatalı',
    url: 'http://172.22.217.56/login',
    lastOccurrence: '12.07.2025 01:56:45',
    repeatCount: 7,
    ipAddress: '172.22.217.56',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'High'
  },
  {
    id: '5',
    message: 'Şifreler uyuşmuyor',
    url: 'http://172.22.217.56/repassword',
    lastOccurrence: '17.06.2025 14:33:36',
    repeatCount: 1,
    ipAddress: '172.22.217.56',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Low'
  },
  {
    id: '6',
    message: 'Lütfen daha önce kullanılmayan bir şifre belirleyiniz',
    url: 'http://172.22.217.56/repassword',
    lastOccurrence: '17.06.2025 14:33:01',
    repeatCount: 1,
    ipAddress: '172.22.217.56',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Low'
  },
  {
    id: '7',
    message: 'Durum bilgisi sıfır olamaz',
    url: 'http://172.22.217.56/crea/relief/service/detail/906',
    lastOccurrence: '02.06.2025 15:28:12',
    repeatCount: 3,
    ipAddress: '172.22.217.56',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Medium'
  },
  {
    id: '8',
    message: 'nurettin nicki ile giriş yapmaya çalışan kullanıcının hatalı giriş denemesinden dolayı ip engellemesi',
    url: 'http://192.168.48.44/login',
    lastOccurrence: '12.05.2025 04:43:51',
    repeatCount: 1,
    ipAddress: '192.168.48.44',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Critical'
  }
]

export default function WarningMessages() {
  const [query, setQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [ipFilter, setIpFilter] = useState('')
  
  const filtered = useMemo(() => {
    let result = mockWarningMessages
    
    if (selectedSeverity !== 'all') {
      result = result.filter(warning => warning.severity === selectedSeverity)
    }
    
    if (ipFilter) {
      result = result.filter(warning => warning.ipAddress.includes(ipFilter))
    }
    
    if (query) {
      result = result.filter((warning) => 
        JSON.stringify(warning).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedSeverity, ipFilter])

  const columns: Column<WarningMessage>[] = [
    { 
      key: 'message', 
      header: 'Uyarı Mesajı',
      render: (value: unknown) => (
        <div className="max-w-md">
          <p className="text-sm truncate" title={String(value || '')}>
            {String(value || '')}
          </p>
        </div>
      )
    },
    { 
      key: 'url', 
      header: 'URL',
      render: (value: unknown) => (
        <div className="max-w-xs">
          <p className="text-sm text-blue-600 truncate" title={String(value || '')}>
            {String(value || '')}
          </p>
        </div>
      )
    },
    { key: 'lastOccurrence', header: 'Son Oluşma' },
    { 
      key: 'repeatCount', 
      header: 'Tekrar',
      render: (value: unknown) => {
        const count = Number(value) || 0;
        return (
          <span className={`font-medium ${
            count > 5 ? 'text-red-600' : count > 2 ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {count}
          </span>
        )
      }
    },
    { key: 'ipAddress', header: 'IP Adresi' },
    { 
      key: 'severity', 
      header: 'Önem',
      render: (value: unknown) => {
        const colors = {
          'Low': 'bg-gray-100 text-gray-700',
          'Medium': 'bg-yellow-100 text-yellow-700',
          'High': 'bg-orange-100 text-orange-700',
          'Critical': 'bg-red-100 text-red-700'
        } as const
        const labels = {
          'Low': 'Düşük',
          'Medium': 'Orta',
          'High': 'Yüksek',
          'Critical': 'Kritik'
        } as const
        const severity = String(value || 'Low') as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[severity] || colors['Low']}`}>
            {labels[severity] || labels['Low']}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: () => (
        <div className="flex gap-2">
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const severityOptions = ['Low', 'Medium', 'High', 'Critical']
  const totalWarnings = filtered.length
  const criticalWarnings = filtered.filter(w => w.severity === 'Critical').length
  const totalRepeats = filtered.reduce((sum, w) => sum + w.repeatCount, 0)

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button className="flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-sm text-white">
          <Trash2 className="h-4 w-4" />
          Tümünü Sil
        </button>
        <button className="flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-sm text-white">
          <RefreshCw className="h-4 w-4" />
          Yenile
        </button>
        <select 
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Önem Seviyeleri</option>
          {severityOptions.map(severity => (
            <option key={severity} value={severity}>
              {severity === 'Low' ? 'Düşük' : 
               severity === 'Medium' ? 'Orta' : 
               severity === 'High' ? 'Yüksek' : 'Kritik'}
            </option>
          ))}
        </select>
        <input 
          value={ipFilter} 
          onChange={(e) => setIpFilter(e.target.value)} 
          className="w-40 rounded border px-2 py-1 text-sm" 
          placeholder="IP Adresi" 
        />
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="Uyarı mesajı ara..." 
        />
        <button className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white">
          <Search className="h-4 w-4" />
          Ara
        </button>
        <button 
          onClick={() => {
            // exportToCsv('uyari-mesajlari.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {totalWarnings} Kayıt
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Toplam Uyarı</h3>
          </div>
          <p className="text-2xl font-bold">{totalWarnings}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Kritik Uyarılar</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{criticalWarnings}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Tekrar</h3>
          <p className="text-2xl font-bold text-orange-600">{totalRepeats}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Benzersiz IP</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Set(filtered.map(w => w.ipAddress)).size}
          </p>
        </div>
      </div>

      {/* Warning Types Summary */}
      <div className="rounded border bg-card p-4">
        <h3 className="mb-3 text-lg font-semibold">Uyarı Türleri Dağılımı</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {severityOptions.map(severity => {
            const count = filtered.filter(w => w.severity === severity).length
            const percentage = totalWarnings > 0 ? (count / totalWarnings * 100).toFixed(1) : 0
            const label = severity === 'Low' ? 'Düşük' : 
                         severity === 'Medium' ? 'Orta' : 
                         severity === 'High' ? 'Yüksek' : 'Kritik'
            const color = severity === 'Low' ? 'text-gray-600' : 
                         severity === 'Medium' ? 'text-yellow-600' : 
                         severity === 'High' ? 'text-orange-600' : 'text-red-600'
            
            return (
              <div key={severity} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{label}</span>
                  <span className={`text-lg font-bold ${color}`}>{count}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">%{percentage}</div>
              </div>
            )
          })}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />
    </div>
  )
}
