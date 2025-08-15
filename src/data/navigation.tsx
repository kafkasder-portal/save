import {
  Mail,
  Coins,
  GraduationCap,
  HelpingHand,
  BarChart3,
  Home,
  FileText,
  Wallet,
  CreditCard,
  DollarSign,
  Package,
  Users,
  Building2,
  Settings,
  Database,
  Info,
  Send,
  Star,
  MessageSquare,
  Smartphone,
  AtSign,
  TrendingUp,
  MapPin,
  Building,
  Activity,
  Receipt,
  Layers,
  Shield,
  AlertTriangle,
  Network,
  UserCheck,
  Phone,
  Workflow,
  Globe,
  Truck,
  Languages,
  Type,
  Calendar,
  CheckSquare
} from 'lucide-react'

export interface NavigationItem {
  to: string
  icon: React.ReactNode
  label: string
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export interface NavigationData {
  general: NavigationItem[]
  collaboration: NavigationItem[]
  aid: NavigationItem[]
  donations: NavigationItem[]
  messages: NavigationItem[]
  scholarship: NavigationItem[]
  fund: NavigationItem[]
  system: NavigationItem[]
  definitions: NavigationItem[]
  demo: NavigationItem[]
}

export const navigationData: NavigationData = {
  general: [
    { to: '/', icon: <Home className="h-4 w-4" />, label: 'Ana Sayfa' }
  ],
  
  collaboration: [
    { to: '/meetings', icon: <Calendar className="h-4 w-4" />, label: 'Toplantılar' },
    { to: '/internal-messages', icon: <MessageSquare className="h-4 w-4" />, label: 'İç Mesajlar' },
    { to: '/tasks', icon: <CheckSquare className="h-4 w-4" />, label: 'Görevler' }
  ],

  aid: [
    { to: '/aid/beneficiaries', icon: <Users className="h-4 w-4" />, label: 'İhtiyaç Sahipleri' },
    { to: '/aid/applications', icon: <FileText className="h-4 w-4" />, label: 'Yardım Başvuruları' },
    { to: '/aid/cash-vault', icon: <Wallet className="h-4 w-4" />, label: 'Nakdi Yardım Veznesi' },
    { to: '/aid/bank-orders', icon: <CreditCard className="h-4 w-4" />, label: 'Banka Ödeme Emirleri' },
    { to: '/aid/cash-operations', icon: <DollarSign className="h-4 w-4" />, label: 'Nakdi Yardım İşlemleri' },
    { to: '/aid/in-kind-operations', icon: <Package className="h-4 w-4" />, label: 'Ayni Yardım İşlemleri' },
    { to: '/aid/service-tracking', icon: <Users className="h-4 w-4" />, label: 'Hizmet Takip İşlemleri' },
    { to: '/aid/hospital-referrals', icon: <Building2 className="h-4 w-4" />, label: 'Hastane Sevk İşlemleri' },
    { to: '/aid/reports', icon: <BarChart3 className="h-4 w-4" />, label: 'Raporlar' },
    { to: '/aid/parameters', icon: <Settings className="h-4 w-4" />, label: 'Parametreler' },
    { to: '/aid/data-control', icon: <Database className="h-4 w-4" />, label: 'Veri Kontrolü' },
    { to: '/aid/module-info', icon: <Info className="h-4 w-4" />, label: 'Modül Bilgilendirme' }
  ],

  donations: [
    { to: '/donations/vault', icon: <Wallet className="h-4 w-4" />, label: 'Bağış Veznesi' },
    { to: '/donations/institutions', icon: <Users className="h-4 w-4" />, label: 'Kurumlar' },
    { to: '/donations/cash', icon: <DollarSign className="h-4 w-4" />, label: 'Nakit Bağışlar' },
    { to: '/donations/bank', icon: <CreditCard className="h-4 w-4" />, label: 'Banka Bağışları' },
    { to: '/donations/credit-card', icon: <CreditCard className="h-4 w-4" />, label: 'Kredi Kartı Bağışları' },
    { to: '/donations/numbers', icon: <FileText className="h-4 w-4" />, label: 'Bağış Numaraları' },
    { to: '/donations/funding-definitions', icon: <Settings className="h-4 w-4" />, label: 'Fonlama Tanımları' },
    { to: '/donations/sacrifice-periods', icon: <Star className="h-4 w-4" />, label: 'Kurban Dönemleri' },
    { to: '/donations/sacrifice-shares', icon: <Package className="h-4 w-4" />, label: 'Kurban Hisseleri' },
    { to: '/donations/ramadan-periods', icon: <Star className="h-4 w-4" />, label: 'Ramazan Dönemleri' },
    { to: '/donations/piggy-bank', icon: <Database className="h-4 w-4" />, label: 'Kumbara Takibi' },
    { to: '/donations/bulk-provisioning', icon: <Send className="h-4 w-4" />, label: 'Toplu Provizyon' }
  ],

  messages: [
    { to: '/messages/sms-deliveries', icon: <Smartphone className="h-4 w-4" />, label: 'SMS Gönderimleri' },
    { to: '/messages/email-deliveries', icon: <AtSign className="h-4 w-4" />, label: 'e-Posta Gönderimleri' },
    { to: '/messages/analytics', icon: <BarChart3 className="h-4 w-4" />, label: 'Analitik' },
    { to: '/messages/module-info', icon: <Info className="h-4 w-4" />, label: 'Modül Bilgilendirme' }
  ],

  scholarship: [
    { to: '/scholarship/reports', icon: <BarChart3 className="h-4 w-4" />, label: 'Raporlar' }
  ],

  fund: [
    { to: '/fund/movements', icon: <TrendingUp className="h-4 w-4" />, label: 'Tüm Fon Hareketleri' },
    { to: '/fund/complete-report', icon: <BarChart3 className="h-4 w-4" />, label: 'Tam Fon Raporu' },
    { to: '/fund/regions', icon: <MapPin className="h-4 w-4" />, label: 'Fon Bölgeleri' },
    { to: '/fund/work-areas', icon: <Building className="h-4 w-4" />, label: 'Çalışma Bölgeleri' },
    { to: '/fund/definitions', icon: <Settings className="h-4 w-4" />, label: 'Fon Tanımları' },
    { to: '/fund/activity-definitions', icon: <Activity className="h-4 w-4" />, label: 'Faaliyet Tanımları' },
    { to: '/fund/sources-expenses', icon: <Receipt className="h-4 w-4" />, label: 'Kaynak & Harcama' },
    { to: '/fund/aid-categories', icon: <Layers className="h-4 w-4" />, label: 'Yardım Kategorileri' }
  ],

  system: [
    { to: '/system/user-management', icon: <Users className="h-4 w-4" />, label: 'Kullanıcı Yönetimi' },
    { to: '/system/warning-messages', icon: <AlertTriangle className="h-4 w-4" />, label: 'Uyarı Mesajları' },
    { to: '/system/structural-controls', icon: <Database className="h-4 w-4" />, label: 'Yapısal Kontroller' },
    { to: '/system/local-ips', icon: <Network className="h-4 w-4" />, label: 'Yerel IP Adresleri' },
    { to: '/system/ip-blocking', icon: <Shield className="h-4 w-4" />, label: 'IP Engelleme / Savunma' }
  ],

  definitions: [
    { to: '/definitions/unit-roles', icon: <UserCheck className="h-4 w-4" />, label: 'Birim Rolleri' },
    { to: '/definitions/units', icon: <Building className="h-4 w-4" />, label: 'Birimler' },
    { to: '/definitions/user-accounts', icon: <Users className="h-4 w-4" />, label: 'Kullanıcı Hesapları' },
    { to: '/definitions/permission-groups', icon: <Shield className="h-4 w-4" />, label: 'Yetki Grupları' },
    { to: '/definitions/buildings', icon: <Home className="h-4 w-4" />, label: 'Binalar' },
    { to: '/definitions/internal-lines', icon: <Phone className="h-4 w-4" />, label: 'Sabit Dahili Hatlar' },
    { to: '/definitions/process-flows', icon: <Workflow className="h-4 w-4" />, label: 'Süreç Akışları' },
    { to: '/definitions/passport-formats', icon: <CreditCard className="h-4 w-4" />, label: 'Pasaport Formatları' },
    { to: '/definitions/countries-cities', icon: <Globe className="h-4 w-4" />, label: 'Ülke ve Şehirler' },
    { to: '/definitions/institution-types', icon: <Building2 className="h-4 w-4" />, label: 'Kurum Tür Tanımları' },
    { to: '/definitions/institution-status', icon: <Activity className="h-4 w-4" />, label: 'Kurum Statü Tanımları' },
    { to: '/definitions/donation-methods', icon: <Coins className="h-4 w-4" />, label: 'Bağış Yöntemleri' },
    { to: '/definitions/delivery-types', icon: <Truck className="h-4 w-4" />, label: 'Teslimat Tür Tanımları' },
    { to: '/definitions/meeting-requests', icon: <MessageSquare className="h-4 w-4" />, label: 'Görüşme İstek Tanımları' },
    { to: '/definitions/gsm-codes', icon: <Smartphone className="h-4 w-4" />, label: 'GSM Kod Numaraları' },
    { to: '/definitions/interface-languages', icon: <Languages className="h-4 w-4" />, label: 'Arayüz Dilleri' },
    { to: '/definitions/translations', icon: <Type className="h-4 w-4" />, label: 'Tercüme' },
    { to: '/definitions/general-settings', icon: <Settings className="h-4 w-4" />, label: 'Genel Ayarlar' },
    { to: '/definitions/module-info', icon: <Info className="h-4 w-4" />, label: 'Modül Bilgilendirme' }
  ],

  demo: [
    { to: '/demo/related-records', icon: <FileText className="h-4 w-4" />, label: 'Bağlantılı Kayıtlar' },
    { to: '/supabase-test', icon: <Database className="h-4 w-4" />, label: 'Supabase Test' }
  ]
} as const

export const moduleIcons = {
  fund: <Wallet className="h-4 w-4" />,
  donations: <Coins className="h-4 w-4" />,
  messages: <Mail className="h-4 w-4" />,
  scholarship: <GraduationCap className="h-4 w-4" />,
  aid: <HelpingHand className="h-4 w-4" />,
  definitions: <Settings className="h-4 w-4" />,
  system: <Shield className="h-4 w-4" />
} as const
