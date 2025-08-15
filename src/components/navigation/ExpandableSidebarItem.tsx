import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ExpandableSidebarItemProps {
  icon: React.ReactNode
  label: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function ExpandableSidebarItem({ 
  icon, 
  label, 
  isExpanded, 
  onToggle, 
  children 
}: ExpandableSidebarItemProps) {
  return (
    <div>
      <div 
        className="flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-white/10 transition-colors cursor-pointer text-white/70"
        onClick={onToggle}
      >
        {icon}
        <span className="flex-1">{label}</span>
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </div>
      {isExpanded && (
        <div className="space-y-1 mt-1">
          {children}
        </div>
      )}
    </div>
  )
}
