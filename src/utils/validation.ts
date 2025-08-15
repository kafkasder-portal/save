import { VALIDATION, ERROR_MESSAGES } from './constants'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Field validation interface
 */
export interface FieldValidation {
  value: any
  rules: ValidationRule[]
  fieldName?: string
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'identityNo' | 'taxNo' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  message?: string
  value?: any
  validator?: (value: any) => boolean | string
}

/**
 * Form validation interface
 */
export interface FormValidation {
  [key: string]: ValidationResult
}

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate a single field
   */
  static validateField(field: FieldValidation): ValidationResult {
    const errors: string[] = []

    for (const rule of field.rules) {
      const error = this.validateRule(field.value, rule, field.fieldName)
      if (error) {
        errors.push(error)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate a rule
   */
  private static validateRule(value: any, rule: ValidationRule, fieldName?: string): string | null {
    const message = rule.message || this.getDefaultMessage(rule.type, fieldName)

    switch (rule.type) {
      case 'required':
        return this.validateRequired(value) ? null : message

      case 'email':
        return this.validateEmail(value) ? null : message

      case 'phone':
        return this.validatePhone(value) ? null : message

      case 'identityNo':
        return this.validateIdentityNo(value) ? null : message

      case 'taxNo':
        return this.validateTaxNo(value) ? null : message

      case 'minLength':
        return this.validateMinLength(value, rule.value) ? null : message

      case 'maxLength':
        return this.validateMaxLength(value, rule.value) ? null : message

      case 'pattern':
        return this.validatePattern(value, rule.value) ? null : message

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value)
          if (typeof result === 'string') {
            return result
          }
          return result ? null : message
        }
        return null

      default:
        return null
    }
  }

  /**
   * Get default error message
   */
  private static getDefaultMessage(type: string, fieldName?: string): string {
    const field = fieldName ? `"${fieldName}"` : 'Bu alan'
    
    switch (type) {
      case 'required':
        return `${field} zorunludur`
      case 'email':
        return ERROR_MESSAGES.INVALID_EMAIL
      case 'phone':
        return ERROR_MESSAGES.INVALID_PHONE
      case 'identityNo':
        return ERROR_MESSAGES.INVALID_IDENTITY_NO
      case 'taxNo':
        return ERROR_MESSAGES.INVALID_TAX_NO
      case 'minLength':
        return `${field} en az ${VALIDATION.MIN_NAME_LENGTH} karakter olmalıdır`
      case 'maxLength':
        return `${field} en fazla ${VALIDATION.MAX_NAME_LENGTH} karakter olmalıdır`
      default:
        return `${field} geçersiz`
    }
  }

  /**
   * Required validation
   */
  static validateRequired(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  /**
   * Email validation
   */
  static validateEmail(value: string): boolean {
    if (!value) return true // Allow empty if not required
    return VALIDATION.EMAIL_REGEX.test(value)
  }

  /**
   * Phone validation
   */
  static validatePhone(value: string): boolean {
    if (!value) return true // Allow empty if not required
    return VALIDATION.PHONE_REGEX.test(value)
  }

  /**
   * Identity number validation
   */
  static validateIdentityNo(value: string): boolean {
    if (!value) return true // Allow empty if not required
    return VALIDATION.IDENTITY_NO_REGEX.test(value)
  }

  /**
   * Tax number validation
   */
  static validateTaxNo(value: string): boolean {
    if (!value) return true // Allow empty if not required
    return VALIDATION.TAX_NO_REGEX.test(value)
  }

  /**
   * Minimum length validation
   */
  static validateMinLength(value: string, minLength: number): boolean {
    if (!value) return true // Allow empty if not required
    return value.length >= minLength
  }

  /**
   * Maximum length validation
   */
  static validateMaxLength(value: string, maxLength: number): boolean {
    if (!value) return true // Allow empty if not required
    return value.length <= maxLength
  }

  /**
   * Pattern validation
   */
  static validatePattern(value: string, pattern: RegExp): boolean {
    if (!value) return true // Allow empty if not required
    return pattern.test(value)
  }

  /**
   * Password validation
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = []

    if (!password) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD)
      return { isValid: false, errors }
    }

    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      errors.push(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    }

    if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
      errors.push(ERROR_MESSAGES.PASSWORD_TOO_LONG)
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir')
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir')
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * File validation
   */
  static validateFile(file: File, options: {
    maxSize?: number
    allowedTypes?: string[]
    maxFiles?: number
  } = {}): ValidationResult {
    const errors: string[] = []
    const { maxSize, allowedTypes, maxFiles } = options

    if (!file) {
      errors.push(ERROR_MESSAGES.REQUIRED_FIELD)
      return { isValid: false, errors }
    }

    if (maxSize && file.size > maxSize) {
      errors.push(ERROR_MESSAGES.FILE_TOO_LARGE)
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      errors.push(ERROR_MESSAGES.INVALID_FILE_TYPE)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate form data
   */
  static validateForm(formData: Record<string, any>, validationSchema: Record<string, ValidationRule[]>): FormValidation {
    const results: FormValidation = {}

    for (const [fieldName, rules] of Object.entries(validationSchema)) {
      const value = formData[fieldName]
      results[fieldName] = this.validateField({
        value,
        rules,
        fieldName
      })
    }

    return results
  }

  /**
   * Check if form is valid
   */
  static isFormValid(validationResults: FormValidation): boolean {
    return Object.values(validationResults).every(result => result.isValid)
  }

  /**
   * Get all form errors
   */
  static getFormErrors(validationResults: FormValidation): string[] {
    return Object.values(validationResults)
      .flatMap(result => result.errors)
  }

  /**
   * Sanitize input value
   */
  static sanitizeInput(value: string): string {
    if (typeof value !== 'string') return value
    
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  /**
   * Format phone number
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return phone
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Format as Turkish phone number
    if (digits.length === 10) {
      return `0${digits}`
    } else if (digits.length === 11 && digits.startsWith('0')) {
      return digits
    } else if (digits.length === 12 && digits.startsWith('90')) {
      return `0${digits.slice(2)}`
    }
    
    return phone
  }

  /**
   * Format identity number
   */
  static formatIdentityNumber(identityNo: string): string {
    if (!identityNo) return identityNo
    
    // Remove all non-digits
    const digits = identityNo.replace(/\D/g, '')
    
    // Return first 11 digits
    return digits.slice(0, 11)
  }
}

// Export convenience functions
export const validateField = (field: FieldValidation): ValidationResult => 
  ValidationUtils.validateField(field)

export const validateForm = (formData: Record<string, any>, validationSchema: Record<string, ValidationRule[]>): FormValidation =>
  ValidationUtils.validateForm(formData, validationSchema)

export const isFormValid = (validationResults: FormValidation): boolean =>
  ValidationUtils.isFormValid(validationResults)

export const getFormErrors = (validationResults: FormValidation): string[] =>
  ValidationUtils.getFormErrors(validationResults)

export const sanitizeInput = (value: string): string =>
  ValidationUtils.sanitizeInput(value)

export const formatPhoneNumber = (phone: string): string =>
  ValidationUtils.formatPhoneNumber(phone)

export const formatIdentityNumber = (identityNo: string): string =>
  ValidationUtils.formatIdentityNumber(identityNo)

// Predefined validation schemas
export const VALIDATION_SCHEMAS = {
  // Beneficiary form validation
  beneficiary: {
    name: [
      { type: 'required' as const, message: 'Ad alanı zorunludur' },
      { type: 'minLength' as const, value: 2, message: 'Ad en az 2 karakter olmalıdır' },
      { type: 'maxLength' as const, value: 50, message: 'Ad en fazla 50 karakter olmalıdır' }
    ],
    surname: [
      { type: 'required' as const, message: 'Soyad alanı zorunludur' },
      { type: 'minLength' as const, value: 2, message: 'Soyad en az 2 karakter olmalıdır' },
      { type: 'maxLength' as const, value: 50, message: 'Soyad en fazla 50 karakter olmalıdır' }
    ],
    phone: [
      { type: 'phone' as const, message: ERROR_MESSAGES.INVALID_PHONE }
    ],
    email: [
      { type: 'email' as const, message: ERROR_MESSAGES.INVALID_EMAIL }
    ],
    identity_no: [
      { type: 'identityNo' as const, message: ERROR_MESSAGES.INVALID_IDENTITY_NO }
    ]
  },

  // User form validation
  user: {
    name: [
      { type: 'required' as const, message: 'Ad alanı zorunludur' },
      { type: 'minLength' as const, value: 2, message: 'Ad en az 2 karakter olmalıdır' }
    ],
    email: [
      { type: 'required' as const, message: 'E-posta alanı zorunludur' },
      { type: 'email' as const, message: ERROR_MESSAGES.INVALID_EMAIL }
    ],
    password: [
      { type: 'required' as const, message: 'Şifre alanı zorunludur' }
    ]
  },

  // Login form validation
  login: {
    email: [
      { type: 'required' as const, message: 'E-posta alanı zorunludur' },
      { type: 'email' as const, message: ERROR_MESSAGES.INVALID_EMAIL }
    ],
    password: [
      { type: 'required' as const, message: 'Şifre alanı zorunludur' }
    ]
  }
} as const

export default ValidationUtils
