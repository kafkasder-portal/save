import { type ReactNode } from 'react'
import { Topbar } from '../components/Topbar'
import { Sidebar } from '../components/Sidebar'

type Props = {
  children: ReactNode
  onOpenAICenter?: () => void
}

export function DashboardLayout({ children, onOpenAICenter }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar onOpenAICenter={onOpenAICenter} />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
