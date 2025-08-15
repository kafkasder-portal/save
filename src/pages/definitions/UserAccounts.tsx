import { useState } from 'react'
import { Users, Mail, Phone, Edit2, Trash2, Plus, Search } from 'lucide-react'
import { Modal } from '@components/Modal'
import { useFormSanitization } from '@hooks/useSanitization'

interface UserAccount {
  id: number
  username: string
  fullName: string
  email: string
  phone: string
  role: string
  unit: string
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export default function UserAccounts() {
  const [searchTerm, setSearchTerm] = useState('')
  // const [selectedRole, setSelectedRole] = useState('')
  // const [selectedUnit, setSelectedUnit] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    unit: '',
    password: '',
    isActive: true
  })
  
  const { createSanitizedChangeHandler } = useFormSanitization()

  const [users] = useState<UserAccount[]>([
    {
      id: 1,
      username: "admin",
      fullName: "Sistem Yöneticisi",
      email: "admin@dernek.org",
      phone: "0532 123 4567",
      role: "Yönetici",
      unit: "Genel Müdürlük",
      isActive: true,
      lastLogin: "2024-01-20 14:30",
      createdAt: "2024-01-01"
    },
    {
      id: 2,
      username: "ayse.demir",
      fullName: "Ayşe Demir",
      email: "ayse.demir@dernek.org", 
      phone: "0533 234 5678",
      role: "Editör",
      unit: "İnsan Kaynakları",
      isActive: true,
      lastLogin: "2024-01-20 09:15",
      createdAt: "2024-01-05"
    },
    {
      id: 3,
      username: "mehmet.kaya",
      fullName: "Mehmet Kaya",
      email: "mehmet.kaya@dernek.org",
      phone: "0534 345 6789", 
      role: "Editör",
      unit: "Muhasebe",
      isActive: false,
      lastLogin: "2024-01-18 16:45",
      createdAt: "2024-01-10"
    }
  ])

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Hesapları</h1>
        </div>
        <p className="text-gray-600">
          Sistem kullanıcılarını ve hesap bilgilerini yönetin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Yeni Kullanıcı Ekle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol & Birim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.role}</div>
                      <div className="text-sm text-gray-500">{user.unit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.lastLogin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setFormData({
                            fullName: user.fullName,
                            username: user.username,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            unit: user.unit,
                            password: '',
                            isActive: user.isActive
                          })
                          setIsModalOpen(true)
                        }}
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
            {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={createSanitizedChangeHandler(
                    (value) => setFormData({...formData, fullName: value}),
                    'text'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={createSanitizedChangeHandler(
                    (value) => setFormData({...formData, username: value}),
                    'text'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={createSanitizedChangeHandler(
                    (value) => setFormData({...formData, email: value}),
                    'email'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={createSanitizedChangeHandler(
                    (value) => setFormData({...formData, phone: value}),
                    'phone'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Rol seçin</option>
                  <option value="Yönetici">Yönetici</option>
                  <option value="Editör">Editör</option>
                  <option value="Görüntüleyici">Görüntüleyici</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birim
                </label>
                <select 
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Birim seçin</option>
                  <option value="Genel Müdürlük">Genel Müdürlük</option>
                  <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                  <option value="Muhasebe">Muhasebe</option>
                </select>
              </div>
            </div>

            {!editingUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={createSanitizedChangeHandler(
                    (value) => setFormData({...formData, password: value}),
                    'text'
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-900">Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setIsModalOpen(false)
                setEditingUser(null)
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false)
                setEditingUser(null)
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
            >
              {editingUser ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
