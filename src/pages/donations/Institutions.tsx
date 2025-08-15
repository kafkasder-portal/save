import React, { useState, useMemo, FormEvent } from 'react'
// import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react'
import { DataTable } from '@components/DataTable'
import type { Column } from '@components/DataTable'
import { Modal } from '@components/Modal'
import { useFormSanitization } from '@hooks/useSanitization'

interface Institution {
  id: string
  name: string
  type: 'şirket' | 'vakıf' | 'dernek' | 'kamu'
  contactPerson: string
  phone: string
  email: string
  address: string
  totalDonations: number
  lastDonation: string
  status: 'aktif' | 'pasif'
}

const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'ABC Şirketi',
    type: 'şirket',
    contactPerson: 'Mehmet Özkan',
    phone: '0212 555 0101',
    email: 'mehmet@abc.com',
    address: 'İstanbul, Türkiye',
    totalDonations: 50000,
    lastDonation: '2024-01-15',
    status: 'aktif'
  },
  {
    id: '2',
    name: 'Yardım Vakfı',
    type: 'vakıf',
    contactPerson: 'Ayşe Kaya',
    phone: '0312 555 0202',
    email: 'ayse@yardimvakfi.org',
    address: 'Ankara, Türkiye',
    totalDonations: 75000,
    lastDonation: '2024-01-10',
    status: 'aktif'
  }
]

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'şirket' as Institution['type'],
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  })

  const filteredInstitutions = useMemo(() => 
    institutions.filter(inst => 
      JSON.stringify(inst).toLowerCase().includes(query.toLowerCase())
    ), [institutions, query]
  )

  const columns: Column<Institution>[] = [
    { key: 'name', header: 'Kurum Adı' },
    {
      key: 'type',
      header: 'Tür',
      render: (_, row: Institution) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.type === 'şirket' ? 'bg-blue-100 text-blue-800' :
          row.type === 'vakıf' ? 'bg-green-100 text-green-800' :
          row.type === 'dernek' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.type}
        </span>
      )
    },
    { key: 'contactPerson', header: 'İletişim Kişisi' },
    { key: 'phone', header: 'Telefon' },
    { key: 'email', header: 'E-posta' },
    {
      key: 'totalDonations',
      header: 'Toplam Bağış',
      render: (_, row: Institution) => `${row.totalDonations.toLocaleString('tr-TR')} ₺`
    },
    { key: 'lastDonation', header: 'Son Bağış' },
    {
      key: 'status',
      header: 'Durum',
      render: (_, row: Institution) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'id',
      header: 'İşlemler',
      render: (_, institution: Institution) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(institution)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Düzenle
          </button>
          <button
            onClick={() => handleDelete(institution.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Sil
          </button>
        </div>
      )
    }
  ]

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution)
    setFormData({
      name: institution.name,
      type: institution.type,
      contactPerson: institution.contactPerson,
      phone: institution.phone,
      email: institution.email,
      address: institution.address
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bu kurumu silmek istediğinizden emin misiniz?')) {
      setInstitutions(institutions.filter(inst => inst.id !== id))
    }
  }

  const { sanitizeFormField, createSanitizedChangeHandler } = useFormSanitization()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    // Sanitize form data before submission
    const sanitizedFormData = {
      name: sanitizeFormField(formData.name, 'text'),
      type: formData.type, // Select value, no sanitization needed
      contactPerson: sanitizeFormField(formData.contactPerson, 'text'),
      phone: sanitizeFormField(formData.phone, 'phone'),
      email: sanitizeFormField(formData.email, 'email'),
      address: sanitizeFormField(formData.address, 'text')
    }
    
    if (editingInstitution) {
      // Güncelleme
      setInstitutions(institutions.map(inst => 
        inst.id === editingInstitution.id 
          ? { ...inst, ...sanitizedFormData }
          : inst
      ))
    } else {
      // Yeni ekleme
      const newInstitution: Institution = {
        id: Date.now().toString(),
        ...sanitizedFormData,
        totalDonations: 0,
        lastDonation: '-',
        status: 'aktif'
      }
      setInstitutions([...institutions, newInstitution])
    }
    
    setIsModalOpen(false)
    setEditingInstitution(null)
    setFormData({
      name: '',
      type: 'şirket',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    })
  }

  const openAddModal = () => {
    setEditingInstitution(null)
    setFormData({
      name: '',
      type: 'şirket',
      contactPerson: '',
      phone: '',
      email: '',
      address: ''
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Kurumlar</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Yeni Kurum Ekle
          </button>
        </div>

        {/* Arama ve Filtreler */}
        <div className="flex items-center gap-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Kurum adı, kişi, telefon veya e-posta ile ara..."
          />
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Türler</option>
            <option value="şirket">Şirket</option>
            <option value="vakıf">Vakıf</option>
            <option value="dernek">Dernek</option>
            <option value="kamu">Kamu</option>
          </select>
          <select className="border rounded px-3 py-2">
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredInstitutions} />
      </div>

      {/* Kurum Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstitution ? 'Kurum Düzenle' : 'Yeni Kurum Ekle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kurum Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={createSanitizedChangeHandler(
                (value) => setFormData({...formData, name: value}),
                'text'
              )}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Tür</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as Institution['type']})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="şirket">Şirket</option>
              <option value="vakıf">Vakıf</option>
              <option value="dernek">Dernek</option>
              <option value="kamu">Kamu</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">İletişim Kişisi</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={createSanitizedChangeHandler(
                (value) => setFormData({...formData, contactPerson: value}),
                'text'
              )}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={createSanitizedChangeHandler(
                (value) => setFormData({...formData, phone: value}),
                'phone'
              )}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={createSanitizedChangeHandler(
                (value) => setFormData({...formData, email: value}),
                'email'
              )}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Adres</label>
            <textarea
              value={formData.address}
              onChange={createSanitizedChangeHandler(
                (value) => setFormData({...formData, address: value}),
                'text'
              )}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingInstitution ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
