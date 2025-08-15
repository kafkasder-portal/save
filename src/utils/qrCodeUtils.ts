import { log } from './logger'

// QR kod parsing interfaces
export interface QRParseResult {
  isValid: boolean
  type?: 'bank' | 'identity' | 'unknown'
  
  // Bank/Piggy bank QR data
  bankNumber?: string
  bankId?: string
  timestamp?: string
  
  // Identity document QR data (for beneficiaries)
  identity_no?: string
  name?: string
  surname?: string
  birth_date?: string
  
  // Raw data
  rawData?: string
  error?: string
}

// Generate QR code data for banks
export function generateQRCode(bankNumber: string, bankId?: string): string {
  const data = {
    type: 'bank',
    bankNumber,
    bankId: bankId || generateUniqueId(),
    timestamp: new Date().toISOString()
  }
  return JSON.stringify(data)
}

// Generate unique bank number
export function generateUniqueBankNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `KB${year}${month}${random}`
}

// Generate unique ID
function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Parse QR code data
export function parseQRCode(qrData: string): QRParseResult {
  try {
    log.info('Parsing QR code data:', qrData)
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(qrData)
      
      // Check if it's a bank QR code
      if (parsed.type === 'bank' && parsed.bankNumber) {
        return {
          isValid: true,
          type: 'bank',
          bankNumber: parsed.bankNumber,
          bankId: parsed.bankId,
          timestamp: parsed.timestamp,
          rawData: qrData
        }
      }
      
      // Check if it's an identity QR code
      if (parsed.identity_no || (parsed.name && parsed.surname)) {
        return {
          isValid: true,
          type: 'identity',
          identity_no: parsed.identity_no,
          name: parsed.name,
          surname: parsed.surname,
          birth_date: parsed.birth_date,
          rawData: qrData
        }
      }
      
    } catch (jsonError) {
      // If JSON parsing fails, try other formats
    }
    
    // Try to parse Turkish ID card QR format (simplified)
    // Turkish ID cards typically have comma-separated values
    if (qrData.includes(',') && qrData.length > 20) {
      const parts = qrData.split(',')
      
      // Common Turkish ID QR format: TC_NO,NAME,SURNAME,BIRTH_DATE,...
      if (parts.length >= 4 && /^\d{11}$/.test(parts[0])) {
        return {
          isValid: true,
          type: 'identity',
          identity_no: parts[0],
          name: parts[1]?.trim(),
          surname: parts[2]?.trim(),
          birth_date: parts[3]?.trim(),
          rawData: qrData
        }
      }
    }
    
    // Check if it looks like a bank number (alphanumeric, specific pattern)
    if (/^KB\d{6}$/.test(qrData) || /^[A-Z]{2}\d{4,8}$/.test(qrData)) {
      return {
        isValid: true,
        type: 'bank',
        bankNumber: qrData,
        bankId: generateUniqueId(),
        timestamp: new Date().toISOString(),
        rawData: qrData
      }
    }
    
    // Check if it looks like an identity number
    if (/^\d{11}$/.test(qrData)) {
      return {
        isValid: true,
        type: 'identity',
        identity_no: qrData,
        rawData: qrData
      }
    }
    
    // Invalid QR code
    return {
      isValid: false,
      type: 'unknown',
      error: 'Tanımlı QR kod formatı bulunamadı',
      rawData: qrData
    }
    
  } catch (error) {
    log.error('QR code parsing error:', error)
    return {
      isValid: false,
      error: `QR kod ayrıştırma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
      rawData: qrData
    }
  }
}

// Validate Turkish identity number (simplified check)
export function validateTurkishIdNumber(idNumber: string): boolean {
  if (!/^\d{11}$/.test(idNumber)) return false
  
  const digits = idNumber.split('').map(Number)
  
  // Sum of first 10 digits
  const sum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0)
  
  // Simple validation (actual algorithm is more complex)
  return sum % 10 === digits[10]
}
