import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Import validation utilities (assuming they exist)
// If they don't exist, we'll create them
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

const validateTurkishId = (id: string): boolean => {
  if (!/^\d{11}$/.test(id)) return false
  
  const digits = id.split('').map(Number)
  
  // First digit cannot be 0
  if (digits[0] === 0) return false
  
  // Calculate checksum
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  
  const digit10 = ((oddSum * 7) - evenSum) % 10
  if (digits[9] !== digit10) return false
  
  const sum = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0)
  const digit11 = sum % 10
  if (digits[10] !== digit11) return false
  
  return true
}

// Common validation schemas
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age')
})

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('test+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+905551234567')).toBe(true)
      expect(validatePhone('05551234567')).toBe(true)
      expect(validatePhone('5551234567')).toBe(true)
      expect(validatePhone('+1 555 123 4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
      expect(validatePhone('')).toBe(false)
      expect(validatePhone('0123456789')).toBe(false) // Starts with 0
    })
  })

  describe('Turkish ID Validation', () => {
    it('should validate correct Turkish ID numbers', () => {
      expect(validateTurkishId('12345678901')).toBe(true)
      expect(validateTurkishId('98765432109')).toBe(true)
    })

    it('should reject invalid Turkish ID numbers', () => {
      expect(validateTurkishId('1234567890')).toBe(false) // Too short
      expect(validateTurkishId('123456789012')).toBe(false) // Too long
      expect(validateTurkishId('01234567890')).toBe(false) // Starts with 0
      expect(validateTurkishId('12345678900')).toBe(false) // Invalid checksum
      expect(validateTurkishId('abc')).toBe(false) // Non-numeric
    })
  })

  describe('Zod Schema Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+905551234567',
        age: 25
      }

      const result = userSchema.safeParse(validUser)
      expect(result.success).toBe(true)
    })

    it('should reject invalid user data', () => {
      const invalidUser = {
        name: 'J', // Too short
        email: 'invalid-email',
        age: 15 // Too young
      }

      const result = userSchema.safeParse(invalidUser)
      expect(result.success).toBe(false)
      
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3)
        expect(result.error.issues[0].message).toBe('Name must be at least 2 characters')
        expect(result.error.issues[1].message).toBe('Invalid email format')
        expect(result.error.issues[2].message).toBe('Must be at least 18 years old')
      }
    })

    it('should handle optional fields', () => {
      const userWithoutPhone = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        age: 30
      }

      const result = userSchema.safeParse(userWithoutPhone)
      expect(result.success).toBe(true)
    })
  })

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const requiredSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().min(1, 'Email is required').email('Invalid email')
      })

      const emptyData = { name: '', email: '' }
      const result = requiredSchema.safeParse(emptyData)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2)
      }
    })

    it('should validate conditional fields', () => {
      const conditionalSchema = z.object({
        hasPhone: z.boolean(),
        phone: z.string().optional().refine(
          (val) => !val || validatePhone(val),
          'Invalid phone number'
        )
      }).refine(
        (data) => !data.hasPhone || data.phone,
        { message: 'Phone is required when hasPhone is true', path: ['phone'] }
      )

      const dataWithPhone = { hasPhone: true, phone: '+905551234567' }
      const result1 = conditionalSchema.safeParse(dataWithPhone)
      expect(result1.success).toBe(true)

      const dataWithoutPhone = { hasPhone: true, phone: '' }
      const result2 = conditionalSchema.safeParse(dataWithoutPhone)
      expect(result2.success).toBe(false)
    })
  })
})
