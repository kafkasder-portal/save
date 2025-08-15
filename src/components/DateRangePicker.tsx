import React, { useState, useEffect, useCallback, memo } from 'react'
import { Calendar, ChevronDown, X } from 'lucide-react'
import { Button } from './ui/button'

export interface DateRange {
  start: string
  end: string
}

export interface DateRangePreset {
  id: string
  label: string
  getValue: () => DateRange
}

export interface DateRangePickerProps {
  value?: DateRange
  onChange: (range: DateRange | null) => void
  placeholder?: string
  presets?: DateRangePreset[]
  disabled?: boolean
  className?: string
  minDate?: string
  maxDate?: string
  allowClear?: boolean
}

const defaultPresets: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Bugün',
    getValue: () => {
      const today = new Date().toISOString().split('T')[0]
      return { start: today, end: today }
    }
  },
  {
    id: 'yesterday',
    label: 'Dün',
    getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const date = yesterday.toISOString().split('T')[0]
      return { start: date, end: date }
    }
  },
  {
    id: 'last7days',
    label: 'Son 7 Gün',
    getValue: () => {
      const end = new Date().toISOString().split('T')[0]
      const start = new Date()
      start.setDate(start.getDate() - 6)
      return { start: start.toISOString().split('T')[0], end }
    }
  },
  {
    id: 'last30days',
    label: 'Son 30 Gün',
    getValue: () => {
      const end = new Date().toISOString().split('T')[0]
      const start = new Date()
      start.setDate(start.getDate() - 29)
      return { start: start.toISOString().split('T')[0], end }
    }
  },
  {
    id: 'thisMonth',
    label: 'Bu Ay',
    getValue: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'lastMonth',
    label: 'Geçen Ay',
    getValue: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'thisYear',
    label: 'Bu Yıl',
    getValue: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    id: 'lastYear',
    label: 'Geçen Yıl',
    getValue: () => {
      const now = new Date()
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear() - 1, 11, 31)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  }
]

const DateRangePickerComponent: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = 'Tarih aralığı seçin',
  presets = defaultPresets,
  disabled = false,
  className = '',
  minDate,
  maxDate,
  allowClear = true
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange | null>(value || null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  useEffect(() => {
    setTempRange(value || null)
  }, [value])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }, [])

  const getDisplayText = () => {
    if (!value || !value.start || !value.end) {
      return placeholder
    }
    
    if (value.start === value.end) {
      return formatDate(value.start)
    }
    
    return `${formatDate(value.start)} - ${formatDate(value.end)}`
  }

  const handlePresetClick = useCallback((preset: DateRangePreset) => {
    const range = preset.getValue()
    setTempRange(range)
    setSelectedPreset(preset.id)
    onChange(range)
    setIsOpen(false)
  }, [onChange])

  const handleCustomRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...tempRange, [field]: value } as DateRange
    setTempRange(newRange)
    setSelectedPreset(null)
    
    // Auto-apply if both dates are set
    if (newRange.start && newRange.end) {
      onChange(newRange)
    }
  }

  const handleApply = () => {
    if (tempRange && tempRange.start && tempRange.end) {
      onChange(tempRange)
    }
    setIsOpen(false)
  }

  const handleClear = useCallback(() => {
    setTempRange(null)
    setSelectedPreset(null)
    onChange(null)
    setIsOpen(false)
  }, [onChange])

  const isValidRange = (range: DateRange | null) => {
    if (!range || !range.start || !range.end) return false
    return new Date(range.start) <= new Date(range.end)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label="Tarih aralığı seçin"
        className={`
          w-full px-3 py-2 text-left border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
            : 'bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600'
          }
          ${value && value.start && value.end 
            ? 'text-gray-900 dark:text-white' 
            : 'text-gray-500 dark:text-gray-400'
          }
          border-gray-300 dark:border-gray-600
          flex items-center justify-between
        `}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <div className="flex items-center space-x-1">
          {allowClear && value && value.start && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClear()
                }
              }}
            >
              <X className="w-3 h-3" />
            </div>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50">
          <div className="flex">
            {/* Presets */}
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Hızlı Seçim
              </h4>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`
                      w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700
                      ${selectedPreset === preset.id 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="flex-1 p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Özel Aralık
              </h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="start-date" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={tempRange?.start || ''}
                    onChange={(e) => handleCustomRangeChange('start', e.target.value)}
                    min={minDate}
                    max={maxDate}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={tempRange?.end || ''}
                    onChange={(e) => handleCustomRangeChange('end', e.target.value)}
                    min={tempRange?.start || minDate}
                    max={maxDate}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                {tempRange && !isValidRange(tempRange) && (
                  <p className="text-xs text-red-500">
                    Başlangıç tarihi bitiş tarihinden sonra olamaz
                  </p>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApply}
                    disabled={!tempRange || !isValidRange(tempRange)}
                  >
                    Uygula
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const DateRangePicker = memo(DateRangePickerComponent)
DateRangePicker.displayName = 'DateRangePicker'

export default DateRangePicker
