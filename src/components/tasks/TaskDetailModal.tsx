import { useState } from 'react'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { 
  Calendar, 
  User, 
  Flag, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Paperclip,
  Edit3,
  Trash2,
  Activity
} from 'lucide-react'
import type { Task } from '../../types/tasks'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  currentUserId?: string
}

const priorityConfig = {
  low: { color: 'success', label: 'Düşük' },
  medium: { color: 'warning', label: 'Orta' },
  high: { color: 'destructive', label: 'Yüksek' },
  urgent: { color: 'destructive', label: 'Acil' },
} as const

const statusConfig = {
  pending: { color: 'warning', label: 'Bekliyor' },
  in_progress: { color: 'info', label: 'Devam Ediyor' },
  completed: { color: 'success', label: 'Tamamlandı' },
  cancelled: { color: 'secondary', label: 'İptal Edildi' },
} as const

export function TaskDetailModal({ 
  isOpen, 
  onClose, 
  task, 
  onEdit, 
  onDelete, 
  currentUserId 
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details')

  if (!task) return null

  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const canEdit = !currentUserId || task.assigned_to === currentUserId || task.assigned_by === currentUserId
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Görev Detayları"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-4">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={status.color as any}>
                {status.label}
              </Badge>
              <Badge variant={priority.color as any}>
                {priority.label}
              </Badge>
            </div>
          </div>
          
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="comments">
              Yorumlar
              {task.comments && task.comments.length > 0 && (
                <span className="ml-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full px-1.5 py-0.5">
                  {task.comments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="attachments">
              Dosyalar
              {task.attachments && task.attachments.length > 0 && (
                <span className="ml-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full px-1.5 py-0.5">
                  {task.attachments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Aktiviteler</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assignee */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Atanan Kişi
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {task.assignee?.full_name || 'Atanmamış'}
                  </p>
                </div>
              </div>

              {/* Assigner */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Oluşturan
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {task.assigner?.full_name || 'Bilinmiyor'}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bitiş Tarihi
                  </p>
                  {task.due_date ? (
                    <div>
                      <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {format(new Date(task.due_date), 'dd MMMM yyyy', { locale: tr })}
                      </p>
                      {isOverdue && (
                        <p className="text-sm text-red-600">
                          {formatDistanceToNow(new Date(task.due_date), { addSuffix: true, locale: tr })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Belirtilmemiş</p>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Oluşturulma
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(new Date(task.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiketler
                </p>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {comment.user?.full_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Henüz yorum yapılmamış</p>
              </div>
            )}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4">
            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-3">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Paperclip className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {attachment.file_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                        <span>{attachment.uploader?.full_name}</span>
                        <span>{format(new Date(attachment.uploaded_at), 'dd MMM yyyy', { locale: tr })}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      İndir
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Dosya eklenmemiş</p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {task.activities && task.activities.length > 0 ? (
              <div className="space-y-4">
                {task.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-gray-100">
                        <span className="font-medium">{activity.user?.full_name}</span>
                        {' '}{activity.details?.message || activity.action}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aktivite kaydı yok</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => onEdit(task)}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(task.id)}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
