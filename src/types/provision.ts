export interface ProvisionRequest {
  id: string
  requestNumber: string
  requestDate: string
  requestedBy: string
  department: string
  priority: 'düşük' | 'normal' | 'yüksek' | 'acil'
  totalAmount: number
  currency: 'TRY' | 'USD' | 'EUR'
  exchangeRate?: number
  tryEquivalent: number
  purpose: string
  description: string
  beneficiaryCount: number
  targetDate: string
  approvalStatus: 'beklemede' | 'onaylandı' | 'reddedildi' | 'revizyon'
  approvedBy?: string
  approvalDate?: string
  approvalNotes?: string
  paymentStatus: 'beklemede' | 'kısmi' | 'tamamlandı' | 'iptal'
  paidAmount: number
  remainingAmount: number
  paymentMethod?: 'nakit' | 'banka' | 'kredi-kartı' | 'çek'
  bankAccount?: string
  referenceNumber?: string
  documents: string[]
  createdDate: string
  lastModified: string
  modifiedBy: string
  status: 'taslak' | 'gönderildi' | 'işlemde' | 'tamamlandı' | 'iptal'
}

export interface ProvisionItem {
  id: string
  requestId: string
  itemType: 'nakit' | 'gıda' | 'giyim' | 'barınma' | 'sağlık' | 'eğitim' | 'diğer'
  itemName: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  supplier?: string
  supplierContact?: string
  deliveryDate?: string
  deliveryAddress?: string
  notes?: string
  status: 'beklemede' | 'onaylandı' | 'sipariş-verildi' | 'teslim-edildi' | 'iptal'
}

export interface Payment {
  id: string
  requestId: string
  paymentDate: string
  amount: number
  currency: 'TRY' | 'USD' | 'EUR'
  paymentMethod: 'nakit' | 'banka' | 'kredi-kartı' | 'çek'
  bankAccount?: string
  referenceNumber?: string
  paidBy: string
  receivedBy?: string
  receiptNumber?: string
  notes?: string
  status: 'beklemede' | 'tamamlandı' | 'iptal'
  createdDate: string
}

export interface ProvisionAnalytics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  completedRequests: number
  totalRequestedAmount: number
  totalPaidAmount: number
  totalRemainingAmount: number
  totalBeneficiaries: number
  averageRequestAmount: number
  paymentCompletionRate: number
}