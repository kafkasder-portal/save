import { useState, useEffect } from 'react'
import { log } from '@/utils/logger'
import { X, Filter, Save, FolderOpen, Trash2 } from 'lucide-react'
import { Modal } from './Modal'

export interface SavedFilter {
  id: string
  name: string
  filters: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'dateRange' | 'numberRange' | 'radio'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface QuickFilter {
  key: string
  label: string
  filters: Record<string, any>
  badge?: string
}

export interface URLConfig {
  baseUrl: string
  searchParam: string
}

export interface SavedFiltersConfig {
  storageKey: string
  maxSavedFilters: number
}

interface AdvancedSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: Record<string, any>) => void
  onSaveFilter: (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => void
  onLoadFilter: (filter: SavedFilter) => void
  fields: FilterField[]
  pageType: string
  urlConfig: URLConfig
  savedFiltersConfig: SavedFiltersConfig
  quickFilters: QuickFilter[]
  initialFilters: Record<string, any>
  savedFilters: SavedFilter[]
}

export function AdvancedSearchModal({
  isOpen,
  onClose,
  onApplyFilters,
  onSaveFilter,
  onLoadFilter,
  fields,
  quickFilters,
  initialFilters,
  savedFilters
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters)
  const [activeTab, setActiveTab] = useState<'filters' | 'quick' | 'saved'>('filters')
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
  }

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) return
    
    onSaveFilter({
      name: saveFilterName.trim(),
      filters: { ...filters }
    })
    
    setSaveFilterName('')
    setShowSaveDialog(false)
  }

  const handleQuickFilterSelect = (quickFilter: QuickFilter) => {
    setFilters(quickFilter.filters)
    onApplyFilters(quickFilter.filters)
  }

  const renderFilterField = (field: FilterField) => {
    const value = filters[field.key] || ''

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        )

      case 'select':
      case 'radio':
        return (
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          >
            <option value="">Seçiniz...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleFilterChange(field.key, [...currentValues, option.value])
                    } else {
                      handleFilterChange(field.key, currentValues.filter(v => v !== option.value))
                    }
                  }}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="rounded border px-3 py-2 text-sm"
              value={value?.start || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, start: e.target.value })}
            />
            <input
              type="date"
              className="rounded border px-3 py-2 text-sm"
              value={value?.end || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, end: e.target.value })}
            />
          </div>
        )

      case 'numberRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="rounded border px-3 py-2 text-sm"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, min: e.target.value })}
            />
            <input
              type="number"
              className="rounded border px-3 py-2 text-sm"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(field.key, { ...value, max: e.target.value })}
            />
          </div>
        )

      default:
        return null
    }
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'red': return 'bg-red-100 text-red-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Gelişmiş Filtreler</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'filters'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Filtreler
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'quick'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Hızlı Filtreler
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'saved'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Kaydedilen Filtreler
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                    </label>
                    {renderFilterField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quick' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickFilters.map(quickFilter => (
                <button
                  key={quickFilter.key}
                  onClick={() => handleQuickFilterSelect(quickFilter)}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{quickFilter.label}</span>
                    {quickFilter.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor(quickFilter.badge)}`}>
                        •
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Object.entries(quickFilter.filters).map(([key, value]) => (
                      <div key={key}>
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </div>
                    )).slice(0, 2)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-4">
              {savedFilters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Henüz kaydedilmiş filtre bulunmuyor
                </div>
              ) : (
                <div className="space-y-2">
                  {savedFilters.map(filter => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{filter.name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(filter.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onLoadFilter(filter)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Filtreyi Yükle"
                        >
                          <FolderOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // This would normally call a delete function
                            log.info('Delete filter:', filter.id)
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Filtreyi Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-4">
          <div className="flex items-center gap-2">
            {activeTab === 'filters' && (
              <>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  <Save className="h-4 w-4" />
                  Filtreyi Kaydet
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                  Temizle
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Filtreleri Uygula
            </button>
          </div>
        </div>

        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Filtreyi Kaydet</h3>
              <input
                type="text"
                className="w-full rounded border px-3 py-2 text-sm mb-4"
                placeholder="Filtre adı..."
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveFilter}
                  disabled={!saveFilterName.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
