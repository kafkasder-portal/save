import { useMemo, useState } from 'react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted
import { Plus, Edit, Trash2, Network, Shield, MapPin } from 'lucide-react'

interface LocalIP {
  id: string
  ipAddress: string
  location: string
  description: string
  type: 'Office' | 'Home' | 'Branch' | 'Data Center' | 'VPN'
  status: 'Active' | 'Inactive' | 'Blocked'
  lastAccess: string
  accessCount: number
  assignedUser: string
  notes: string
  macAddress: string
  deviceName: string
}

const mockLocalIPs: LocalIP[] = [
  {
    id: '1',
    ipAddress: '192.168.1.10',
    location: 'İstanbul Merkez Ofis',
    description: 'Genel Müdür Masaüstü',
    type: 'Office',
    status: 'Active',
    lastAccess: '2024-01-15 09:30:22',
    accessCount: 1247,
    assignedUser: 'Ahmet Yılmaz',
    notes: 'Ana yönetim bilgisayarı',
    macAddress: '00:1B:44:11:3A:B7',
    deviceName: 'DESKTOP-GM001'
  },
  {
    id: '2',
    ipAddress: '192.168.1.25',
    location: 'İstanbul Merkez Ofis',
    description: 'Muhasebe Departmanı',
    type: 'Office',
    status: 'Active',
    lastAccess: '2024-01-15 08:45:12',
    accessCount: 892,
    assignedUser: 'Fatma Demir',
    notes: 'Muhasebe işlemleri için ayrılmış',
    macAddress: '00:1B:44:11:3A:C2',
    deviceName: 'DESKTOP-ACC001'
  },
  {
    id: '3',
    ipAddress: '192.168.2.15',
    location: 'Ankara Şube',
    description: 'Şube Müdürü Laptop',
    type: 'Branch',
    status: 'Active',
    lastAccess: '2024-01-14 16:20:45',
    accessCount: 567,
    assignedUser: 'Mehmet Öz',
    notes: 'Mobil erişim için yapılandırılmış',
    macAddress: '00:1B:44:22:4B:C8',
    deviceName: 'LAPTOP-ANK001'
  },
  {
    id: '4',
    ipAddress: '10.0.0.50',
    location: 'Veri Merkezi',
    description: 'Backup Server',
    type: 'Data Center',
    status: 'Active',
    lastAccess: '2024-01-15 02:00:00',
    accessCount: 2456,
    assignedUser: 'Sistem Admini',
    notes: 'Otomatik yedekleme sistemi',
    macAddress: '00:1B:44:33:5C:D9',
    deviceName: 'SRV-BACKUP01'
  },
  {
    id: '5',
    ipAddress: '192.168.1.99',
    location: 'İstanbul Merkez Ofis',
    description: 'Misafir Erişimi',
    type: 'Office',
    status: 'Inactive',
    lastAccess: '2024-01-10 14:30:12',
    accessCount: 45,
    assignedUser: 'Misafir',
    notes: 'Geçici erişim için ayrılmış',
    macAddress: '00:1B:44:44:6D:EA',
    deviceName: 'GUEST-DEVICE'
  },
  {
    id: '6',
    ipAddress: '172.16.0.20',
    location: 'VPN Ağı',
    description: 'Uzaktan Çalışan',
    type: 'VPN',
    status: 'Blocked',
    lastAccess: '2024-01-12 10:15:30',
    accessCount: 234,
    assignedUser: 'Ayşe Kaya',
    notes: 'Güvenlik ihlali nedeniyle engellenmiş',
    macAddress: '00:1B:44:55:7E:FB',
    deviceName: 'LAPTOP-REMOTE01'
  }
]

