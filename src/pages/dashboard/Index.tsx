import { 
  Users, 
  Coins, 
  FileText, 
  Heart,
  TrendingUp,
  Calendar,
  MessageSquare,
  PieChart,
  Activity
} from 'lucide-react'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
import { Link } from 'react-router-dom'
// import DashboardCharts from '@components/DashboardCharts'

export default function DashboardIndex() {
  return (
    <div className="space-y-6">
      {/* Hoş Geldiniz Başlığı */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Dernek Yönetim Paneline Hoş Geldiniz</h1>
        <p className="mt-2 text-blue-100">Bugün {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* StatCard */}
        <div className="rounded border bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam İhtiyaç Sahibi</p>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-xs text-blue-700">+12 bu ay</p>
            </div>
            <Users className="h-5 w-5 text-blue-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-orange-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aktif Başvuru</p>
              <p className="text-2xl font-bold">187</p>
              <p className="text-xs text-orange-700">Değerlendirme bekliyor</p>
            </div>
            <FileText className="h-5 w-5 text-orange-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bu Ay Toplanan Bağış</p>
              <p className="text-2xl font-bold">₺45,670</p>
              <p className="text-xs text-green-700">+%15 geçen aya göre</p>
            </div>
            <Coins className="h-5 w-5 text-green-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dağıtılan Yardım</p>
              <p className="text-2xl font-bold">₺38,240</p>
              <p className="text-xs text-red-700">Bu ay</p>
            </div>
            <Heart className="h-5 w-5 text-red-700" />
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickAccessCard
          title="Yeni Başvuru"
          description="İhtiyaç sahibi başvurusu oluştur"
          icon={<FileText className="h-6 w-6" />}
          color="bg-blue-500"
          link="/aid/applications"
        />
        <QuickAccessCard
          title="Bağış Kabul"
          description="Yeni bağış kaydı oluştur"
          icon={<Coins className="h-6 w-6" />}
          color="bg-green-500"
          link="/donations/cash"
        />
        <QuickAccessCard
          title="Mesaj Gönder"
          description="Toplu mesaj gönderimi yap"
          icon={<MessageSquare className="h-6 w-6" />}
          color="bg-purple-500"
          link="/messages/bulk-send"
        />
        <QuickAccessCard
          title="Rapor Oluştur"
          description="Yardım raporu hazırla"
          icon={<PieChart className="h-6 w-6" />}
          color="bg-orange-500"
          link="/aid/reports"
        />
      </div>

      {/* Dashboard Charts */}
      {/* <DashboardCharts /> */}
      
      {/* Geçici olarak charts yerine basit placeholder */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Dashboard Grafikleri</h3>
        <div className="flex h-64 items-center justify-center rounded bg-muted">
          <p className="text-muted-foreground">Grafik bileşenleri geçici olarak devre dışı</p>
        </div>
      </div>

      {/* Alt Kısım - 3 Sütun */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Son Aktiviteler */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Son Aktiviteler</h3>
          </div>
          <div className="space-y-3">
            <ActivityItem
              title="Yeni başvuru onaylandı"
              subtitle="Ayşe Yılmaz - Nakdi Yardım"
              time="2 saat önce"
            />
            <ActivityItem
              title="Bağış alındı"
              subtitle="₺500 - Ahmet Demir"
              time="4 saat önce"
            />
            <ActivityItem
              title="Toplu mesaj gönderildi"
              subtitle="142 kişiye SMS gönderildi"
              time="6 saat önce"
            />
            <ActivityItem
              title="Yardım dağıtıldı"
              subtitle="₺1,200 - 3 aile"
              time="1 gün önce"
            />
          </div>
          <Link to="/aid" className="mt-4 block text-sm text-primary hover:underline">
            Tüm aktiviteleri gör →
          </Link>
        </div>

        {/* Bu Ayki Hedefler */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Bu Ayki Hedefler</h3>
          </div>
          <div className="space-y-4">
            <ProgressItem
              title="Bağış Hedefi"
              current={45670}
              target={60000}
              unit="₺"
            />
            <ProgressItem
              title="Yardım Dağıtımı"
              current={38240}
              target={45000}
              unit="₺"
            />
            <ProgressItem
              title="Yeni Başvuru"
              current={12}
              target={20}
              unit=""
            />
            <ProgressItem
              title="Burs Öğrenci"
              current={85}
              target={100}
              unit=""
            />
          </div>
        </div>

        {/* Yaklaşan Etkinlikler */}
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Yaklaşan Etkinlikler</h3>
          </div>
          <div className="space-y-3">
            <EventItem
              title="Yönetim Kurulu Toplantısı"
              date="15 Ocak 2024"
              time="14:00"
            />
            <EventItem
              title="Bağış Kampanyası Lansmanı"
              date="20 Ocak 2024"
              time="10:00"
            />
            <EventItem
              title="İhtiyaç Sahipleri Ziyareti"
              date="25 Ocak 2024"
              time="09:00"
            />
            <EventItem
              title="Burs Öğrenci Buluşması"
              date="30 Ocak 2024"
              time="15:00"
            />
          </div>
          <Link to="/messages" className="mt-4 block text-sm text-primary hover:underline">
            Takvimi gör →
          </Link>
        </div>
      </div>
    </div>
  )
}

function QuickAccessCard({ title, description, icon, color, link }: {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  link: string
}) {
  return (
    <Link to={link} className="group block">
      <div className="rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md">
        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}>
          {icon}
        </div>
        <h3 className="font-semibold group-hover:text-primary">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

function ActivityItem({ title, subtitle, time }: {
  title: string
  subtitle: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

function ProgressItem({ title, current, target, unit }: {
  title: string
  current: number
  target: number
  unit: string
}) {
  const percentage = Math.round((current / target) * 100)
  
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">
          {unit}{current.toLocaleString('tr-TR')} / {unit}{target.toLocaleString('tr-TR')}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div 
          className="h-2 rounded-full bg-primary transition-all duration-300" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">%{percentage} tamamlandı</p>
    </div>
  )
}

function EventItem({ title, date, time }: {
  title: string
  date: string
  time: string
}) {
  return (
    <div className="flex items-center gap-3 rounded border p-2">
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-primary/10 text-primary">
        <span className="text-xs font-medium">{date.split(' ')[0]}</span>
        <span className="text-xs">{date.split(' ')[1]}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}
