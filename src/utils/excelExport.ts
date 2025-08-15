// Excel export utility for applications
import { log } from '@/utils/logger'

export interface ApplicationExportData {
  id: string
  beneficiary_id: string
  aid_type: 'cash' | 'in_kind' | 'service' | 'medical'
  amount?: number
  description: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  evaluated_by?: string
  evaluated_at?: string
  evaluation_notes?: string
  created_at: string
  updated_at: string
  beneficiaries?: {
    name: string
    surname: string
    phone?: string
    category: string
  }
}

export interface ExportFilters {
  search?: string
  status?: string
  priority?: string
  aidType?: string
}

export interface BeneficiaryExportData {
  id: string | number
  name: string
  surname: string
  category: string
  nationality?: string
  birth_date?: string
  identity_no: string
  phone?: string
  email?: string
  address?: string
  city?: string
  district?: string
  status: string
  created_at: string
  updated_at?: string
}

export interface BeneficiaryExportFilters {
  search?: string
  category?: string
  status?: string
  city?: string
}

export function exportApplicationsToExcel(
  applications: ApplicationExportData[], 
  filters?: ExportFilters
): void {
  try {
    // Convert applications to CSV format for simple export
    const headers = [
      'ID',
      'İhtiyaç Sahibi',
      'Kategori',
      'Yardım Türü', 
      'Tutar',
      'Açıklama',
      'Öncelik',
      'Durum',
      'Değerlendiren',
      'Değerlendirme Tarihi',
      'Değerlendirme Notları',
      'Oluşturulma Tarihi',
      'Güncelleme Tarihi'
    ]

    const rows = applications.map(app => [
      app.id,
      `${app.beneficiaries?.name || ''} ${app.beneficiaries?.surname || ''}`.trim(),
      app.beneficiaries?.category || '',
      getAidTypeName(app.aid_type),
      app.amount ? formatCurrency(app.amount) : '',
      app.description,
      getPriorityName(app.priority),
      getStatusName(app.status),
      app.evaluated_by || '',
      app.evaluated_at ? formatDate(app.evaluated_at) : '',
      app.evaluation_notes || '',
      formatDate(app.created_at),
      formatDate(app.updated_at)
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', generateFileName('applications', 'csv', filters))
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    log.info(`Excel export completed: ${applications.length} applications exported`)
  } catch (error) {
    log.error('Excel export failed:', error)
    throw new Error('Excel dışa aktarımı başarısız oldu')
  }
}

function getAidTypeName(type: string): string {
  const typeMap: { [key: string]: string } = {
    cash: 'Nakdi Yardım',
    in_kind: 'Ayni Yardım', 
    service: 'Hizmet Yardımı',
    medical: 'Sağlık Yardımı'
  }
  return typeMap[type] || type
}

function getPriorityName(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    low: 'Düşük',
    normal: 'Normal',
    high: 'Yüksek',
    urgent: 'Acil'
  }
  return priorityMap[priority] || priority
}

function getStatusName(status: string): string {
  const statusMap: { [key: string]: string } = {
    pending: 'Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    completed: 'Tamamlandı'
  }
  return statusMap[status] || status
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR')
}

function generateFileName(
  prefix: string, 
  extension: string, 
  filters?: ExportFilters | BeneficiaryExportFilters
): string {
  const date = new Date().toISOString().slice(0, 10)
  const filterSuffix = filters && Object.values(filters).some(v => v) 
    ? '_filtered' 
    : ''
  return `${prefix}_${date}${filterSuffix}.${extension}`
}

// Beneficiaries export function
export function exportBeneficiariesToExcel(
  beneficiaries: BeneficiaryExportData[], 
  filters?: BeneficiaryExportFilters
): void {
  try {
    // Convert beneficiaries to CSV format for simple export
    const headers = [
      'ID',
      'Ad',
      'Soyad',
      'Kategori',
      'Uyruk',
      'Doğum Tarihi',
      'Kimlik No',
      'Telefon',
      'E-posta',
      'Adres',
      'Şehir',
      'İlçe',
      'Durum',
      'Oluşturulma Tarihi',
      'Güncellenme Tarihi'
    ]

    const rows = beneficiaries.map(beneficiary => [
      beneficiary.id,
      beneficiary.name,
      beneficiary.surname,
      beneficiary.category,
      beneficiary.nationality || '',
      beneficiary.birth_date ? formatDate(beneficiary.birth_date) : '',
      beneficiary.identity_no,
      beneficiary.phone || '',
      beneficiary.email || '',
      beneficiary.address || '',
      beneficiary.city || '',
      beneficiary.district || '',
      getBeneficiaryStatusName(beneficiary.status),
      formatDate(beneficiary.created_at),
      beneficiary.updated_at ? formatDate(beneficiary.updated_at) : ''
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', generateFileName('ihtiyac-sahipleri', 'csv', filters))
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    log.info(`Beneficiaries Excel export completed: ${beneficiaries.length} beneficiaries exported`)
  } catch (error) {
    log.error('Beneficiaries Excel export failed:', error)
    throw new Error('İhtiyaç sahipleri Excel dışa aktarımı başarısız oldu')
  }
}

function getBeneficiaryStatusName(status: string): string {
  const statusMap: { [key: string]: string } = {
    active: 'Aktif',
    inactive: 'Pasif',
    suspended: 'Geçici',
    pending: 'Beklemede'
  }
  return statusMap[status] || status
}
