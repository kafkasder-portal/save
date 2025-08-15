import { useState } from 'react'
import { 
  Calendar, 
  User, 
  Flag, 
  Clock, 
  CheckCircle2, 
  Circle, 
  MoreVertical,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Task } from '../../types/tasks'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onView: (task: Task) => void
  onStatusChange: (taskId: string, status: Task['status']) => void
  currentUserId?: string
}

const priorityConfig = {
  low: { color: 'success', label: 'Düşük' },
  medium: { color: 'warning', label: 'Orta' },
  high: { color: 'destructive', label: 'Yüksek' },
  urgent: { color: 'destructive', label: 'Acil' },
} as const

const statusConfig = {
  pending: { color: 'warning', label: 'Bekliyor', icon: Circle },
  in_progress: { color: 'info', label: 'Devam Ediyor', icon: Clock },
  completed: { color: 'success', label: 'Tamamlandı', icon: CheckCircle2 },
  cancelled: { color: 'secondary', label: 'İptal Edildi', icon: Circle },
} as const

export function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange, 
  currentUserId 
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const StatusIcon = status.icon

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  const canEdit = !currentUserId || task.assigned_to === currentUserId || task.assigned_by === currentUserId
  const canComplete = task.status === 'in_progress' && (task.assigned_to === currentUserId || !currentUserId)

  const handleStatusChange = async (newStatus: Task['status']) => {
    setLoading(true)
    try {
      await onStatusChange(task.id, newStatus)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRemaining = () => {
    if (!task.due_date) return null
    
    const dueDate = new Date(task.due_date)
    const now = new Date()
    
    if (dueDate < now && task.status !== 'completed') {
      return (
        <span className="text-red-600 font-medium">
          {formatDistanceToNow(dueDate, { addSuffix: true, locale: tr })} gecikti
        </span>
      )
    }
    
    if (task.status !== 'completed') {
      return (
        <span className="text-gray-600">
          {formatDistanceToNow(dueDate, { addSuffix: true, locale: tr })}
        </span>
      )
    }
    
    return null
  }

  return (
    <div className={`card transition-all duration-200 hover:shadow-md ${
      isOverdue ? 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${
            status.color === 'success' ? 'text-green-600' :
            status.color === 'warning' ? 'text-yellow-600' :
            status.color === 'info' ? 'text-blue-600' :
            status.color === 'destructive' ? 'text-red-600' :
            'text-gray-600'
          }`} />
          <Badge variant={status.color as any}>
            {status.label}
          </Badge>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[150px]">
              <button
                onClick={() => {
                  onView(task)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Görüntüle
              </button>
              
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit(task)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Düzenle
                </button>
              )}
              
              {canEdit && (
                <button
                  onClick={() => {
                    onDelete(task.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title and Description */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        {/* Priority */}
        <div className="flex items-center gap-2 text-sm">
          <Flag className="h-4 w-4 text-gray-500" />
          <Badge variant={priority.color as any} className="text-xs">
            {priority.label}
          </Badge>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span>{task.assignee.full_name}</span>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(task.due_date).toLocaleDateString('tr-TR')}
              </span>
              {getTimeRemaining()}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {canComplete && task.status === 'pending' && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            onClick={() => handleStatusChange('in_progress')}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? (
              <div className="spinner h-4 w-4 mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            Başla
          </Button>
        </div>
      )}

      {canComplete && task.status === 'in_progress' && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            onClick={() => handleStatusChange('completed')}
            disabled={loading}
            className="w-full btn-success"
          >
            {loading ? (
              <div className="spinner h-4 w-4 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Tamamla
          </Button>
        </div>
      )}

      {/* Click to open */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => onView(task)}
        style={{ zIndex: -1 }}
      />
    </div>
  )
}
