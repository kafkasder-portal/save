interface SidebarSectionProps {
  title: string
  children: React.ReactNode
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div>
      <div className="mb-2 px-2 text-xs font-semibold uppercase text-white/60">
        {title}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}
