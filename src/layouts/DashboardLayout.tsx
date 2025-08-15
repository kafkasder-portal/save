import { type ReactNode } from 'react'
import { Topbar } from '../components/Topbar'
import { Sidebar } from '../components/Sidebar'
import { MobileNavigation } from '../components/MobileNavigation'

type Props = {
  children: ReactNode
  onOpenAICenter?: () => void
}

export function DashboardLayout({ children, onOpenAICenter }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Ana içeriğe geç
      </a>
      
      <MobileNavigation />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar onOpenAICenter={onOpenAICenter} />
          <main id="main-content" className="p-4 lg:p-6 lg:ml-0 pl-4 lg:pl-6" role="main">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
