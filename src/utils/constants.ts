/**
 * Application constants and configuration
 * Centralized location for all constant values used throughout the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const

// Application Settings
export const APP_CONFIG = {
  NAME: 'Dernek Yönetim Paneli',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE,
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ',
} as const

// Status Values
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Priority Levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const

// Meeting Types
export const MEETING_TYPES = {
  IN_PERSON: 'in_person',
  VIRTUAL: 'virtual',
  HYBRID: 'hybrid',
} as const

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  IMAGE: 'image',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  VOLUNTEER: 'volunteer',
  VIEWER: 'viewer',
} as const

// Beneficiary Categories
export const BENEFICIARY_CATEGORIES = {
  ORPHAN_FAMILY: 'Yetim Ailesi',
  DISABLED: 'Engelli',
  ELDERLY: 'Yaşlı',
  SICK: 'Hasta',
  POOR: 'Fakir',
  REFUGEE: 'Mülteci',
  OTHER: 'Diğer',
} as const

// Fund Regions
export const FUND_REGIONS = {
  GENERAL: 'Genel',
  NORTH: 'Kuzey',
  SOUTH: 'Güney',
  EAST: 'Doğu',
  WEST: 'Batı',
  CENTRAL: 'Merkez',
} as const

// File Connections
export const FILE_CONNECTIONS = {
  DIRECT_APPLICATION: 'Doğrudan Başvuru',
  REFERRAL: 'Yönlendirme',
  CAMPAIGN: 'Kampanya',
  EMERGENCY: 'Acil Durum',
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  CHECK: 'check',
  OTHER: 'other',
} as const

// Operation Types
export const OPERATION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

// Donation Types
export const DONATION_TYPES = {
  CASH: 'cash',
  BANK: 'bank',
  CREDIT_CARD: 'credit_card',
  SACRIFICE: 'sacrifice',
  IN_KIND: 'in_kind',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

// Language Options
export const LANGUAGES = {
  TR: 'tr',
  EN: 'en',
  AR: 'ar',
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  MAX_FILES: 5,
} as const

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  PHONE_REGEX: /^(\+90|0)?[0-9]{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  IDENTITY_NO_REGEX: /^[0-9]{11}$/,
  TAX_NO_REGEX: /^[0-9]{10}$/,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Bu alan zorunludur',
  INVALID_EMAIL: 'Geçerli bir e-posta adresi giriniz',
  INVALID_PHONE: 'Geçerli bir telefon numarası giriniz',
  INVALID_IDENTITY_NO: 'Geçerli bir TC kimlik numarası giriniz',
  INVALID_TAX_NO: 'Geçerli bir vergi numarası giriniz',
  PASSWORD_TOO_SHORT: `Şifre en az ${VALIDATION.MIN_PASSWORD_LENGTH} karakter olmalıdır`,
  PASSWORD_TOO_LONG: `Şifre en fazla ${VALIDATION.MAX_PASSWORD_LENGTH} karakter olmalıdır`,
  FILE_TOO_LARGE: `Dosya boyutu ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB'dan küçük olmalıdır`,
  INVALID_FILE_TYPE: 'Geçersiz dosya türü',
  NETWORK_ERROR: 'Ağ bağlantısı hatası',
  SERVER_ERROR: 'Sunucu hatası',
  UNAUTHORIZED: 'Yetkilendirme hatası',
  FORBIDDEN: 'Erişim reddedildi',
  NOT_FOUND: 'Kaynak bulunamadı',
  TIMEOUT: 'İşlem zaman aşımına uğradı',
  UNKNOWN_ERROR: 'Bilinmeyen hata',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Kayıt başarıyla kaydedildi',
  UPDATED: 'Kayıt başarıyla güncellendi',
  DELETED: 'Kayıt başarıyla silindi',
  CREATED: 'Kayıt başarıyla oluşturuldu',
  UPLOADED: 'Dosya başarıyla yüklendi',
  SENT: 'Mesaj başarıyla gönderildi',
  LOGGED_IN: 'Başarıyla giriş yapıldı',
  LOGGED_OUT: 'Başarıyla çıkış yapıldı',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  TABLE_PREFERENCES: 'tablePreferences',
  FILTER_PREFERENCES: 'filterPreferences',
} as const

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BENEFICIARIES: '/aid/beneficiaries',
  APPLICATIONS: '/aid/applications',
  DONATIONS: '/donations',
  MEETINGS: '/meetings',
  TASKS: '/tasks',
  MESSAGES: '/internal-messages',
  SETTINGS: '/settings',
} as const

// Table Column Keys
export const TABLE_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  SURNAME: 'surname',
  FULL_NAME: 'fullName',
  EMAIL: 'email',
  PHONE: 'phone',
  STATUS: 'status',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  ACTIONS: 'actions',
} as const

// Export all constants as a single object for easy access
export const CONSTANTS = {
  API_CONFIG,
  APP_CONFIG,
  PAGINATION,
  DATE_FORMATS,
  STATUS,
  PRIORITY,
  MEETING_TYPES,
  MESSAGE_TYPES,
  USER_ROLES,
  BENEFICIARY_CATEGORIES,
  FUND_REGIONS,
  FILE_CONNECTIONS,
  PAYMENT_METHODS,
  OPERATION_TYPES,
  DONATION_TYPES,
  NOTIFICATION_TYPES,
  THEMES,
  LANGUAGES,
  FILE_UPLOAD,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
  TABLE_COLUMNS,
} as const

export default CONSTANTS
