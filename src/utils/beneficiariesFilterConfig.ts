// Filter configuration for beneficiaries - must match AdvancedSearchModal types
export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'dateRange' | 'numberRange' | 'radio'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface QuickFilter {
  key: string
  label: string
  filters: Record<string, any>
  badge?: string
}

export interface URLConfig {
  baseUrl: string
  searchParam: string
}

export interface SavedFiltersConfig {
  storageKey: string
  maxSavedFilters: number
}

export interface FilterGroup {
  id: string
  label: string
  fields: string[]
  collapsible?: boolean
  defaultOpen?: boolean
}

export interface FilterDependency {
  field: string
  dependsOn: string
  condition: (value: any) => boolean
  action: 'show' | 'hide' | 'enable' | 'disable'
}

export interface FilterConfig {
  fields: FilterField[]
  groups: FilterGroup[]
  dependencies: FilterDependency[]
  validationRules: Record<string, any>
}

export function createBeneficiariesFilterConfig(): FilterConfig {
  return {
    fields: [
      {
        key: 'name',
        label: 'Ad',
        type: 'text',
        placeholder: 'Ad ile ara...'
      },
      {
        key: 'surname',
        label: 'Soyad',
        type: 'text',
        placeholder: 'Soyad ile ara...'
      },
      {
        key: 'identity_no',
        label: 'Kimlik No',
        type: 'text',
        placeholder: 'Kimlik numarası...',
        validation: {
          pattern: '^[0-9]{11}$'
        }
      },
      {
        key: 'category',
        label: 'Kategori',
        type: 'select',
        options: [
          { value: 'Yetim Ailesi', label: 'Yetim Ailesi' },
          { value: 'Muhtaç Aile', label: 'Muhtaç Aile' },
          { value: 'Yaşlı', label: 'Yaşlı' },
          { value: 'Engelli', label: 'Engelli' },
          { value: 'Hasta', label: 'Hasta' }
        ]
      },
      {
        key: 'nationality',
        label: 'Uyruk',
        type: 'select',
        options: [
          { value: 'T.C.', label: 'T.C.' },
          { value: 'Suriye', label: 'Suriye' },
          { value: 'Afganistan', label: 'Afganistan' },
          { value: 'Irak', label: 'Irak' },
          { value: 'Diğer', label: 'Diğer' }
        ]
      },
      {
        key: 'status',
        label: 'Durum',
        type: 'select',
        options: [
          { value: 'active', label: 'Aktif' },
          { value: 'inactive', label: 'Pasif' },
          { value: 'suspended', label: 'Geçici' },
          { value: 'pending', label: 'Beklemede' }
        ]
      },
      {
        key: 'phone',
        label: 'Telefon',
        type: 'text',
        placeholder: 'Telefon numarası...'
      },
      {
        key: 'city',
        label: 'Şehir',
        type: 'text',
        placeholder: 'Şehir adı...'
      },
      {
        key: 'district',
        label: 'İlçe',
        type: 'text',
        placeholder: 'İlçe adı...'
      },
      {
        key: 'birth_date',
        label: 'Doğum Tarihi',
        type: 'dateRange'
      },
      {
        key: 'created_at',
        label: 'Kayıt Tarihi',
        type: 'dateRange'
      }
    ],
    groups: [
      {
        id: 'personal',
        label: 'Kişisel Bilgiler',
        fields: ['name', 'surname', 'identity_no', 'birth_date'],
        defaultOpen: true
      },
      {
        id: 'category_status',
        label: 'Kategori ve Durum',
        fields: ['category', 'nationality', 'status'],
        defaultOpen: true
      },
      {
        id: 'contact',
        label: 'İletişim Bilgileri',
        fields: ['phone', 'city', 'district'],
        defaultOpen: false
      },
      {
        id: 'dates',
        label: 'Tarih Filtreleri',
        fields: ['created_at'],
        defaultOpen: false
      }
    ],
    dependencies: [],
    validationRules: {
      identity_no: {
        pattern: /^[0-9]{11}$/,
        message: 'Kimlik numarası 11 haneli olmalıdır'
      }
    }
  }
}

export function createBeneficiariesURLConfig(): URLConfig {
  return {
    baseUrl: '/aid/beneficiaries',
    searchParam: 'q'
  }
}

export function createBeneficiariesSavedFiltersConfig(): SavedFiltersConfig {
  return {
    storageKey: 'beneficiaries_saved_filters',
    maxSavedFilters: 10
  }
}

export function getBeneficiariesQuickFilters(): QuickFilter[] {
  return [
    {
      key: 'active_beneficiaries',
      label: 'Aktif İhtiyaç Sahipleri',
      filters: { status: 'active' },
      badge: '✅'
    },
    {
      key: 'orphan_families',
      label: 'Yetim Aileler',
      filters: { category: 'Yetim Ailesi', status: 'active' },
      badge: '👨‍👩‍👧‍👦'
    },
    {
      key: 'elderly',
      label: 'Yaşlı İhtiyaç Sahipleri',
      filters: { category: 'Yaşlı', status: 'active' },
      badge: '👴'
    },
    {
      key: 'disabled',
      label: 'Engelli İhtiyaç Sahipleri',
      filters: { category: 'Engelli', status: 'active' },
      badge: '♿'
    },
    {
      key: 'temporary_records',
      label: 'Geçici Kayıtlar',
      filters: { status: 'suspended' },
      badge: '🔄'
    },
    {
      key: 'syrian_refugees',
      label: 'Suriyeli Mülteciler',
      filters: { nationality: 'Suriye', status: 'active' },
      badge: '🏠'
    }
  ]
}
