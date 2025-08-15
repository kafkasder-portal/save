import { useState, useEffect } from 'react'
import { 
  Users, 
  CheckCircle2, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  AlertCircle,
  FileText,
  Send,
  UserPlus,
  Download,
  Plus,
  Bell,
  Settings
} from 'lucide-react'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { RecentActivity } from '../../components/dashboard/RecentActivity'
import { PerformanceChart } from '../../components/dashboard/PerformanceChart'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { log } from '@/utils/logger'

interface DashboardStats {
  totalUsers: number
  activeTasks: number
  upcomingMeetings: number
  messagesSent: number
  completionRate: number
  responseRate: number
}

interface ActivityItem {
  id: string
  type: 'task' | 'meeting' | 'message' | 'user' | 'system'
  action: string
  description: string
  user: {
    name: string
    avatar?: string
  }
  target?: {
    type: string
    name: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export default function DashboardIndex() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeTasks: 0,
    upcomingMeetings: 0,
    messagesSent: 0,
    completionRate: 0,
    responseRate: 0
  })
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])

  // Mock data
  const mockStats: DashboardStats = {
    totalUsers: 156,
    activeTasks: 24,
    upcomingMeetings: 8,
    messagesSent: 2340,
    completionRate: 87.5,
    responseRate: 94.2
  }

  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task',
      action: 'created',
      description: 'Yeni proje için görev oluşturdu',
      user: { name: 'Ahmet Yılmaz' },
      target: { type: 'görev', name: 'Sistem entegrasyonu' },
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      metadata: { priority: 'Yüksek' }
    },
    {
      id: '2',
      type: 'meeting',
      action: 'updated',
      description: 'Haftalık toplantı zamanını güncelledi',
      user: { name: 'Ayşe Demir' },
      target: { type: 'toplantı', name: 'Haftalık Sprint' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: { date: 'Yarın 14:00' }
    },
    {
      id: '3',
      type: 'message',
      action: 'sent',
      description: 'Toplu mesaj gönderdi',
      user: { name: 'Mehmet Kaya' },
      target: { type: 'mesaj', name: 'Hoş geldin kampanyası' },
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      metadata: { recipients: '150 kişi' }
    },
    {
      id: '4',
      type: 'user',
      action: 'invited',
      description: 'Yeni kullanıcı davet etti',
      user: { name: 'Fatma Özkan' },
      target: { type: 'kullanıcı', name: 'Ali Çetin' },
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      metadata: { role: 'Editör' }
    },
    {
      id: '5',
      type: 'task',
      action: 'updated',
      description: 'Görev durumunu tamamlandı olarak işaretledi',
      user: { name: 'Zeynep Acar' },
      target: { type: 'görev', name: 'Veritabanı optimizasyonu' },
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      metadata: { status: 'Tamamlandı' }
    }
  ]

  const taskCompletionData = [
    { label: 'Pzt', value: 12 },
    { label: 'Sal', value: 19 },
    { label: 'Çar', value: 15 },
    { label: 'Per', value: 23 },
    { label: 'Cum', value: 18 },
    { label: 'Cmt', value: 8 },
    { label: 'Paz', value: 5 }
  ]

  const messageStatsData = [
    { label: 'E-posta', value: 1450, color: 'bg-blue-500' },
    { label: 'SMS', value: 680, color: 'bg-green-500' },
    { label: 'Bildirim', value: 210, color: 'bg-purple-500' }
  ]

  const userGrowthData = [
    { label: 'Ocak', value: 120 },
    { label: 'Şubat', value: 135 },
    { label: 'Mart', value: 148 },
    { label: 'Nisan', value: 156 }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStats(mockStats)
      setRecentActivities(mockActivities)
    } catch (error) {
      log.error('Failed to fetch dashboard data:', error)
      toast.error('Dashboard verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    toast.success(`${action} işlemi başlatılıyor...`)
    // Navigate to respective pages or open modals
    switch (action) {
      case 'new-task':
        // Navigate to tasks page
        break
      case 'new-meeting':
        // Navigate to meetings page
        break
      case 'send-message':
        // Navigate to messages page
        break
      case 'new-template':
        // Open template modal
        break
      case 'invite-user':
        // Open user invite modal
        break
      case 'export-data':
        // Start data export
        break
    }
  }

  const currentHour = new Date().getHours()
  const getGreeting = () => {
    if (currentHour < 12) return 'Günaydın'
    if (currentHour < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, Hoş geldiniz! 👋
              </h1>
              <p className="mt-2 text-blue-100">
                Bugün {format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr })}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Bell className="h-4 w-4 mr-2" />
                Bildirimler
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-white rounded-full transform translate-x-32 -translate-y-32" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          change={{ value: 12.5, type: 'increase', timeframe: 'Bu ay' }}
          icon={Users}
          iconColor="text-blue-600"
          description="Aktif üyeler"
          trend={{ data: [120, 135, 148, 156], positive: true }}
        />
        
        <StatsCard
          title="Aktif Görevler"
          value={stats.activeTasks}
          change={{ value: 8.2, type: 'decrease', timeframe: 'Bu hafta' }}
          icon={CheckCircle2}
          iconColor="text-green-600"
          description="Devam eden"
        />
        
        <StatsCard
          title="Yaklaşan Toplantılar"
          value={stats.upcomingMeetings}
          icon={Calendar}
          iconColor="text-purple-600"
          description="Sonraki 7 gün"
        />
        
        <StatsCard
          title="Gönderilen Mesajlar"
          value={stats.messagesSent}
          change={{ value: 15.7, type: 'increase', timeframe: 'Bu ay' }}
          icon={MessageSquare}
          iconColor="text-orange-600"
          description="Toplam gönderim"
        />
        
        <StatsCard
          title="Tamamlanma Oranı"
          value={`${stats.completionRate}%`}
          change={{ value: 3.2, type: 'increase', timeframe: 'Bu ay' }}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          description="Görev başarısı"
        />
        
        <StatsCard
          title="Yanıt Oranı"
          value={`${stats.responseRate}%`}
          change={{ value: 1.8, type: 'increase', timeframe: 'Bu hafta' }}
          icon={Clock}
          iconColor="text-indigo-600"
          description="Mesaj yanıtları"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Completion Chart */}
          <PerformanceChart
            title="Haftalık Görev Tamamlama"
            data={taskCompletionData}
            type="bar"
            timeframe="Son 7 gün"
            total={100}
            change={{ value: 12.5, type: 'increase' }}
          />

          {/* Message Stats */}
          <PerformanceChart
            title="Mesaj Türü Dağılımı"
            data={messageStatsData}
            type="pie"
            timeframe="Bu ay"
            total={2340}
            change={{ value: 15.7, type: 'increase' }}
          />

          {/* User Growth */}
          <PerformanceChart
            title="Kullanıcı Artışı"
            data={userGrowthData}
            type="line"
            timeframe="Son 4 ay"
            total={156}
            change={{ value: 8.3, type: 'increase' }}
          />
        </div>

        {/* Right Column - Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions
            onNewTask={() => handleQuickAction('new-task')}
            onNewMeeting={() => handleQuickAction('new-meeting')}
            onSendMessage={() => handleQuickAction('send-message')}
            onNewTemplate={() => handleQuickAction('new-template')}
            onInviteUser={() => handleQuickAction('invite-user')}
            onExportData={() => handleQuickAction('export-data')}
          />

          {/* Recent Activity */}
          <RecentActivity
            activities={recentActivities}
            limit={8}
          />
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Bugünün Görevleri
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Yüksek öncelik</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Orta öncelik</span>
              <Badge variant="warning">8</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Düşük öncelik</span>
              <Badge variant="info">12</Badge>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Bugünün Toplantıları
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">Ekip Toplantısı</p>
              <p className="text-gray-500">14:00 - 15:00</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">Proje Değerlendirme</p>
              <p className="text-gray-500">16:30 - 17:30</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Dikkat Gereken
            </h3>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">Geciken görevler</p>
              <p className="text-red-600">2 görev son tarihi geçti</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">Sistem güncellemesi</p>
              <p className="text-orange-600">Yarın bakım zamanı</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="spinner h-8 w-8 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Dashboard yükleniyor...</p>
          </div>
        </div>
      )}
    </div>
  )
}