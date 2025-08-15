import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Video,
  FileText
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { Meeting } from '../../types/meetings'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MeetingCardProps {
  meeting: Meeting
  onEdit: (meeting: Meeting) => void
  onDelete: (meetingId: string) => void
  onView: (meeting: Meeting) => void
  currentUserId?: string
}

const statusConfig = {
  scheduled: { color: 'info', label: 'Planlandı' },
  in_progress: { color: 'warning', label: 'Devam Ediyor' },
  completed: { color: 'success', label: 'Tamamlandı' },
  cancelled: { color: 'secondary', label: 'İptal Edildi' },
} as const

const typeConfig = {
  meeting: { icon: Users, label: 'Toplantı', color: 'text-blue-600' },
  conference: { icon: Video, label: 'Konferans', color: 'text-green-600' },
  workshop: { icon: FileText, label: 'Atölye', color: 'text-purple-600' },
  interview: { icon: Users, label: 'Mülakat', color: 'text-orange-600' },
} as const

export function MeetingCard({ 
  meeting, 
  onEdit, 
  onDelete, 
  onView, 
  currentUserId 
}: MeetingCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const status = statusConfig[meeting.status]
  const type = typeConfig[meeting.type]
  const TypeIcon = type.icon

  const isUpcoming = new Date(meeting.start_time) > new Date()
  const isToday = new Date(meeting.start_time).toDateString() === new Date().toDateString()
  const canEdit = !currentUserId || meeting.organizer_id === currentUserId

  return (
    <div className={`card transition-all duration-200 hover:shadow-md ${
      isToday ? 'border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon className={`h-5 w-5 ${type.color}`} />
          <Badge variant={status.color as any}>
            {status.label}
          </Badge>
          {isToday && (
            <Badge variant="info" className="text-xs">
              Bugün
            </Badge>
          )}
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
                  onView(meeting)
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
                    onEdit(meeting)
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
                    onDelete(meeting.id)
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
          {meeting.title}
        </h3>
        {meeting.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {meeting.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        {/* Date and Time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {format(new Date(meeting.start_time), 'dd MMMM yyyy', { locale: tr })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {format(new Date(meeting.start_time), 'HH:mm', { locale: tr })} - 
            {format(new Date(meeting.end_time), 'HH:mm', { locale: tr })}
          </span>
          {isUpcoming && (
            <span className="text-blue-600 text-xs">
              ({formatDistanceToNow(new Date(meeting.start_time), { addSuffix: true, locale: tr })})
            </span>
          )}
        </div>

        {/* Location */}
        {meeting.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {meeting.location}
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {meeting.participants?.length || 0} katılımcı
          </span>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2 text-sm">
          <TypeIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {type.label}
          </span>
        </div>
      </div>

      {/* Tags */}
      {meeting.tags && meeting.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {meeting.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {isUpcoming && meeting.status === 'scheduled' && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            className="w-full btn-primary"
            onClick={() => onView(meeting)}
          >
            <Video className="h-4 w-4 mr-2" />
            Toplantıya Katıl
          </Button>
        </div>
      )}

      {/* Click to open */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={() => onView(meeting)}
        style={{ zIndex: -1 }}
      />
    </div>
  )
}
