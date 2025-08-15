import { memo } from 'react'
import { Button } from '../ui/Button'
import { 
  Plus, 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText, 
  Settings,
  Upload,
  Download,
  Send,
  UserPlus
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ElementType
  color: string
  onClick: () => void
  description?: string
}

interface QuickActionsProps {
  onNewTask: () => void
  onNewMeeting: () => void
  onSendMessage: () => void
  onNewTemplate: () => void
  onInviteUser: () => void
  onExportData: () => void
}

export const QuickActions = memo(function QuickActions({
  onNewTask,
  onNewMeeting,
  onSendMessage,
  onNewTemplate,
  onInviteUser,
  onExportData
}: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'new-task',
      label: 'Yeni Görev',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onNewTask,
      description: 'Hızlı görev oluştur'
    },
    {
      id: 'new-meeting',
      label: 'Toplantı Planla',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onNewMeeting,
      description: 'Yeni toplantı ayarla'
    },
    {
      id: 'send-message',
      label: 'Mesaj Gönder',
      icon: Send,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onSendMessage,
      description: 'Toplu mesaj gönder'
    },
    {
      id: 'new-template',
      label: 'Template Oluştur',
      icon: FileText,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: onNewTemplate,
      description: 'Mesaj template\'i'
    },
    {
      id: 'invite-user',
      label: 'Kullanıcı Davet',
      icon: UserPlus,
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: onInviteUser,
      description: 'Yeni üye ekle'
    },
    {
      id: 'export-data',
      label: 'Veri İndir',
      icon: Download,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: onExportData,
      description: 'Rapor ve veriler'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Hızlı İşlemler
        </h3>
        <Settings className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-left"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full text-white ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {action.label}
                  </p>
                  {action.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {action.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Son kullanılan</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
              Yeni Görev
            </span>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
              Toplantı
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})
