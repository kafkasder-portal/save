import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Building, Users } from 'lucide-react'
import { Modal } from '@components/Modal'

interface Unit {
  id: number
  name: string
  code: string
  description: string
  parentUnit?: string
  manager: string
  employeeCount: number
  isActive: boolean
  createdAt: string
}

export default function Units() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)

  const [units] = useState<Unit[]>([
    {
      id: 1,
      name: "Genel Müdürlük",
      code: "GM",
      description: "Ana yönetim birimi", 
      manager: "Ahmet Yılmaz",
      employeeCount: 5,
      isActive: true,
      createdAt: "2024-01-01"
    },
    {
      id: 2,
      name: "İnsan Kaynakları",
      code: "IK",
      description: "İnsan kaynakları ve personel işleri",
      parentUnit: "Genel Müdürlük",
      manager: "Ayşe Demir",
      employeeCount: 8,
      isActive: true,
      createdAt: "2024-01-05"
    },
    {
      id: 3,
      name: "Muhasebe",
      code: "MUH",
      description: "Mali işler ve muhasebe",
      parentUnit: "Genel Müdürlük", 
      manager: "Mehmet Kaya",
      employeeCount: 12,
      isActive: true,
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      name: "Bağış Koordinasyon",
      code: "BK",
      description: "Bağış toplama ve koordinasyon işleri",
      parentUnit: "Genel Müdürlük",
      manager: "Fatma Öztürk",
      employeeCount: 15,
      isActive: false,
      createdAt: "2024-01-15"
    }
  ])

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingUnit(null)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Birimler</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Organizasyon birimlerini ve hiyerarşik yapıyı yönetin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Birim ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Yeni Birim Ekle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Birim Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Üst Birim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Yönetici
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Çalışan Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{unit.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{unit.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {unit.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{unit.parentUnit || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                  <div className="text-sm text-gray-900 dark:text-gray-100">{unit.manager}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{unit.employeeCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      unit.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {unit.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="text-green-600 hover:text-green-900"
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {editingUnit ? 'Birim Düzenle' : 'Yeni Birim Ekle'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birim Adı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
                  defaultValue={editingUnit?.name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birim Kodu
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
                  defaultValue={editingUnit?.code || ''}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
                defaultValue={editingUnit?.description || ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Üst Birim
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100">
                  <option value="">Üst birim seçin</option>
                  <option value="Genel Müdürlük">Genel Müdürlük</option>
                  <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yönetici
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-gray-100"
                  defaultValue={editingUnit?.manager || ''}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 dark:bg-gray-800"
                  defaultChecked={editingUnit?.isActive ?? true}
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
            >
              {editingUnit ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