export default function LocalIPs() {
  const [query, setQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  const filtered = useMemo(() => {
    let result = mockLocalIPs
    
    if (selectedType !== 'all') {
      result = result.filter(ip => ip.type === selectedType)
    }
    
    if (selectedStatus !== 'all') {
      result = result.filter(ip => ip.status === selectedStatus)
    }
    
    if (query) {
      result = result.filter((ip) => 
        JSON.stringify(ip).toLowerCase().includes(query.toLowerCase())
      )
    }
    
    return result
  }, [query, selectedType, selectedStatus])

  const columns: Column<LocalIP>[] = [
    { 
      key: 'ipAddress', 
      header: 'IP Adresi',
      render: (value: unknown) => (
        <span className="font-mono text-sm">{String(value || '')}</span>
      )
    },
    { key: 'deviceName', header: 'Cihaz Adı' },
    { key: 'location', header: 'Lokasyon' },
    { key: 'assignedUser', header: 'Atanan Kullanıcı' },
    { 
      key: 'type', 
      header: 'Tip',
      render: (value: unknown) => {
        const colors = {
          'Office': 'bg-blue-100 text-blue-700',
          'Home': 'bg-green-100 text-green-700',
          'Branch': 'bg-purple-100 text-purple-700',
          'Data Center': 'bg-orange-100 text-orange-700',
          'VPN': 'bg-gray-100 text-gray-700'
        } as const
        const labels = {
          'Office': 'Ofis',
          'Home': 'Ev',
          'Branch': 'Şube',
          'Data Center': 'Veri Merkezi',
          'VPN': 'VPN'
        } as const
        const type = String(value || 'Office') as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[type] || colors['Office']}`}>
            {labels[type] || labels['Office']}
          </span>
        )
      }
    },
    { 
      key: 'status', 
      header: 'Durum',
      render: (value: unknown) => {
        const colors = {
          'Active': 'bg-green-100 text-green-700',
          'Inactive': 'bg-yellow-100 text-yellow-700',
          'Blocked': 'bg-red-100 text-red-700'
        } as const
        const labels = {
          'Active': 'Aktif',
          'Inactive': 'Pasif',
          'Blocked': 'Engellenmiş'
        } as const
        const status = String(value || 'Active') as keyof typeof colors
        return (
          <span className={`rounded-full px-2 py-1 text-xs ${colors[status] || colors['Active']}`}>
            {labels[status] || labels['Active']}
          </span>
        )
      }
    },
    { key: 'accessCount', header: 'Erişim Sayısı' },
    { key: 'lastAccess', header: 'Son Erişim' },
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

  const types = ['Office', 'Home', 'Branch', 'Data Center', 'VPN']
  const statuses = ['Active', 'Inactive', 'Blocked']
  
  const activeCount = filtered.filter(ip => ip.status === 'Active').length
  const blockedCount = filtered.filter(ip => ip.status === 'Blocked').length
  // const totalAccess = filtered.reduce((sum, ip) => sum + ip.accessCount, 0)
  const uniqueLocations = new Set(filtered.map(ip => ip.location)).size

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center gap-2 overflow-x-auto rounded border p-2">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni IP
        </button>
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded border bg-background px-2 py-1 text-sm"
        >
          <option value="all">Tüm Tipler</option>
          {types.map(type => (
            <option key={type} value={type}>
              {type === 'Office' ? 'Ofis' : 
               type === 'Home' ? 'Ev' : 
               type === 'Branch' ? 'Şube' : 
               type === 'Data Center' ? 'Veri Merkezi' : 'VPN'}
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
               status === 'Inactive' ? 'Pasif' : 'Engellenmiş'}
            </option>
          ))}
        </select>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="min-w-64 flex-1 rounded border px-2 py-1 text-sm" 
          placeholder="IP adresi, cihaz veya kullanıcı ara..." 
        />
        <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white">Ara</button>
        <button 
          onClick={() => {
            // exportToCsv('yerel-ip-adresleri.csv', filtered)
          }}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          İndir
        </button>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} IP Adresi
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Toplam IP</h3>
          </div>
          <p className="text-2xl font-bold">{filtered.length}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Aktif</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Engellenmiş</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
        </div>
        <div className="rounded border bg-card p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Lokasyon</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{uniqueLocations}</p>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold">Tip Dağılımı</h3>
          <div className="space-y-2">
            {types.map(type => {
              const count = filtered.filter(ip => ip.type === type).length
              const percentage = filtered.length > 0 ? (count / filtered.length * 100).toFixed(1) : 0
              const label = type === 'Office' ? 'Ofis' : 
                           type === 'Home' ? 'Ev' : 
                           type === 'Branch' ? 'Şube' : 
                           type === 'Data Center' ? 'Veri Merkezi' : 'VPN'
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded bg-gray-200">
                      <div 
                        className="h-full rounded bg-blue-500"
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
          <h3 className="mb-3 text-lg font-semibold">Durum Dağılımı</h3>
          <div className="space-y-2">
            {statuses.map(status => {
              const count = filtered.filter(ip => ip.status === status).length
              const percentage = filtered.length > 0 ? (count / filtered.length * 100).toFixed(1) : 0
              const label = status === 'Active' ? 'Aktif' : 
                           status === 'Inactive' ? 'Pasif' : 'Engellenmiş'
              const color = status === 'Active' ? 'bg-green-500' : 
                           status === 'Inactive' ? 'bg-yellow-500' : 'bg-red-500'
              
              return (
                <div key={status} className="flex items-center justify-between">
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

      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Yeni IP Adresi Ekle</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">IP Adresi</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="192.168.1.10" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cihaz Adı</label>
                  <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Açıklama</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Tip</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    {types.map(type => (
                      <option key={type} value={type}>
                        {type === 'Office' ? 'Ofis' : 
                         type === 'Home' ? 'Ev' : 
                         type === 'Branch' ? 'Şube' : 
                         type === 'Data Center' ? 'Veri Merkezi' : 'VPN'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Durum</label>
                  <select className="mt-1 w-full rounded border px-3 py-2 text-sm">
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Pasif</option>
                    <option value="Blocked">Engellenmiş</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Lokasyon</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Atanan Kullanıcı</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">MAC Adresi</label>
                <input type="text" className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="00:1B:44:11:3A:B7" />
              </div>
              <div>
                <label className="block text-sm font-medium">Notlar</label>
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
