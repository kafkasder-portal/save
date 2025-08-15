// Filter configuration for applications advanced search

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'dateRange' | 'numberRange' | 'radio'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface FilterConfig {
  fields: FilterField[]
}

export interface URLConfig {
  baseUrl: string
  searchParam: string
}

export interface QuickFilter {
  key: string
  label: string
  filters: Record<string, any>
  badge?: string
}

export function createApplicationsFilterConfig(): FilterConfig {
  return {
    fields: [
      {
        key: 'beneficiary_name',
        label: 'İhtiyaç Sahibi Adı',
        type: 'text',
        placeholder: 'Ad veya soyad ile arama yapın...'
      },
      {
        key: 'status',
        label: 'Durum',
        type: 'multiselect',
        options: [
          { value: 'pending', label: 'Bekliyor' },
          { value: 'approved', label: 'Onaylandı' },
          { value: 'rejected', label: 'Reddedildi' },
          { value: 'completed', label: 'Tamamlandı' }
        ]
      },
      {
        key: 'priority',
        label: 'Öncelik',
        type: 'multiselect',
        options: [
          { value: 'low', label: 'Düşük' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'Yüksek' },
          { value: 'urgent', label: 'Acil' }
        ]
      },
      {
        key: 'aid_type',
        label: 'Yardım Türü',
        type: 'multiselect',
        options: [
          { value: 'cash', label: 'Nakdi Yardım' },
          { value: 'in_kind', label: 'Ayni Yardım' },
          { value: 'service', label: 'Hizmet Yardımı' },
          { value: 'medical', label: 'Sağlık Yardımı' }
        ]
      },
      {
        key: 'amount_range',
        label: 'Tutar Aralığı',
        type: 'numberRange',
        placeholder: 'Min - Max tutar'
      },
      {
        key: 'beneficiary_category',
        label: 'İhtiyaç Sahibi Kategorisi',
        type: 'multiselect',
        options: [
          { value: 'elderly', label: 'Yaşlı' },
          { value: 'disabled', label: 'Engelli' },
          { value: 'family', label: 'Aile' },
          { value: 'student', label: 'Öğrenci' },
          { value: 'child', label: 'Çocuk' },
          { value: 'refugee', label: 'Mülteci' },
          { value: 'poor', label: 'Yoksul' },
          { value: 'other', label: 'Diğer' }
        ]
      },
      {
        key: 'created_date_range',
        label: 'Başvuru Tarihi',
        type: 'dateRange'
      },
      {
        key: 'evaluated_date_range',
        label: 'Değerlendirme Tarihi',
        type: 'dateRange'
      },
      {
        key: 'evaluated_by',
        label: 'Değerlendiren',
        type: 'text',
        placeholder: 'Değerlendiren kişi adı...'
      },
      {
        key: 'has_evaluation_notes',
        label: 'Değerlendirme Notu',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Var' },
          { value: 'no', label: 'Yok' }
        ]
      }
    ]
  }
}

export const applicationsURLConfig: URLConfig = {
  baseUrl: '/aid/applications',
  searchParam: 'search'
}

export function getApplicationsQuickFilters(): QuickFilter[] {
  return [
    {
      key: 'pending_applications',
      label: 'Bekleyen Başvurular',
      filters: { status: ['pending'] },
      badge: 'yellow'
    },
    {
      key: 'urgent_applications',
      label: 'Acil Başvurular',
      filters: { priority: ['urgent'] },
      badge: 'red'
    },
    {
      key: 'approved_applications',
      label: 'Onaylanan Başvurular',
      filters: { status: ['approved'] },
      badge: 'green'
    },
    {
      key: 'cash_applications',
      label: 'Nakdi Yardımlar',
      filters: { aid_type: ['cash'] },
      badge: 'blue'
    },
    {
      key: 'medical_applications',
      label: 'Sağlık Yardımları',
      filters: { aid_type: ['medical'] },
      badge: 'purple'
    },
    {
      key: 'high_priority',
      label: 'Yüksek Öncelikli',
      filters: { priority: ['high', 'urgent'] },
      badge: 'orange'
    }
  ]
}
