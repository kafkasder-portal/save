import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Coins, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { Modal } from '@components/Modal'

interface DonationMethod {
  id: number
  name: string
  code: string
  description: string
  icon: React.ReactNode
  fee: number
  isActive: boolean
  totalDonations: number
  createdAt: string
}

export default function DonationMethods() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<DonationMethod | null>(null)

  const [methods] = useState<DonationMethod[]>([
    {
      id: 1,
      name: "Nakit Bağış",
      code: "CASH",
      description: "Nakit olarak yapılan bağışlar",
      icon: <Banknote className="h-5 w-5" />,
      fee: 0,
      isActive: true,
      totalDonations: 250000,
      createdAt: "2024-01-01"
    },
    {
      id: 2,
      name: "Kredi Kartı",
      code: "CC",
      description: "Kredi kartı ile online bağışlar",
      icon: <CreditCard className="h-5 w-5" />,
      fee: 2.5,
      isActive: true,
      totalDonations: 450000,
      createdAt: "2024-01-01"
    },
    {
      id: 3,
      name: "Banka Havalesi",
      code: "BANK",
      description: "Banka havalesi ile yapılan bağışlar",
      icon: <Coins className="h-5 w-5" />,
      fee: 0,
      isActive: true,
      totalDonations: 180000,
      createdAt: "2024-01-01"
    },
    {
      id: 4,
      name: "SMS Bağış",
      code: "SMS",
      description: "SMS ile yapılan mikro bağışlar",
      icon: <Smartphone className="h-5 w-5" />,
      fee: 1.5,
      isActive: false,
      totalDonations: 25000,
      createdAt: "2024-01-01"
    }
  ])

  const filteredMethods = methods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (method: DonationMethod) => {
    setEditingMethod(method)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingMethod(null)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Coins className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Bağış Yöntemleri</h1>
        </div>
        <p className="text-gray-600">
          Kabul edilen bağış yöntemlerini ve ödeme seçeneklerini yönetin
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Bağış yöntemi ara..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Yeni Yöntem Ekle
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yöntem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Komisyon (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Bağış
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
              {filteredMethods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-gray-500 mr-3">
                        {method.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {method.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {method.fee > 0 ? `%${method.fee}` : 'Ücretsiz'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₺{method.totalDonations.toLocaleString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {method.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(method)}
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingMethod ? 'Bağış Yöntemi Düzenle' : 'Yeni Bağış Yöntemi Ekle'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yöntem Adı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  defaultValue={editingMethod?.name || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  defaultValue={editingMethod?.code || ''}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                defaultValue={editingMethod?.description || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Komisyon Oranı (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                defaultValue={editingMethod?.fee || 0}
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  defaultChecked={editingMethod?.isActive ?? true}
                />
                <span className="ml-2 text-sm text-gray-900">Aktif</span>
              </label>
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
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
            >
              {editingMethod ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
