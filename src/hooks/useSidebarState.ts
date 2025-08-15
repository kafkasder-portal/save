import { useLocalStorage } from './useLocalStorage'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function useSidebarState() {
  const location = useLocation()
  
  const [expandedSections, setExpandedSections] = useLocalStorage<Record<string, boolean>>('sidebar-expanded', {
    aid: false,
    messages: false,
    donations: false,
    scholarship: false,
    fund: false,
    system: false,
    definitions: false
  })

  // Auto-expand sections based on current route
  useEffect(() => {
    const path = location.pathname
    
    setExpandedSections(prev => {
      const newExpandedSections = { ...prev }
      let hasChanges = false

      if (path.startsWith('/aid') && !prev.aid) {
        newExpandedSections.aid = true
        hasChanges = true
      }
      if (path.startsWith('/messages') && !prev.messages) {
        newExpandedSections.messages = true
        hasChanges = true
      }
      if (path.startsWith('/donations') && !prev.donations) {
        newExpandedSections.donations = true
        hasChanges = true
      }
      if (path.startsWith('/scholarship') && !prev.scholarship) {
        newExpandedSections.scholarship = true
        hasChanges = true
      }
      if (path.startsWith('/fund') && !prev.fund) {
        newExpandedSections.fund = true
        hasChanges = true
      }
      if (path.startsWith('/system') && !prev.system) {
        newExpandedSections.system = true
        hasChanges = true
      }
      if (path.startsWith('/definitions') && !prev.definitions) {
        newExpandedSections.definitions = true
        hasChanges = true
      }

      return hasChanges ? newExpandedSections : prev
    })
  }, [location.pathname])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return {
    expandedSections,
    toggleSection
  }
}
