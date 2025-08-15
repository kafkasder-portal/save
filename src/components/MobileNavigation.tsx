import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { SidebarItem } from './navigation/SidebarItem'
import { ExpandableSidebarItem } from './navigation/ExpandableSidebarItem'
import { SidebarSection } from './navigation/SidebarSection'
import { navigationData, moduleIcons } from '../data/navigation'
import { useSidebarState } from '../hooks/useSidebarState'

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { expandedSections, toggleSection } = useSidebarState()

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeSidebar}
          />
          
          {/* Sidebar content */}
          <aside className="relative w-64 h-full bg-[#0f172a] text-white overflow-y-auto">
            {/* Header */}
            <div className="flex h-14 items-center justify-between gap-2 border-b border-white/10 px-4">
              <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
                <span className="text-base font-semibold">Dernek Paneli</span>
              </Link>
              <button
                onClick={closeSidebar}
                className="p-1 rounded-md hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation */}
            <div className="space-y-4 p-3">
              <SidebarSection title="Genel">
                {navigationData.general.map((item, index) => (
                  <div key={index} onClick={closeSidebar}>
                    <SidebarItem {...item} />
                  </div>
                ))}
              </SidebarSection>

              <SidebarSection title="Collaboration">
                {navigationData.collaboration.map((item, index) => (
                  <div key={index} onClick={closeSidebar}>
                    <SidebarItem {...item} />
                  </div>
                ))}
              </SidebarSection>

              <SidebarSection title="Modüller">
                <ExpandableSidebarItem
                  icon={moduleIcons.fund}
                  label="Fon Yönetimi"
                  isExpanded={expandedSections.fund}
                  onToggle={() => toggleSection('fund')}
                >
                  {navigationData.fund.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.donations}
                  label="Bağış Yönetimi"
                  isExpanded={expandedSections.donations}
                  onToggle={() => toggleSection('donations')}
                >
                  {navigationData.donations.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.messages}
                  label="Mesaj Yönetimi"
                  isExpanded={expandedSections.messages}
                  onToggle={() => toggleSection('messages')}
                >
                  {navigationData.messages.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.scholarship}
                  label="Burs Yönetimi"
                  isExpanded={expandedSections.scholarship}
                  onToggle={() => toggleSection('scholarship')}
                >
                  {navigationData.scholarship.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.aid}
                  label="Yardım Yönetimi"
                  isExpanded={expandedSections.aid}
                  onToggle={() => toggleSection('aid')}
                >
                  {navigationData.aid.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.definitions}
                  label="Tanımlamalar"
                  isExpanded={expandedSections.definitions}
                  onToggle={() => toggleSection('definitions')}
                >
                  {navigationData.definitions.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>

                <ExpandableSidebarItem
                  icon={moduleIcons.system}
                  label="Sistem"
                  isExpanded={expandedSections.system}
                  onToggle={() => toggleSection('system')}
                >
                  {navigationData.system.map((item, index) => (
                    <div key={index} onClick={closeSidebar}>
                      <SidebarItem {...item} isSubItem />
                    </div>
                  ))}
                </ExpandableSidebarItem>
              </SidebarSection>

              <SidebarSection title="Demo">
                {navigationData.demo.map((item, index) => (
                  <div key={index} onClick={closeSidebar}>
                    <SidebarItem {...item} />
                  </div>
                ))}
              </SidebarSection>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
