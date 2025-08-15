import { useState } from 'react'
import { 
  Users, 
  Shield, 
  Search, 
  Edit, 
  Eye, 
  EyeOff, 
  UserCheck,
  UserX,
  Download
} from 'lucide-react'
// import { useUserManagement } from '@hooks/useUserManagement' // Removed - file deleted
import { getRoleDisplayName, type UserRole } from '@/types/permissions'
// import type { UserWithProfile } from '../../api/userManagement' // Removed - file deleted
// import RoleChangeModal from '@components/system/RoleChangeModal' // Removed - file deleted
// import UserProfileModal from '@components/system/UserProfileModal' // Removed - file deleted
// import UserStatistics from '@components/system/UserStatistics' // Removed - file deleted
// import Loading from '@components/Loading' // Removed - file deleted

interface UserTableProps {
  users: any[] // Changed from UserWithProfile[] to any[]
  canManageUsers: boolean
  onRoleChange: (user: any) => void // Changed from UserWithProfile to any
  onProfileEdit: (user: any) => void // Changed from UserWithProfile to any
  onStatusToggle: (userId: string, isActive: boolean) => Promise<any>
  isUpdating: boolean
}

function UserTable({ 
  users, 
  canManageUsers, 
  onRoleChange, 
  onProfileEdit, 
  onStatusToggle,
  isUpdating 
}: UserTableProps) {
  const getRoleColor = (role: UserRole): string => {
    const colors = {
      super_admin: 'text-red-600 bg-red-50',
      admin: 'text-orange-600 bg-orange-50',
      manager: 'text-purple-600 bg-purple-50',
      coordinator: 'text-blue-600 bg-blue-50',
      operator: 'text-green-600 bg-green-50',
      viewer: 'text-gray-600 bg-gray-50'
    }
    return colors[role] || 'text-gray-600 bg-gray-50'
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Hiçbir zaman'
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kullanıcı
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departman
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Son Giriş
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kayıt Tarihi
            </th>
            {canManageUsers && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name || user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.department || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.is_active ? (
                    <div className="flex items-center text-green-600">
                      <UserCheck className="h-4 w-4 mr-1" />
                      <span className="text-sm">Aktif</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <UserX className="h-4 w-4 mr-1" />
                      <span className="text-sm">Pasif</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.last_sign_in_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.created_at)}
              </td>
              {canManageUsers && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onProfileEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Profil Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRoleChange(user)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Rol Değiştir"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onStatusToggle(user.id, !user.is_active)}
                      disabled={isUpdating}
                      className={`${
                        user.is_active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={user.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                    >
                      {user.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Henüz hiç kullanıcı kaydedilmemiş veya arama kriterlerinize uygun kullanıcı yok.
          </p>
        </div>
      )}
    </div>
  )
}

export default function UserManagement() {
  // const { // Removed - file deleted
  //   users,
  //   permissions,
  //   statistics,
  //   selectedUser,
  //   isLoading,
  //   isUpdating,
  //   error,
  //   showRoleModal,
  //   showProfileModal,
  //   handleRoleChange,
  //   handleProfileUpdate,
  //   handleStatusToggle,
  //   selectUserForRoleChange,
  //   selectUserForProfileEdit,
  //   closeModals,
  //   search,
  //   refetchUsers
  // } = useUserManagement() // Removed - file deleted

  // Mock data
  const users: any[] = []
  const permissions = {}
  const statistics = {}
  const selectedUser = null
  const isLoading = false
  const isUpdating = false
  const error = null
  const showRoleModal = false
  const showProfileModal = false
  const handleRoleChange = () => {}
  const handleProfileUpdate = () => {}
  const handleStatusToggle = async () => {}
  const selectUserForRoleChange = () => {}
  const selectUserForProfileEdit = () => {}
  const closeModals = () => {}
  const search = { searchQuery: '' }
  const refetchUsers = () => {}

  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Yetki kontrolü - TÜM YETKİLER AÇIK
  const canManageUsers = true

  // Filtreleme
  const filteredUsers = users.filter(user => {
    const matchesSearch = search.searchQuery.length <= 2 || 
      user.email.toLowerCase().includes(search.searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(search.searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.searchQuery.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  })

  // CSV export function
  const exportToCSV = () => {
    const headers = ['Ad Soyad', 'Email', 'Rol', 'Departman', 'Durum', 'Son Giriş', 'Kayıt Tarihi']
    const csvData = filteredUsers.map(user => [
      user.full_name || user.email,
      user.email,
      getRoleDisplayName(user.role),
      user.department || '',
      user.is_active ? 'Aktif' : 'Pasif',
      user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR') : 'Hiçbir zaman',
      new Date(user.created_at).toLocaleDateString('tr-TR')
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `kullanicilar-${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-sm">
            Kullanıcı verileri yüklenirken hata oluştu
          </div>
          <button
            onClick={() => refetchUsers()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!canManageUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erişim Reddedildi</h3>
          <p className="mt-1 text-sm text-gray-500">
            Kullanıcı yönetimi için yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem kullanıcılarını yönetin ve rollerini düzenleyin.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          CSV İndir
        </button>
      </div>

      {/* Statistics */}
      {/* {statistics && <UserStatistics statistics={statistics} />} // Removed - file deleted */}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={search.searchQuery}
              onChange={(e) => {}}
              className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as UserRole | 'all')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tüm Roller</option>
              <option value="super_admin">Süper Yönetici</option>
              <option value="admin">Yönetici</option>
              <option value="manager">Müdür</option>
              <option value="coordinator">Koordinatör</option>
              <option value="operator">Operatör</option>
              <option value="viewer">Görüntüleyici</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-center text-sm text-gray-500">
            {filteredUsers.length} kullanıcı gösteriliyor
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <UserTable
          users={filteredUsers}
          canManageUsers={canManageUsers}
          onRoleChange={selectUserForRoleChange}
          onProfileEdit={selectUserForProfileEdit}
          onStatusToggle={handleStatusToggle}
          isUpdating={isUpdating}
        />
      </div>

      {/* Modals */}
      {/* {showRoleModal && selectedUser && ( // Removed - file deleted
        <RoleChangeModal
          isOpen={showRoleModal}
          onClose={closeModals}
          user={selectedUser}
          onRoleChange={handleRoleChange}
          currentUserRole={permissions?.profile?.role}
        />
      )}

      {showProfileModal && selectedUser && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={closeModals}
          user={selectedUser}
          onSave={handleProfileUpdate}
        />
      )} */}
    </div>
  )
}
