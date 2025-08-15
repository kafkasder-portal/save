import { memo } from 'react'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/avatar'
import { 
  Calendar,
  CheckCircle2,
  MessageSquare,
  Users,
  FileText,
  Clock,
  Trash2,
  Edit3,
  Send,
  UserPlus,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

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

interface RecentActivityProps {
  activities: ActivityItem[]
  limit?: number
}

const activityConfig = {
  task: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900'
  },
  meeting: {
    icon: Calendar,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900'
  },
  message: {
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900'
  },
  user: {
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900'
  },
  system: {
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-700'
  }
} as const

export const RecentActivity = memo(function RecentActivity({
  activities,
  limit = 10
}: RecentActivityProps) {
  const displayedActivities = activities.slice(0, limit)

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle2 className="h-3 w-3" />
      case 'updated':
        return <Edit3 className="h-3 w-3" />
      case 'deleted':
        return <Trash2 className="h-3 w-3" />
      case 'sent':
        return <Send className="h-3 w-3" />
      case 'invited':
        return <UserPlus className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-600'
      case 'updated':
        return 'text-blue-600'
      case 'deleted':
        return 'text-red-600'
      case 'sent':
        return 'text-purple-600'
      case 'invited':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  if (displayedActivities.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Son Aktiviteler
        </h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Henüz aktivite bulunmuyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Son Aktiviteler
        </h3>
        <Badge variant="outline" className="text-xs">
          {activities.length} aktivite
        </Badge>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {displayedActivities.map((activity) => {
          const config = activityConfig[activity.type]
          const Icon = config.icon

          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {/* Icon */}
              <div className={`p-2 rounded-full ${config.bgColor} shrink-0`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar
                        fallback={activity.user.name.charAt(0).toUpperCase()}
                        src={activity.user.avatar}
                        size="sm"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {activity.user.name}
                      </span>
                      <div className={`flex items-center gap-1 ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                        <span className="text-sm font-medium">
                          {activity.action === 'created' && 'oluşturdu'}
                          {activity.action === 'updated' && 'güncelledi'}
                          {activity.action === 'deleted' && 'sildi'}
                          {activity.action === 'sent' && 'gönderdi'}
                          {activity.action === 'invited' && 'davet etti'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {activity.description}
                    </p>
                    
                    {activity.target && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="capitalize">{activity.target.type}:</span>
                        <span className="font-medium">{activity.target.name}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-gray-500 shrink-0">
                    {formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true, 
                      locale: tr 
                    })}
                  </span>
                </div>

                {/* Metadata */}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Tüm aktiviteleri görüntüle ({activities.length})
          </button>
        </div>
      )}
    </div>
  )
})
