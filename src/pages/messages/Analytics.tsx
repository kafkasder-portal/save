import { useState } from 'react'
import MessageNavigation from '@components/MessageNavigation'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Users,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Target,
  Mail,
  Smartphone
} from 'lucide-react'

export default function MessageAnalytics() {
  const [timeFilter, setTimeFilter] = useState('week')
  const [typeFilter, setTypeFilter] = useState('all')

  // Mock analytics data
  const analyticsData = {
    totalMessages: 15420,
    deliveryRate: 94.2,
    openRate: 68.5,
    clickRate: 12.3,
    failureRate: 5.8,
    avgResponseTime: 2.4, // hours
    
    // Trend data (comparing to previous period)
    trends: {
      totalMessages: +12.5,
      deliveryRate: +2.1,
      openRate: -3.2,
      clickRate: +0.8,
      failureRate: -1.2
    },
    
    // Channel breakdown
    channels: {
      sms: { count: 8520, rate: 96.1 },
      email: { count: 5240, rate: 91.8 },
      notification: { count: 1660, rate: 98.7 }
    },
    
    // Daily stats for the week
    dailyStats: [
      { day: 'Pzt', sent: 2100, delivered: 1980, opened: 1456, failed: 120 },
      { day: 'Sal', sent: 2350, delivered: 2210, opened: 1598, failed: 140 },
      { day: 'Çar', sent: 1890, delivered: 1780, opened: 1245, failed: 110 },
      { day: 'Per', sent: 2780, delivered: 2615, opened: 1890, failed: 165 },
      { day: 'Cum', sent: 3100, delivered: 2920, opened: 2108, failed: 180 },
      { day: 'Cmt', sent: 1650, delivered: 1560, opened: 1125, failed: 90 },
      { day: 'Paz', sent: 1550, delivered: 1465, opened: 1056, failed: 85 }
    ],
    
    // Top performing templates
    topTemplates: [
      { name: 'Randevu Hatırlatması', sent: 2850, openRate: 89.2 },
      { name: 'Ödeme Bildirimi', sent: 2340, openRate: 76.5 },
      { name: 'Hoş Geldin Mesajı', sent: 1920, openRate: 94.1 },
      { name: 'Sistem Bakımı', sent: 1560, openRate: 68.3 },
      { name: 'Promosyon Kampanyası', sent: 1240, openRate: 45.7 }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <MessageNavigation currentPath="/messages/analytics" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesaj Analitikleri</h1>
          <p className="text-gray-600 mt-1">Mesaj performansı ve istatistikleri</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Yenile
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="h-4 w-4" />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtreler:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Kanallar</option>
            <option value="sms">SMS</option>
            <option value="email">E-posta</option>
            <option value="notification">Bildirim</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analyticsData.trends.totalMessages > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.trends.totalMessages > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analyticsData.trends.totalMessages)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analyticsData.totalMessages.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Toplam Mesaj</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analyticsData.trends.deliveryRate > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.trends.deliveryRate > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analyticsData.trends.deliveryRate)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">%{analyticsData.deliveryRate}</div>
          <div className="text-sm text-gray-600">Teslimat Oranı</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analyticsData.trends.openRate > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.trends.openRate > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analyticsData.trends.openRate)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">%{analyticsData.openRate}</div>
          <div className="text-sm text-gray-600">Açılma Oranı</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analyticsData.trends.clickRate > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.trends.clickRate > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analyticsData.trends.clickRate)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">%{analyticsData.clickRate}</div>
          <div className="text-sm text-gray-600">Tıklama Oranı</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analyticsData.trends.failureRate < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.trends.failureRate < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {Math.abs(analyticsData.trends.failureRate)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">%{analyticsData.failureRate}</div>
          <div className="text-sm text-gray-600">Hata Oranı</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance Chart */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Günlük Performans</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData.dailyStats.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 text-sm font-medium text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{day.sent.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">gönderildi</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-green-500 rounded-full" 
                      style={{ width: `${(day.delivered / day.sent) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-blue-400 rounded-full" 
                      style={{ width: `${(day.opened / day.sent) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-red-400 rounded-full" 
                      style={{ width: `${(day.failed / day.sent) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Teslim Edildi</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Açıldı</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Başarısız</span>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Kanal Performansı</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">SMS</div>
                  <div className="text-sm text-gray-600">{analyticsData.channels.sms.count.toLocaleString()} mesaj</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">%{analyticsData.channels.sms.rate}</div>
                <div className="text-xs text-green-600">başarı oranı</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">E-posta</div>
                  <div className="text-sm text-gray-600">{analyticsData.channels.email.count.toLocaleString()} mesaj</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">%{analyticsData.channels.email.rate}</div>
                <div className="text-xs text-blue-600">başarı oranı</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Bildirim</div>
                  <div className="text-sm text-gray-600">{analyticsData.channels.notification.count.toLocaleString()} mesaj</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">%{analyticsData.channels.notification.rate}</div>
                <div className="text-xs text-purple-600">başarı oranı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Templates */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">En Başarılı Şablonlar</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analyticsData.topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.sent.toLocaleString()} gönderim</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">%{template.openRate}</div>
                  <div className="text-xs text-gray-500">açılma oranı</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Response Time Metric */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Ortalama Yanıt Süresi</h3>
            <div className="text-3xl font-bold">{analyticsData.avgResponseTime} saat</div>
            <div className="text-blue-100 text-sm">Müşteri yanıt süresinde %15 iyileşme</div>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-lg">
            <Clock className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
