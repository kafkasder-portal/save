import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Shield, Plus, Trash2, Eye, AlertTriangle, Lock, Unlock } from 'lucide-react'

interface BlockedIP {
  id: string
  ipAddress: string
  reason: string
  blockedDate: string
  blockedBy: string
  attempts: number
  lastAttempt: string
  blockType: 'Manual' | 'Automatic' | 'Temporary'
  expiryDate: string | null
  country: string
  userAgent: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Active' | 'Expired' | 'Whitelist'
}

const mockBlockedIPs: BlockedIP[] = [
  {
    id: '1',
    ipAddress: '192.168.48.44',
    reason: 'nurettin nicki ile giriş yapmaya çalışan kullanıcının hatalı giriş denemesinden dolayı ip engellemesi',
    blockedDate: '12.05.2025 04:43:51',
    blockedBy: 'Sistem (Otomatik)',
    attempts: 15,
    lastAttempt: '12.05.2025 04:42:30',
    blockType: 'Automatic',
    expiryDate: '19.05.2025 04:43:51',
    country: 'Türkiye',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'High',
    status: 'Active'
  },
  {
    id: '2',
    ipAddress: '85.34.12.45',
    reason: 'Şüpheli SQL injection denemeleri',
    blockedDate: '10.05.2025 14:22:10',
    blockedBy: 'Ahmet Yılmaz',
    attempts: 8,
    lastAttempt: '10.05.2025 14:20:45',
    blockType: 'Manual',
    expiryDate: null,
    country: 'Rusya',
    userAgent: 'curl/7.68.0',
    severity: 'Critical',
    status: 'Active'
  },
  {
    id: '3',
    ipAddress: '172.29.188.109',
    reason: 'Çoklu başarısız giriş denemesi',
    blockedDate: '08.05.2025 16:30:22',
    blockedBy: 'Sistem (Otomatik)',
    attempts: 12,
    lastAttempt: '08.05.2025 16:29:55',
    blockType: 'Temporary',
    expiryDate: '09.05.2025 16:30:22',
    country: 'Türkiye',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    severity: 'Medium',
    status: 'Expired'
  },
  {
    id: '4',
    ipAddress: '195.142.86.72',
    reason: 'Brute force saldırı tespiti',
    blockedDate: '05.05.2025 09:15:33',
    blockedBy: 'Fatma Demir',
    attempts: 25,
    lastAttempt: '05.05.2025 09:14:12',
    blockType: 'Manual',
    expiryDate: null,
    country: 'Çin',
    userAgent: 'python-requests/2.25.1',
    severity: 'Critical',
    status: 'Active'
  },
  {
    id: '5',
    ipAddress: '192.168.1.100',
    reason: 'Test amaçlı manuel engelleme',
    blockedDate: '01.05.2025 10:00:00',
    blockedBy: 'Mehmet Öz',
    attempts: 3,
    lastAttempt: '01.05.2025 09:58:30',
    blockType: 'Manual',
    expiryDate: null,
    country: 'Türkiye',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    severity: 'Low',
    status: 'Whitelist'
  }
]

