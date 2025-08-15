import { Link } from 'react-router-dom'
import { SidebarItem } from './navigation/SidebarItem'
import { ExpandableSidebarItem } from './navigation/ExpandableSidebarItem'
import { SidebarSection } from './navigation/SidebarSection'
import { navigationData, moduleIcons } from '../data/navigation'
import { useSidebarState } from '../hooks/useSidebarState'

export function Sidebar() {
  const { expandedSections, toggleSection } = useSidebarState()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-[#0f172a] text-white md:block overflow-y-auto">
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-base font-semibold">Dernek Paneli</span>
        </Link>
      </div>
      
      <div className="space-y-4 p-3">
        <SidebarSection title="Genel">
          {navigationData.general.map((item, index) => (
            <SidebarItem key={index} {...item} />
          ))}
        </SidebarSection>

        <SidebarSection title="Collaboration">
          {navigationData.collaboration.map((item, index) => (
            <SidebarItem key={index} {...item} />
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
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.donations}
            label="Bağış Yönetimi"
            isExpanded={expandedSections.donations}
            onToggle={() => toggleSection('donations')}
          >
            {navigationData.donations.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.messages}
            label="Mesaj Yönetimi"
            isExpanded={expandedSections.messages}
            onToggle={() => toggleSection('messages')}
          >
            {navigationData.messages.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.scholarship}
            label="Burs Yönetimi"
            isExpanded={expandedSections.scholarship}
            onToggle={() => toggleSection('scholarship')}
          >
            {navigationData.scholarship.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.aid}
            label="Yardım Yönetimi"
            isExpanded={expandedSections.aid}
            onToggle={() => toggleSection('aid')}
          >
            {navigationData.aid.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.definitions}
            label="Tanımlamalar"
            isExpanded={expandedSections.definitions}
            onToggle={() => toggleSection('definitions')}
          >
            {navigationData.definitions.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>

          <ExpandableSidebarItem
            icon={moduleIcons.system}
            label="Sistem"
            isExpanded={expandedSections.system}
            onToggle={() => toggleSection('system')}
          >
            {navigationData.system.map((item, index) => (
              <SidebarItem key={index} {...item} isSubItem />
            ))}
          </ExpandableSidebarItem>
        </SidebarSection>

        <SidebarSection title="Demo">
          {navigationData.demo.map((item, index) => (
            <SidebarItem key={index} {...item} />
          ))}
        </SidebarSection>
      </div>
    </aside>
  )
}
