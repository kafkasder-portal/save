import { useState } from 'react'
import { log } from '@/utils/logger'
import { Search } from 'lucide-react'
import { AdvancedSearchModal, type SavedFilter, type FilterField, type QuickFilter } from './AdvancedSearchModal'

export default function AdvancedSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApplyFilters = (filters: Record<string, any>) => {
    log.info('Advanced search filters:', filters)
    // Here you would implement the actual search logic
    // This could dispatch to a store, call an API, etc.
    setIsModalOpen(false)
  }

  const handleSaveFilter = (filter: Omit<SavedFilter, 'id' | 'createdAt' | 'updatedAt'>) => {
    log.info('Save filter:', filter)
    // Here you would implement saving the filter
  }

  const handleLoadFilter = (filter: SavedFilter) => {
    log.info('Load filter:', filter)
    // Here you would implement loading the filter
  }

  // Default search fields - these would typically come from configuration
  const searchFields: FilterField[] = [
    {
      key: 'query',
      label: 'Arama Terimi',
      type: 'text',
      placeholder: 'Aranacak kelime veya cümle...'
    },
    {
      key: 'status',
      label: 'Durum',
      type: 'select',
      options: [
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Pasif' },
        { value: 'pending', label: 'Beklemede' }
      ]
    },
    {
      key: 'dateRange',
      label: 'Tarih Aralığı',
      type: 'dateRange'
    }
  ]

  const quickFilters: QuickFilter[] = [
    {
      key: 'recent',
      label: 'Son 7 Gün',
      filters: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      },
      badge: 'blue'
    },
    {
      key: 'active',
      label: 'Aktif Kayıtlar',
      filters: {
        status: 'active'
      },
      badge: 'green'
    }
  ]

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
        title="Gelişmiş Arama (Ctrl+Shift+F)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Gelişmiş Arama</span>
      </button>
      
      <AdvancedSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        fields={searchFields}
        pageType="general"
        urlConfig={{
          baseUrl: window.location.origin,
          searchParam: 'search'
        }}
        savedFiltersConfig={{
          storageKey: 'advanced-search-filters',
          maxSavedFilters: 10
        }}
        quickFilters={quickFilters}
        initialFilters={{}}
        savedFilters={[]}
      />
    </>
  )
}
