// React 17+ otomatik JSX runtime kullanıyor; import gerekli değil
import DefinitionsNavigation from '../components/DefinitionsNavigation'
import { Settings, Users, Building, Workflow } from 'lucide-react'

export default function Definitions() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Sidebar */}
      <DefinitionsNavigation />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sistem Tanımlamaları</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistem genelinde kullanılan tanımları ve yapılandırmaları yönetin
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Kullanıcı Yönetimi</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Kullanıcı hesapları, roller ve yetki gruplarını yönetin
              </p>
              <div className="space-y-2">
                <a href="/definitions/admin/admin" className="block text-sm text-blue-600 hover:text-blue-800">
                  Kullanıcı Hesapları
                </a>
                <a href="/definitions/admin/role" className="block text-sm text-blue-600 hover:text-blue-800">
                  Birim Rolleri
                </a>
                <a href="/definitions/admin/level" className="block text-sm text-blue-600 hover:text-blue-800">
                  Yetki Grupları
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Organizasyon</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Birimler, binalar ve organizasyon yapısını düzenleyin
              </p>
              <div className="space-y-2">
                <a href="/definitions/admin/department" className="block text-sm text-green-600 hover:text-green-800">
                  Birimler
                </a>
                <a href="/definitions/admin/build" className="block text-sm text-green-600 hover:text-green-800">
                  Binalar
                </a>
                <a href="/definitions/admin/internal" className="block text-sm text-green-600 hover:text-green-800">
                  Dahili Hatlar
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Workflow className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">İş Süreçleri</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Süreç akışları ve operasyonel tanımları yapılandırın
              </p>
              <div className="space-y-2">
                <a href="/definitions/flow" className="block text-sm text-purple-600 hover:text-purple-800">
                  Süreç Akışları
                </a>
                <a href="/definitions/method" className="block text-sm text-purple-600 hover:text-purple-800">
                  Bağış Yöntemleri
                </a>
                <a href="/definitions/deliver" className="block text-sm text-purple-600 hover:text-purple-800">
                  Teslimat Türleri
                </a>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Sistem Ayarları</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Genel sistem ayarları ve lokalizasyon seçenekleri
              </p>
              <div className="space-y-2">
                <a href="/system/config" className="block text-sm text-orange-600 hover:text-orange-800">
                  Genel Ayarlar
                </a>
                <a href="/definitions/language" className="block text-sm text-orange-600 hover:text-orange-800">
                  Arayüz Dilleri
                </a>
                <a href="/definitions/translate" className="block text-sm text-orange-600 hover:text-orange-800">
                  Tercüme
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity or Status */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Güncellemeler</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Kullanıcı rolleri güncellendi</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 saat önce</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Yeni birim tanımı eklendi</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">5 saat önce</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Sistem ayarları değiştirildi</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">1 gün önce</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
