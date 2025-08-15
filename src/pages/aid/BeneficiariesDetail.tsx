import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { supabase, type Database } from '@lib/supabase'
import RelatedRecordsModal from '@components/RelatedRecordsModal'

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row']

export default function BeneficiariesDetail() {
  const { id } = useParams()
  const [, setBeneficiary] = useState<Beneficiary | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [name, setName] = useState('Hatıce')
  const [surname, setSurname] = useState('Sayro')
  const [nationality] = useState('Rusya')
  const [identityNo, setIdentityNo] = useState('')
  const [validateMernis, setValidateMernis] = useState(false)
  const [category, setCategory] = useState('196')
  const [fundRegion, setFundRegion] = useState('2')
  const [fileRelation, setFileRelation] = useState('area')
  const [fileNumber, setFileNumber] = useState('347315')
  const [sponsorType, setSponsorType] = useState('')
  
  // Contact information
  const [gsmCode, setGsmCode] = useState('')
  const [gsmNumber, setGsmNumber] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [abroadPhone, setAbroadPhone] = useState('')
  const [email, setEmail] = useState('')
  
  // Guardian information
  const guardianName = 'Abdullah Haduev'
  const [relationToGuardian, setRelationToGuardian] = useState('270')
  const [removeRelation, setRemoveRelation] = useState(false)
  const [familySize, setFamilySize] = useState('0')
  
  // Location information
  const [country, setCountry] = useState('1')
  const [city, setCity] = useState('5196')
  const [town, setTown] = useState('6940')
  const [district, setDistrict] = useState('')
  const [address, setAddress] = useState('Başakşehir Kayabaşı Mah. Fetihtepe Cad. 13. Bölge Cy-6 D-36')
  
  // Status
  const [status, setStatus] = useState('0')
  const [deleteRecord, setDeleteRecord] = useState(false)
  const consentForm = 'Alınmadı'
  
  // Related records navigation
  const [activeRecordType, setActiveRecordType] = useState('documents')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModalType, setSelectedModalType] = useState('')

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      const { data: ben } = await supabase.from('beneficiaries').select('*').eq('id', id as string).maybeSingle()
      if (!isMounted) return
      setBeneficiary(ben ?? null)
      setLoading(false)
    }
    if (id) load()
    return () => { isMounted = false }
  }, [id])

  const handleRecordClick = (recordId: string) => {
    setActiveRecordType(recordId)
    setSelectedModalType(recordId)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedModalType('')
  }

  const getRecordCount = (recordType: string) => {
    const counts: Record<string, number> = {
      'documents': 6,
      'dependents': 4,
      'aid-requests': 1,
      'consent-statements': 1
    }
    return counts[recordType] || 0
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Yükleniyor...</div>
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg max-w-7xl mx-auto overflow-hidden">
        <header className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium flex items-center justify-between">
          <span>İhtiyaç Sahibi Kişi ID # 1012</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-green-500 hover:bg-green-400 rounded text-xs transition-colors">
              Kaydet
            </button>
            <button className="px-3 py-1 bg-gray-500 hover:bg-gray-400 rounded text-xs transition-colors">
              İptal
            </button>
          </div>
        </header>
        
        <div className="flex">
          {/* Left Side - Form */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-4 gap-6 text-sm">
              
              {/* Photo Section */}
              <div className="col-span-1">
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 h-32 w-full bg-gray-50 rounded-lg mb-3 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer group">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-gray-500 text-xs mt-1 block">Fotoğraf Ekle</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sponsorluk Tipi</label>
                    <select
                      value={sponsorType}
                      onChange={(e) => setSponsorType(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    >
                      <option value="">Seçiniz...</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Adını giriniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Soyadını giriniz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uyruk</label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={nationality}
                      readOnly
                      className="flex-1 text-sm border border-gray-300 rounded-l-md px-3 py-2 bg-gray-50 text-gray-500"
                    />
                    <button className="px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kimlik No</label>
                    <input
                      type="text"
                      value={identityNo}
                      onChange={(e) => setIdentityNo(e.target.value)}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="11 haneli kimlik no"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={validateMernis}
                      onChange={(e) => setValidateMernis(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-red-600 font-medium">
                      Mernis Kontrolü Yap
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="196">İhtiyaç Sahibi Aile</option>
                    <option value="338">Yetim Ailesi</option>
                    <option value="202">Mülteci Aile</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fon Bölgesi</label>
                  <select
                    value={fundRegion}
                    onChange={(e) => setFundRegion(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="2">Serbest</option>
                    <option value="3">Avrupa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Bağlantısı</label>
                  <select
                    value={fileRelation}
                    onChange={(e) => setFileRelation(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="area">Çalışma Sahası</option>
                    <option value="partner">Partner Kurum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Numarası</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      readOnly
                      className="w-16 text-sm border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                      placeholder="Auto"
                    />
                    <input
                      type="text"
                      value={fileNumber}
                      onChange={(e) => setFileNumber(e.target.value)}
                      className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Dosya numarası"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Guardian Information */}
              <div className="col-span-1 space-y-2">
                <div>
                  <label className="block text-xs mb-1">Cep Telefonu</label>
                  <div className="flex space-x-1">
                    <select 
                      value={gsmCode}
                      onChange={(e) => setGsmCode(e.target.value)}
                      className="w-12 text-xs border border-gray-300 px-1 py-1"
                    >
                      <option value=""></option>
                      <option value="532">532</option>
                      <option value="533">533</option>
                    </select>
                    <input 
                      type="text" 
                      value={gsmNumber}
                      onChange={(e) => setGsmNumber(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 px-1 py-1" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Sabit Telefon</label>
                  <div className="flex space-x-1">
                    <input 
                      type="text" 
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="w-8 text-xs border border-gray-300 px-1 py-1" 
                    />
                    <input 
                      type="text" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 text-xs border border-gray-300 px-1 py-1" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Yurtdışı Telefon</label>
                  <input 
                    type="text" 
                    value={abroadPhone}
                    onChange={(e) => setAbroadPhone(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1">e-Posta Adresi</label>
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1" 
                  />
                </div>
                
                <div className="border-t border-dotted border-gray-400 pt-2">
                  <label className="block text-xs mb-1">Bakmakla Yükümlü Olan Kişi</label>
                  <div className="flex">
                    <input 
                      readOnly 
                      type="text" 
                      value={guardianName}
                      className="flex-1 text-xs border border-gray-300 px-1 py-1 bg-gray-100" 
                    />
                    <Link 
                      to="/aid/beneficiaries/504"
                      className="w-6 border border-l-0 border-gray-300 bg-gray-100 flex items-center justify-center text-xs"
                    >
                      →
                    </Link>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <div className="flex-1">
                    <label className="block text-xs mb-1">Yakınlığı</label>
                    <select 
                      value={relationToGuardian}
                      onChange={(e) => setRelationToGuardian(e.target.value)}
                      className="w-full text-xs border border-gray-300 px-1 py-1"
                    >
                      <option value="270">Eş</option>
                      <option value="253">Çocuk</option>
                      <option value="277">Kardeş</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <input 
                      type="checkbox" 
                      checked={removeRelation}
                      onChange={(e) => setRemoveRelation(e.target.checked)}
                      className="scale-75" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Ailedeki Kişi Say��sı</label>
                  <select 
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1"
                  >
                    <option value="0">Yok</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>

              {/* Location & Status */}
              <div className="col-span-1 space-y-2">
                <div>
                  <label className="block text-xs mb-1">Ülke</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1"
                  >
                    <option value="1">Türkiye</option>
                    <option value="179">Rusya</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Şehir / Bölge</label>
                  <select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1"
                  >
                    <option value="5196">İstanbul (Avrupa)</option>
                    <option value="5195">İstanbul (Anadolu)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Yerleşim</label>
                  <select 
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1"
                  >
                    <option value="6940">Başakşehir</option>
                    <option value="6944">Arnavutköy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Mahalle / Köy</label>
                  <select 
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1"
                  >
                    <option value=""></option>
                    <option value="23011">Kayabaşı Mah.</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Adres</label>
                  <textarea 
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs border border-gray-300 px-1 py-1 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs mb-1">Rıza Beyanı</label>
                  <input 
                    readOnly 
                    type="text" 
                    value={consentForm}
                    className="w-full text-xs border border-gray-300 px-1 py-1 bg-gray-100" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-xs font-medium">Durum</label>
                  <label className="flex items-center text-xs">
                    <input 
                      type="radio" 
                      name="status"
                      checked={status === '0'}
                      onChange={() => setStatus('0')}
                      className="mr-1 scale-75" 
                    />
                    Taslak
                  </label>
                  <label className="flex items-center text-xs">
                    <input 
                      type="checkbox" 
                      checked={deleteRecord}
                      onChange={(e) => setDeleteRecord(e.target.checked)}
                      className="mr-1 scale-75" 
                    />
                    Kaydı Sil
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Related Records */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <header className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 text-gray-800 font-medium text-sm">
                🔗 Bağlantılı Kayıtlar
              </header>

              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {/* Row 1 */}
                  <button
                    onClick={() => handleRecordClick('bank-accounts')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'bank-accounts'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    ���� Banka Hesapları
                  </button>
                  <button
                    onClick={() => handleRecordClick('documents')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm relative ${
                      activeRecordType === 'documents'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📄 Dokümanlar
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">6</span>
                  </button>
                  <button
                    onClick={() => handleRecordClick('photos')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'photos'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📷 Fotoğraflar
                  </button>

                  {/* Row 2 */}
                  <button
                    onClick={() => handleRecordClick('orphans')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'orphans'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    👶 Baktığı Yetimler
                  </button>
                  <button
                    onClick={() => handleRecordClick('dependents')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm relative ${
                      activeRecordType === 'dependents'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    👨‍👩‍👧‍👦 Baktığı Kişiler
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">4</span>
                  </button>
                  <button
                    onClick={() => handleRecordClick('sponsors')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'sponsors'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    💝 Sponsorlar
                  </button>

                  {/* Row 3 */}
                  <button
                    onClick={() => handleRecordClick('references')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'references'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📝 Referanslar
                  </button>
                  <button
                    onClick={() => handleRecordClick('meeting-records')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'meeting-records'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    💬 Görüşme Kayıtları
                  </button>
                  <button
                    onClick={() => handleRecordClick('session-tracking')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'session-tracking'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📅 Görüşme Seans Takibi
                  </button>

                  {/* Row 4 */}
                  <button
                    onClick={() => handleRecordClick('aid-requests')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm relative ${
                      activeRecordType === 'aid-requests'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    🤲 Yardım Talepleri
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">1</span>
                  </button>
                  <button
                    onClick={() => handleRecordClick('aid-provided')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'aid-provided'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    ✅ Yapılan Yardımlar
                  </button>
                  <button
                    onClick={() => handleRecordClick('consent-statements')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm relative ${
                      activeRecordType === 'consent-statements'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📝 Rıza Beyanları
                    <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">1</span>
                  </button>

                  {/* Row 5 */}
                  <button
                    onClick={() => handleRecordClick('social-cards')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'social-cards'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    🎨 Sosyal Kartlar
                  </button>
                  <button
                    onClick={() => handleRecordClick('card-summary')}
                    className={`h-14 text-xs border rounded-md text-center transition-all duration-200 hover:shadow-sm ${
                      activeRecordType === 'card-summary'
                        ? 'bg-green-50 border-green-300 text-green-700 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    📈 Kart Özeti
                  </button>
                  <div className="h-14"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Records Modal */}
      <RelatedRecordsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        recordType={selectedModalType}
        recordCount={getRecordCount(selectedModalType)}
      />
    </div>
  )
}
