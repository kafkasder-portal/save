import { useState, useCallback } from 'react'
import { z, ZodSchema, ZodError } from 'zod'

interface ValidationResult<T> {
  isValid: boolean
  errors: Record<keyof T, string>
  data?: T
}

export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialData?: Partial<T>
) {
  const [data, setData] = useState<Partial<T>>(initialData || {})
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)

  const validate = useCallback((formData: Partial<T>): ValidationResult<T> => {
    try {
      const validatedData = schema.parse(formData)
      setErrors({} as Record<keyof T, string>)
      return {
        isValid: true,
        errors: {} as Record<keyof T, string>,
        data: validatedData
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors = {} as Record<keyof T, string>
        
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T
          if (field) {
            newErrors[field] = err.message
          }
        })
        
        setErrors(newErrors)
        return {
          isValid: false,
          errors: newErrors
        }
      }
      
      return {
        isValid: false,
        errors: {} as Record<keyof T, string>
      }
    }
  }, [schema])

  const setField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const setFields = useCallback((fields: Partial<T>) => {
    setData(prev => ({ ...prev, ...fields }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>)
  }, [])

  const reset = useCallback(() => {
    setData(initialData || {})
    setErrors({} as Record<keyof T, string>)
  }, [initialData])

  return {
    data,
    errors,
    validate,
    setField,
    setFields,
    clearErrors,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  required: z.string().min(1, 'Bu alan zorunludur'),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz'),
  number: z.string().regex(/^\d+$/, 'Sadece sayı giriniz'),
  url: z.string().url('Geçerli bir URL giriniz'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Geçerli bir tarih giriniz')
}
