import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, UserCheck } from 'lucide-react'
import { Modal } from '@components/Modal'
import { log } from '@/utils/logger'

interface UnitRole {
  id: number
  name: string
  description: string
  permissions: string[]
  unitCount: number
  createdAt: string
  isActive: boolean
}

export default function UnitRoles() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [idFilter, setIdFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<UnitRole | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [roles] = useState<UnitRole[]>([
    {
      id: 1,
      name: "Yönetici",
      description: "Tam yetki sahibi kullanıcı",
      permissions: ["Okuma", "Yazma", "Silme", "Yönetim"],
      unitCount: 3,
      createdAt: "2024-01-15",
      isActive: true
    },
    {
      id: 2, 
      name: "Editör",
      description: "İçerik düzenleme yetkisi",
      permissions: ["Okuma", "Yazma"],
      unitCount: 12,
      createdAt: "2024-01-10",
      isActive: true
    },
    {
      id: 3,
      name: "Görüntüleyici", 
      description: "Sadece görüntüleme yetkisi",
      permissions: ["Okuma"],
      unitCount: 25,
      createdAt: "2024-01-05",
      isActive: false
    }
  ])

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' ||
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'passive' && !role.isActive) ||
                         statusFilter === 'all'
    const matchesId = idFilter === '' || role.id.toString().includes(idFilter)

    return matchesSearch && matchesStatus && matchesId
  })

  const totalItems = filteredRoles.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage)

  const handleEdit = (role: UnitRole) => {
    setEditingRole(role)
    setIsModalOpen(true)
  }

  // Sayfa kontrolü - eğer mevcut sayfa toplam sayfa sayısından büyükse, son sayfaya git
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handleAdd = () => {
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const handleViewDetails = (role: UnitRole) => {
    log.info('View details for role:', role.id)
    // View logic here
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Birim Rolleri</h1>
        </div>
        <p className="text-gray-600">
          Sistem içindeki birim rollerini ve yetki seviyelerini yönetin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ID ↵"
                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={idFilter}
                onChange={(e) => setIdFilter(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Aktif Tanımlar</option>
                <option value="active">Aktif Tanımlar</option>
                <option value="passive">Pasif Tanımlar</option>
                <option value="all">Tümü</option>
              </select>
              <input
                type="text"
                placeholder="Birim Rol Tanımı"
                className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Search action - already handled by filters
                }}
                className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Search className="h-3 w-3" />
                Ara
              </button>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setIdFilter('')
                  setCurrentPage(1)
                }}
                className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Temizle
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Ekle
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto text-sm text-gray-600">
              <span>{totalItems} Kayıt</span>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || totalItems === 0}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Önceki sayfa</span>
                ‹
              </button>
              <input
                type="text"
                value={currentPage.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') return
                  const page = parseInt(value)
                  if (!isNaN(page) && page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="w-12 px-1 py-0.5 text-center text-xs border border-gray-300 rounded"
              />
              <span>/ {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalItems === 0}
                className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Sonraki sayfa</span>
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yetkiler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birim Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(role)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{role.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{role.unitCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {role.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(role)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingRole ? 'Rol Düzenle' : 'Yeni Rol Ekle'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol Adı
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingRole?.name || ''}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={editingRole?.description || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yetkiler
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Okuma', 'Yazma', 'Silme', 'Yönetim'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      defaultChecked={editingRole?.permissions.includes(permission)}
                    />
                    <span className="ml-2 text-sm text-gray-900">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              {editingRole ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