export default function IPBlocking() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  
  const filtered = useMemo(() => {
    let result = mockBlockedIPs
    
    if (selectedType !== 'all') {
      result = result.filter(ip => ip.blockType === selectedType)
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(ip => ip.status === selectedStatus)
    }
    
    if (selectedSeverity !== 'all') {
      result = result.filter(ip => ip.severity === selectedSeverity)
    }
    
    if (query) {
      result = result.filter((ip) => 
        JSON.stringify(ip).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedType, selectedStatus, selectedSeverity])

  const columns: Column<BlockedIP>[] = [
    { 
      key: 'ipAddress', 
      header: 'IP Adresi',
      render: (value: unknown) => (
        <span className="font-mono text-sm">{String(value || '')}</span>
      )
    },
    { 
      key: 'reason', 
      header: 'Engelleme Nedeni',
      render: (value: unknown) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={String(value || '')}>
            {String(value || '')}
          </p>
        </div>
      )
    },
    { 
      key: 'blockType', 
      header: 'Engelleme Tipi',
      render: (value: unknown) => {
        const colors = {
          'Manual': 'bg-blue-100 text-blue-700',
          'Automatic': 'bg-green-100 text-green-700',
          'Temporary': 'bg-yellow-100 text-yellow-700'
        } as const
        const labels = {
          'Manual': 'Manuel',
          'Automatic': 'Otomatik',
          'Temporary': 'Geçici'
        } as const
        const blockType = String(value || 'Manual') as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[blockType] || colors['Manual']}`}>
            {labels[blockType] || labels['Manual']}
          </span>
        )
      }
    },
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
    { key: 'attempts', header: 'Deneme Sayısı' },
    { key: 'country', header: 'Ülke' },
    { key: 'blockedDate', header: 'Engellenme Tarihi' },
    { 
      key: 'status', 
      header: 'Durum',
      render: (value: unknown) => {
        const colors = {
          'Active': 'bg-red-100 text-red-700',
          'Expired': 'bg-gray-100 text-gray-700',
          'Whitelist': 'bg-green-100 text-green-700'
        } as const
        const labels = {
          'Active': 'Aktif',
          'Expired': 'Süresi Dolmuş',
          'Whitelist': 'Beyaz Liste'
        } as const
        const status = String(value || 'Active') as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[status] || colors['Active']}`}>
            {labels[status] || labels['Active']}
          </span>
        )
      }
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (_, row) => (
        <div className="flex gap-2">
          <button className="rounded p-1 text-gray-600 hover:bg-gray-50" title="Detay">
            <Eye className="h-4 w-4" />
          </button>
          {row.status === 'Active' ? (
            <button className="rounded p-1 text-green-600 hover:bg-green-50" title="Engeli Kaldır">
              <Unlock className="h-4 w-4" />
            </button>
          ) : (
            <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Engelle">
              <Lock className="h-4 w-4" />
            </button>
          )}
          <button className="rounded p-1 text-red-600 hover:bg-red-50" title="Sil">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const blockTypes = ['Manual', 'Automatic', 'Temporary']
  const statuses = ['Active', 'Expired', 'Whitelist']
  const severities = ['Low', 'Medium', 'High', 'Critical']
  
  const activeBlocks = filtered.filter(ip => ip.status === 'Active').length
  const criticalBlocks = filtered.filter(ip => ip.severity === 'Critical').length
  const totalAttempts = filtered.reduce((sum, ip) => sum + ip.attempts, 0)
  const uniqueCountries = new Set(filtered.map(ip => ip.country)).size

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-red-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          IP Engelle
        </button>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {blockTypes.map(type => (
            <option key={type} value={type}>
              {type === 'Manual' ? 'Manuel' : 
               type === 'Automatic' ? 'Otomatik' : 'Geçici'}
            </option>
          ))}
        </select>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Durumlar</option>
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'Active' ? 'Aktif' : 
               status === 'Expired' ? 'Süresi Dolmuş' : 'Beyaz Liste'}
            </option>
          ))}
        </select>
        <select 
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Önem Seviyeleri</option>
          {severities.map(severity => (
            <option key={severity} value={severity}>
              {severity === 'Low' ? 'Düşük' : 
               severity === 'Medium' ? 'Orta' : 
               severity === 'High' ? 'Yüksek' : 'Kritik'}
            </option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="IP adresi, neden veya ülke ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button 
          onClick={() => {
            // exportToCsv('ip-engelleme-savunma.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Engellenmiş IP
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card dark:bg-gray-800 p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Aktif Engeller</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{activeBlocks}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Kritik Tehditler</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">{criticalBlocks}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Toplam Deneme</h3>
          <p className="text-2xl font-bold text-purple-600">{totalAttempts}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Ülke Sayısı</h3>
          <p className="text-2xl font-bold text-blue-600">{uniqueCountries}</p>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Tehdit Seviyeleri</h3>
          <div className="space-y-2">
            {severities.map(severity => {
              const count = filtered.filter(ip => ip.severity === severity).length
              const percentage = filtered.length > 0 ? (count / filtered.length * 100).toFixed(1) : 0
              const label = severity === 'Low' ? 'Düşük' : 
                           severity === 'Medium' ? 'Orta' : 
                           severity === 'High' ? 'Yüksek' : 'Kritik'
              const color = severity === 'Low' ? 'bg-gray-500' : 
                           severity === 'Medium' ? 'bg-yellow-500' : 
                           severity === 'High' ? 'bg-orange-500' : 'bg-red-500'
              
              return (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded bg-gray-200">
                      <div 
                        className={`h-full rounded ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count} (%{percentage})</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Engelleme Türleri</h3>
          <div className="space-y-2">
            {blockTypes.map(type => {
              const count = filtered.filter(ip => ip.blockType === type).length
              const percentage = filtered.length > 0 ? (count / filtered.length * 100).toFixed(1) : 0
              const label = type === 'Manual' ? 'Manuel' : 
                           type === 'Automatic' ? 'Otomatik' : 'Geçici'
              const color = type === 'Manual' ? 'bg-blue-500' : 
                           type === 'Automatic' ? 'bg-green-500' : 'bg-yellow-500'
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded bg-gray-200">
                      <div 
                        className={`h-full rounded ${color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count} (%{percentage})</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} />

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">IP Adresi Engelle</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">IP Adresi</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" placeholder="192.168.1.10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Engelleme Nedeni</label>
                <textarea className="mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600" rows={3} placeholder="Engelleme nedenini açıklayın..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Engelleme Tipi</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                    <option value="Manual">Manuel</option>
                    <option value="Automatic">Otomatik</option>
                    <option value="Temporary">Geçici</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Önem Seviyesi</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Low">Düşük</option>
                    <option value="Medium">Orta</option>
                    <option value="High">Yüksek</option>
                    <option value="Critical">Kritik</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Son Erişim Tarihi (Opsiyonel)</label>
                <input type="datetime-local" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Deneme Sayısı</label>
                  <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Ülke (Opsiyonel)</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="Türkiye" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  Kalıcı engelleme (Son kullanma tarihi yok)
                </label>
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
                  className="flex-1 rounded bg-red-600 px-4 py-2 text-sm text-white"
                >
                  Engelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
