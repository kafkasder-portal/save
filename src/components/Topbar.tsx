import { UserCircle2, LogOut, Settings, User, UserPlus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { usePermissions } from '../hooks/usePermissions'
import { getRoleDisplayName, type UserRole } from '../types/permissions'
import { log } from '@/utils/logger'

// UserRole tip güvenliği için yardımcı fonksiyon
const toUserRole = (role: string): UserRole | undefined => {
  const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'coordinator', 'operator', 'viewer']
  return validRoles.includes(role as UserRole) ? role as UserRole : undefined
}
import AdvancedSearch from './AdvancedSearch'
// import NotificationSystem from './notifications/NotificationSystem'
// import { ThemeToggle } from './ThemeToggle'
import { useCreateDemoAccount } from '../hooks/useDemoAccount'
import { Bot } from 'lucide-react'

interface TopbarProps {
  onOpenAICenter?: () => void
}

export function Topbar({ onOpenAICenter }: TopbarProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut: _signOut } = useAuthStore()
  const { hasPermission: _hasPermission, canAccessAdmin: _canAccessAdmin } = usePermissions()
  const userProfile = profile
  // YETKİ KONTROLÜ KALDIRILDI - TÜM KULLANICILAR ADMİN
  const isAdmin = true
  const [showUserMenu, setShowUserMenu] = useState(false)
  const createDemoAccount = useCreateDemoAccount()

  const title = (() => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path.startsWith('/meetings')) return 'Toplantılar'
    if (path.startsWith('/internal-messages')) return 'İç Mesajlar'
    if (path.startsWith('/tasks')) return 'Görevler'
    if (path.startsWith('/donations')) return 'Bağış Yönetimi'
    if (path.startsWith('/messages')) return 'Mesaj Yönetimi'
    if (path.startsWith('/scholarship')) return 'Burs Yönetimi'
    if (path.startsWith('/aid')) return 'Yardım Yönetimi'
    if (path.startsWith('/fund')) return 'Fon Yönetimi'
    if (path.startsWith('/definitions')) return 'Tanımlamalar'
    if (path.startsWith('/system')) return 'Sistem Ayarları'
    return 'Panel'
  })()

  const handleSignOut = async () => {
    // Login functionality removed - no logout needed
    log.info('Logout disabled - login functionality removed')
  }

  return (
    <header className="sticky top-0 z-10 h-14 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          <AdvancedSearch />

          {/* AI Komut Merkezi Butonu */}
          {onOpenAICenter && (
            <button
              onClick={onOpenAICenter}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              title="AI Komut Merkezi (Ctrl+K)"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Asistan</span>
            </button>
          )}

          {/*user && <NotificationSystem userId={user.id} />*/}

          {/*<ThemeToggle />*/}
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:text-foreground transition-colors rounded-lg px-2 py-1 hover:bg-accent"
                title="Kullanıcı Menüsü"
              >
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.full_name || 'User'} 
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <UserCircle2 className="h-6 w-6" />
                )}
                {userProfile?.full_name && (
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {userProfile.full_name || user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {toUserRole(userProfile.role) ? getRoleDisplayName(toUserRole(userProfile.role)!) : '—'}
                    </span>
                  </div>
                )}
              </button>
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-popover p-1 shadow-md z-20">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">
                        {userProfile?.full_name || 'İsimsiz Kullanıcı'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {userProfile && toUserRole(userProfile.role) ? getRoleDisplayName(toUserRole(userProfile.role)!) : '—'}
                      </p>
                    </div>
                    
                    <button
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setShowUserMenu(false)
                        // Navigate to profile page when implemented
                        // navigate('/profile')
                      }}
                    >
                      <User className="h-4 w-4" />
                      Profilim
                    </button>
                    
                    <button
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/definitions/general-settings')
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Ayarlar
                    </button>
                    
                    {isAdmin && (
                      <button
                        className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => {
                          setShowUserMenu(false)
                          createDemoAccount.mutate()
                        }}
                        disabled={createDemoAccount.isPending}
                      >
                        <UserPlus className="h-4 w-4" />
                        {createDemoAccount.isPending ? 'Demo Hesabı Oluşturuluyor...' : 'Demo Hesabı Oluştur'}
                      </button>
                    )}
                    
                    <div className="border-t my-1" />
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
