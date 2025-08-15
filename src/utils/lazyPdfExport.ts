// Lazy PDF export utility for applications
import { log } from '@/utils/logger'

export interface ApplicationPDFData {
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

export interface PDFExportFilters {
  search?: string
  status?: string
  priority?: string
  aidType?: string
}

export interface BeneficiaryPDFData {
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

export interface BeneficiaryPDFExportFilters {
  search?: string
  category?: string
  status?: string
  city?: string
}

export async function exportApplicationsToPDF(
  applications: ApplicationPDFData[], 
  filters?: PDFExportFilters
): Promise<void> {
  try {
    // For now, we'll create a simple HTML-to-PDF solution
    // This can be enhanced with a proper PDF library like jsPDF in the future
    
    const htmlContent = generateHTMLContent(applications, filters)
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('PDF oluşturma penceresi açılamadı. Popup engelleyici kontrol edin.')
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
    
    log.info(`PDF export initiated: ${applications.length} applications`)
  } catch (error) {
    log.error('PDF export failed:', error)
    throw new Error('PDF dışa aktarımı başarısız oldu')
  }
}

function generateHTMLContent(applications: ApplicationPDFData[], filters?: PDFExportFilters): string {
  const currentDate = new Date().toLocaleDateString('tr-TR')
  const filterInfo = filters && Object.values(filters).some(v => v) 
    ? generateFilterInfo(filters)
    : ''

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yardım Başvuruları Raporu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .filter-info {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .summary {
            margin-bottom: 20px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .status-pending { color: #856404; }
        .status-approved { color: #155724; }
        .status-rejected { color: #721c24; }
        .status-completed { color: #0c5460; }
        .priority-low { color: #6c757d; }
        .priority-normal { color: #0c5460; }
        .priority-high { color: #d1603d; }
        .priority-urgent { color: #721c24; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">YARDIM BAŞVURULARI RAPORU</div>
        <div class="subtitle">Rapor Tarihi: ${currentDate}</div>
        <div class="subtitle">Toplam Kayıt: ${applications.length}</div>
    </div>
    
    ${filterInfo}
    
    <div class="summary">
        Rapor Özeti: ${applications.length} başvuru kayıt edilmiştir.
    </div>
    
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>İhtiyaç Sahibi</th>
                <th>Kategori</th>
                <th>Yardım Türü</th>
                <th>Tutar</th>
                <th>Öncelik</th>
                <th>Durum</th>
                <th>Açıklama</th>
                <th>Tarih</th>
            </tr>
        </thead>
        <tbody>
            ${applications.map(app => `
                <tr>
                    <td>${app.id}</td>
                    <td>${app.beneficiaries?.name || ''} ${app.beneficiaries?.surname || ''}</td>
                    <td>${app.beneficiaries?.category || ''}</td>
                    <td>${getAidTypeName(app.aid_type)}</td>
                    <td>${app.amount ? formatCurrency(app.amount) : '-'}</td>
                    <td class="priority-${app.priority}">${getPriorityName(app.priority)}</td>
                    <td class="status-${app.status}">${getStatusName(app.status)}</td>
                    <td style="max-width: 200px; word-wrap: break-word;">${app.description}</td>
                    <td>${formatDate(app.created_at)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        Bu rapor sistem tarafından otomatik olarak oluşturulmuştur. • ${currentDate}
    </div>
</body>
</html>`
}

function generateFilterInfo(filters: PDFExportFilters): string {
  const filterItems = []
  
  if (filters.search) {
    filterItems.push(`Arama: "${filters.search}"`)
  }
  if (filters.status) {
    filterItems.push(`Durum: ${getStatusName(filters.status)}`)
  }
  if (filters.priority) {
    filterItems.push(`Öncelik: ${getPriorityName(filters.priority)}`)
  }
  if (filters.aidType) {
    filterItems.push(`Yardım Türü: ${getAidTypeName(filters.aidType)}`)
  }
  
  return filterItems.length > 0 
    ? `<div class="filter-info"><strong>Uygulanan Filtreler:</strong> ${filterItems.join(', ')}</div>`
    : ''
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

// Beneficiaries PDF export function
export async function exportBeneficiariesToPDF(
  beneficiaries: BeneficiaryPDFData[], 
  filters?: BeneficiaryPDFExportFilters
): Promise<void> {
  try {
    const htmlContent = generateBeneficiariesHTMLContent(beneficiaries, filters)
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('PDF oluşturma penceresi açılamadı. Popup engelleyici kontrol edin.')
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
    
    log.info(`Beneficiaries PDF export initiated: ${beneficiaries.length} beneficiaries`)
  } catch (error) {
    log.error('Beneficiaries PDF export failed:', error)
    throw new Error('İhtiyaç sahipleri PDF dışa aktarımı başarısız oldu')
  }
}

function generateBeneficiariesHTMLContent(beneficiaries: BeneficiaryPDFData[], filters?: BeneficiaryPDFExportFilters): string {
  const currentDate = new Date().toLocaleDateString('tr-TR')
  const filterInfo = filters && Object.values(filters).some(v => v) 
    ? generateBeneficiariesFilterInfo(filters)
    : ''

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İhtiyaç Sahipleri Raporu</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        .filter-info {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .summary {
            margin-bottom: 20px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .status-active { color: #155724; }
        .status-inactive { color: #6c757d; }
        .status-suspended { color: #856404; }
        .status-pending { color: #0c5460; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">İHTİYAÇ SAHİPLERİ RAPORU</div>
        <div class="subtitle">Rapor Tarihi: ${currentDate}</div>
        <div class="subtitle">Toplam Kayıt: ${beneficiaries.length}</div>
    </div>
    
    ${filterInfo}
    
    <div class="summary">
        Rapor Özeti: ${beneficiaries.length} ihtiyaç sahibi kayıt edilmiştir.
    </div>
    
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Ad Soyad</th>
                <th>Kategori</th>
                <th>Kimlik No</th>
                <th>Telefon</th>
                <th>Şehir</th>
                <th>İlçe</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
            </tr>
        </thead>
        <tbody>
            ${beneficiaries.map(beneficiary => `
                <tr>
                    <td>${beneficiary.id}</td>
                    <td>${beneficiary.name} ${beneficiary.surname}</td>
                    <td>${beneficiary.category}</td>
                    <td>${beneficiary.identity_no}</td>
                    <td>${beneficiary.phone || '-'}</td>
                    <td>${beneficiary.city || '-'}</td>
                    <td>${beneficiary.district || '-'}</td>
                    <td class="status-${beneficiary.status}">${getBeneficiaryStatusNameForPDF(beneficiary.status)}</td>
                    <td>${formatDate(beneficiary.created_at)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        Bu rapor sistem tarafından otomatik olarak oluşturulmuştur. • ${currentDate}
    </div>
</body>
</html>`
}

function generateBeneficiariesFilterInfo(filters: BeneficiaryPDFExportFilters): string {
  const filterItems = []
  
  if (filters.search) {
    filterItems.push(`Arama: "${filters.search}"`)
  }
  if (filters.category) {
    filterItems.push(`Kategori: ${filters.category}`)
  }
  if (filters.status) {
    filterItems.push(`Durum: ${getBeneficiaryStatusNameForPDF(filters.status)}`)
  }
  if (filters.city) {
    filterItems.push(`Şehir: ${filters.city}`)
  }
  
  return filterItems.length > 0 
    ? `<div class="filter-info"><strong>Uygulanan Filtreler:</strong> ${filterItems.join(', ')}</div>`
    : ''
}

function getBeneficiaryStatusNameForPDF(status: string): string {
  const statusMap: { [key: string]: string } = {
    active: 'Aktif',
    inactive: 'Pasif',
    suspended: 'Geçici',
    pending: 'Beklemede'
  }
  return statusMap[status] || status
}
