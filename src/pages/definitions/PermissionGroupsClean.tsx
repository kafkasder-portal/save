import { useState } from 'react'
import { Search, Eraser, Plus, ArrowUpDown } from 'lucide-react'
import { log } from '@/utils/logger'

interface PermissionGroup {
  id: number
  name: string
  type: string
  isDefault: boolean
  fundAuthority: string
  fundRegionAuthority: string
  status: 'Aktif' | 'Pasif'
}

export default function PermissionGroupsClean() {
  const [searchId, setSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showClearButton, setShowClearButton] = useState(false)

  // Mock data based on the HTML content
  const [permissionGroups] = useState<PermissionGroup[]>([
    {
      id: 1,
      name: 'Yönetici',
      type: 'Portal',
      isDefault: false,
      fundAuthority: 'Tüm Fonlar',
      fundRegionAuthority: 'Evet',
      status: 'Aktif'
    },
    {
      id: 2,
      name: 'Standart Kullanıcı',
      type: 'Portal',
      isDefault: false,
      fundAuthority: 'Sadece İzin Verilenler',
      fundRegionAuthority: '',
      status: 'Aktif'
    }
  ])

  const handleSearch = () => {
    log.debug('Searching...', { searchId, statusFilter, nameFilter })
    if (searchId || statusFilter || nameFilter) {
      setShowClearButton(true)
    }
  }

  const handleClear = () => {
    setSearchId('')
    setStatusFilter('')
    setNameFilter('')
    setShowClearButton(false)
  }

  const handleAdd = () => {
    log.info('Adding new permission group...')
  }

  const handleViewDetails = (id: number) => {
    log.info('Viewing details for permission group:', id)
  }

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Search and Filter Bar */}
      <div className="bg-white shadow-sm border-b px-4 py-3 h-12 overflow-x-auto overflow-y-hidden">
        <div className="flex items-start justify-between gap-1 min-w-max">
          <div className="flex items-center gap-1 h-7">
            <input
              type="text"
              size={5}
              placeholder="ID ↵"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-sm bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 font-arial w-10"
            />
            
            <select
              name="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-1 py-1.5 text-xs border border-gray-300 rounded-sm bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 font-arial"
            >
              <option value="">Aktif Erişim Düzeyleri</option>
              <option value="passive">Pasif Erişim Düzeyleri</option>
              <option value="all">Tümü</option>
            </select>
            
            <input
              type="text"
              name="name"
              size={20}
              placeholder="Erişim Düzeyi Tanımı"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-sm bg-white shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 font-arial w-36"
            />
            
            <button
              type="button"
              onClick={handleSearch}
              className="px-2 py-1.5 text-xs bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors font-bold flex items-center gap-1.5 font-arial"
            >
              <Search className="h-3 w-3" />
              <span>Ara</span>
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              className={`px-2 py-1.5 text-xs bg-red-700 text-white rounded-sm hover:bg-red-800 transition-colors font-bold flex items-center gap-1.5 font-arial ${showClearButton ? 'block' : 'hidden'}`}
            >
              <Eraser className="h-3 w-3" />
              <span>Temizle</span>
              <div className="ml-3 opacity-80 text-xs">
                0
              </div>
            </button>
            
            <button
              onClick={handleAdd}
              className="px-2 py-1.5 text-xs bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors font-bold flex items-center gap-1.5 font-arial"
            >
              <Plus className="h-3 w-3" />
              <span>Ekle</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-xs pl-1.5 h-7">
            <span className="whitespace-nowrap">{permissionGroups.length} Kayıt</span>
            <div className="flex items-center gap-1">
              <span 
                className="w-5 h-6 bg-center bg-no-repeat opacity-40 cursor-pointer inline-block"
                style={{
                  backgroundImage: 'url("https://kafkasder.sistem.plus/resource/image/nav-prev.png")',
                  marginTop: '-1px',
                  verticalAlign: 'middle'
                }}
              />
              <input
                name="page"
                type="text"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-7 px-1 py-0.5 text-xs text-center border border-gray-300 rounded-sm bg-white shadow-inner font-arial"
                style={{ marginTop: '-2px', verticalAlign: 'middle' }}
              />
              <span className="text-xs">/ 1</span>
              <span 
                className="w-5 h-6 bg-center bg-no-repeat opacity-40 cursor-pointer inline-block"
                style={{
                  backgroundImage: 'url("https://kafkasder.sistem.plus/resource/image/nav-next.png")',
                  marginTop: '-1px',
                  verticalAlign: 'middle'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="absolute top-12 bottom-0 left-0 right-0 overflow-auto clear-both p-2.5">
        <table className="w-full border-collapse bg-white shadow-sm border border-gray-200">
          <thead>
            <tr>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center min-w-3 h-6">
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Erişim Düzeyi Tanımı
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Tür
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Varsayılan
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Fon Yetkisi
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Fon Bölge Yetkisi
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center whitespace-nowrap h-6">
                Durum
              </th>
              <th className="bg-gray-200 border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-center h-6">
              </th>
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map((group) => (
              <tr key={group.id}>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  <button
                    onClick={() => handleViewDetails(group.id)}
                    className="inline-block h-4 w-3 cursor-pointer text-gray-600 hover:text-gray-800"
                  >
                    <Search className="h-3 w-3" />
                  </button>
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.name}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.type}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.isDefault ? 'Evet' : ''}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.fundAuthority}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.fundRegionAuthority}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6">
                  {group.status}
                </td>
                <td className="bg-white border border-gray-200 px-2.5 py-1.5 text-xs text-left whitespace-nowrap h-6 cursor-pointer">
                  <ArrowUpDown className="h-3 w-2 text-gray-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
