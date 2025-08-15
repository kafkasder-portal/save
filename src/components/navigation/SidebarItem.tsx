import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface SidebarItemProps {
  to: string
  icon: React.ReactNode
  label: string
  isSubItem?: boolean
}

export function SidebarItem({ to, icon, label, isSubItem = false }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded px-3 py-2 text-sm hover:bg-white/10 transition-colors',
          isActive ? 'bg-white/10 font-medium text-white' : 'text-white/70',
          isSubItem && 'ml-6'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}
