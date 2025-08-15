import React from 'react'
import { 
  Users, 
  Building, 
  UserCheck, 
  Shield, 
  Home, 
  Phone, 
  Workflow, 
  CreditCard, 
  Globe, 
  Building2, 
  Activity, 
  Coins, 
  Truck, 
  MessageSquare, 
  Smartphone, 
  Languages, 
  Type, 
  Settings, 
  Info 
} from 'lucide-react'

interface NavigationItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface NavigationGroup {
  title?: string
  items: NavigationItem[]
}

export default function DefinitionsNavigation() {
  const navigationGroups: NavigationGroup[] = [
    {
      title: "Yönetim",
      items: [
        { 
          title: "Birim Rolleri", 
          href: "/definitions/admin/role", 
          icon: <UserCheck className="h-4 w-4" /> 
        },
        { 
          title: "Birimler", 
          href: "/definitions/admin/department", 
          icon: <Building className="h-4 w-4" /> 
        },
        { 
          title: "Kullanıcı Hesapları", 
          href: "/definitions/admin/admin", 
          icon: <Users className="h-4 w-4" /> 
        },
        { 
          title: "Yetki Grupları", 
          href: "/definitions/admin/level", 
          icon: <Shield className="h-4 w-4" /> 
        },
        { 
          title: "Binalar", 
          href: "/definitions/admin/build", 
          icon: <Home className="h-4 w-4" /> 
        },
        { 
          title: "Sabit Dahili Hatlar", 
          href: "/definitions/admin/internal", 
          icon: <Phone className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "İş Akışları",
      items: [
        { 
          title: "Süreç Akışları", 
          href: "/definitions/flow", 
          icon: <Workflow className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Konum",
      items: [
        { 
          title: "Pasaport Formatları", 
          href: "/definitions/location/passport", 
          icon: <CreditCard className="h-4 w-4" /> 
        },
        { 
          title: "Ülke ve Şehirler", 
          href: "/definitions/location/country", 
          icon: <Globe className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Kurumsal",
      items: [
        { 
          title: "Kurum Tür Tanımları", 
          href: "/definitions/corporate", 
          icon: <Building2 className="h-4 w-4" /> 
        },
        { 
          title: "Kurum Statü Tanımları", 
          href: "/definitions/statue", 
          icon: <Activity className="h-4 w-4" /> 
        },
        { 
          title: "Bağış Yöntemleri", 
          href: "/definitions/method", 
          icon: <Coins className="h-4 w-4" /> 
        },
        { 
          title: "Teslimat Tür Tanımları", 
          href: "/definitions/deliver", 
          icon: <Truck className="h-4 w-4" /> 
        },
        { 
          title: "Görüşme İstek Tanımları", 
          href: "/definitions/conversation", 
          icon: <MessageSquare className="h-4 w-4" /> 
        },
        { 
          title: "GSM Kod Numaraları", 
          href: "/definitions/gsm", 
          icon: <Smartphone className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Lokalizasyon",
      items: [
        { 
          title: "Arayüz Dilleri", 
          href: "/definitions/language", 
          icon: <Languages className="h-4 w-4" /> 
        },
        { 
          title: "Tercüme", 
          href: "/definitions/translate", 
          icon: <Type className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Sistem",
      items: [
        { 
          title: "Genel Ayarlar", 
          href: "/system/config", 
          icon: <Settings className="h-4 w-4" /> 
        },
      ]
    },
    {
      title: "Yardım",
      items: [
        { 
          title: "Modül Bilgilendirme", 
          href: "/definitions/help", 
          icon: <Info className="h-4 w-4" /> 
        },
      ]
    }
  ]

  return (
    <div className="w-48 bg-slate-800 text-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
        <h2 className="text-sm font-medium text-white">Tanımlamalar</h2>
      </div>

      {/* Navigation Content */}
      <div className="p-1 max-h-[calc(100vh-48px)] overflow-y-auto">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-2">
            {group.title && (
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase">
                {group.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-700 transition-colors rounded text-slate-200 hover:text-white border-l-2 border-transparent hover:border-slate-500"
                  >
                    {item.icon}
                    <span className="truncate">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
