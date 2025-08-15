import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar
} from 'lucide-react'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
// import { supabase } from '@lib/supabase' // Removed - file deleted
import { Link } from 'react-router-dom'
import { log } from '@/utils/logger'

interface DashboardStats {
  totalBeneficiaries: number
  pendingApplications: number
  monthlyAidAmount: number
  completedAids: number
  urgentApplications: number
  activeAidRecords: number
}

export default function AidIndex() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBeneficiaries: 0,
    pendingApplications: 0,
    monthlyAidAmount: 0,
    completedAids: 0,
    urgentApplications: 0,
    activeAidRecords: 0
  })
  const [recentApplications, setRecentApplications] = useState<{ id: string; title: string; description?: string; status: string; priority: string; created_at: string; beneficiaries?: { name: string; surname: string } }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // İhtiyaç sahipleri sayısı
      const { count: beneficiariesCount, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (beneficiariesError) {
        log.warn('Beneficiaries count error:', beneficiariesError)
      }

      // Bekleyen başvurular
      const { count: pendingCount, error: pendingError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (pendingError) {
        log.warn('Pending applications error:', pendingError)
      }

      // Acil başvurular
      const { count: urgentCount, error: urgentError } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent')
        .eq('status', 'pending')

      if (urgentError) {
        log.warn('Urgent applications error:', urgentError)
      }

      // Bu ay tamamlanan yardımlar
      const currentMonth = new Date().toISOString().slice(0, 7)
      const { count: completedCount, error: completedError } = await supabase
        .from('aid_records')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', `${currentMonth}-01`)

      if (completedError) {
        log.warn('Completed aids error:', completedError)
      }

      // Bu ay toplam yardım tutarı
      const { data: monthlyAids, error: monthlyError } = await supabase
        .from('aid_records')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', `${currentMonth}-01`)

      if (monthlyError) {
        log.warn('Monthly aids error:', monthlyError)
      }

      const monthlyTotal = monthlyAids?.reduce((sum, record) => {
        const amount = record.amount || 0
        return sum + (isNaN(amount) ? 0 : amount)
      }, 0) || 0

      // Aktif yardım kayıtları
      const { count: activeCount, error: activeError } = await supabase
        .from('aid_records')
        .select('*', { count: 'exact', head: true })
        .in('status', ['approved', 'distributed'])

      if (activeError) {
        log.warn('Active aid records error:', activeError)
      }

      // Son başvurular
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          beneficiaries (name, surname)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (applicationsError) {
        log.warn('Recent applications error:', applicationsError)
      }

      setStats({
        totalBeneficiaries: beneficiariesCount || 0,
        pendingApplications: pendingCount || 0,
        monthlyAidAmount: monthlyTotal,
        completedAids: completedCount || 0,
        urgentApplications: urgentCount || 0,
        activeAidRecords: activeCount || 0
      })

      setRecentApplications(applications || [])
    } catch (error) {
      log.error('Dashboard verileri yüklenirken hata:', error)
      // Set default values on error
      setStats({
        totalBeneficiaries: 0,
        pendingApplications: 0,
        monthlyAidAmount: 0,
        completedAids: 0,
        urgentApplications: 0,
        activeAidRecords: 0
      })
      setRecentApplications([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '₺0,00'
    }
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Bekliyor', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Onaylandı', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reddedildi', class: 'bg-red-100 text-red-800' },
      completed: { label: 'Tamamlandı', class: 'bg-blue-100 text-blue-800' }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { label: 'Düşük', class: 'bg-gray-100 text-gray-800' },
      normal: { label: 'Normal', class: 'bg-blue-100 text-blue-800' },
      high: { label: 'Yüksek', class: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Acil', class: 'bg-red-100 text-red-800' }
    }
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { label: priority, class: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${priorityInfo.class}`}>
        {priorityInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yardım Yönetimi</h1>
          <p className="text-muted-foreground">Yardım süreçlerinizi takip edin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/aid/applications" 
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Yeni Başvuru
          </Link>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* StatCard */}
        <div className="rounded border bg-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam İhtiyaç Sahibi</p>
              <p className="text-2xl font-bold">{stats.totalBeneficiaries}</p>
            </div>
            <Users className="h-5 w-5 text-blue-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-orange-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bekleyen Başvurular</p>
              <p className="text-2xl font-bold">{stats.pendingApplications}</p>
            </div>
            <Clock className="h-5 w-5 text-orange-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-red-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acil Başvurular</p>
              <p className="text-2xl font-bold">{stats.urgentApplications}</p>
            </div>
            <AlertCircle className="h-5 w-5 text-red-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-green-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bu Ay Tamamlanan</p>
              <p className="text-2xl font-bold">{stats.completedAids}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-purple-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bu Ay Toplam Tutar</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyAidAmount || 0)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-purple-700" />
          </div>
        </div>
        {/* StatCard */}
        <div className="rounded border bg-indigo-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aktif Yardım Kayıtları</p>
              <p className="text-2xl font-bold">{stats.activeAidRecords}</p>
            </div>
            <Package className="h-5 w-5 text-indigo-700" />
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Son Başvurular */}
        <div className="rounded-lg border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Son Başvurular</h2>
            <Link to="/aid/applications" className="text-sm text-primary hover:underline">
              Tümünü Gör
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between rounded border p-3">
                  <div className="flex-1">
                    <div className="font-medium">
                      {application.beneficiaries?.name || 'İsim'} {application.beneficiaries?.surname || 'Soyisim'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {application.description || 'Açıklama bulunmamaktadır'}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusBadge(application.status || 'pending')}
                      {getPriorityBadge(application.priority || 'normal')}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {application.created_at ? formatDate(application.created_at) : 'Tarih yok'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Henüz başvuru bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Hızlı Erişim</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              to="/aid/beneficiaries" 
              className="flex flex-col items-center rounded border p-4 hover:bg-muted transition-colors"
            >
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">İhtiyaç Sahipleri</span>
            </Link>
            <Link 
              to="/aid/applications" 
              className="flex flex-col items-center rounded border p-4 hover:bg-muted transition-colors"
            >
              <FileText className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Başvurular</span>
            </Link>
            <Link 
              to="/aid/cash-vault" 
              className="flex flex-col items-center rounded border p-4 hover:bg-muted transition-colors"
            >
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Nakdi Yardım</span>
            </Link>
            <Link 
              to="/aid/reports" 
              className="flex flex-col items-center rounded border p-4 hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Raporlar</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Aylık Özet */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Bu Ay Özeti
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedAids}</div>
            <div className="text-sm text-muted-foreground">Tamamlanan Yardım</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthlyAidAmount || 0)}</div>
            <div className="text-sm text-muted-foreground">Toplam Tutar</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</div>
            <div className="text-sm text-muted-foreground">Bekleyen Başvuru</div>
          </div>
        </div>
      </div>
    </div>
  )
}
