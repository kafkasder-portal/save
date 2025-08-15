import { useState } from 'react'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { 
  Calendar, 
  Clock, 
  MapPin,
  Users, 
  Video,
  Edit3,
  Trash2,
  Activity,
  FileText
} from 'lucide-react'
import type { Meeting } from '../../types/meetings'
import { formatDistanceToNow, format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MeetingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
  onEdit: (meeting: Meeting) => void
  onDelete: (meetingId: string) => void
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

export function MeetingDetailModal({ 
  isOpen, 
  onClose, 
  meeting, 
  onEdit, 
  onDelete, 
  currentUserId 
}: MeetingDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details')

  if (!meeting) return null

  const status = statusConfig[meeting.status]
  const type = typeConfig[meeting.type]
  const TypeIcon = type.icon
  const canEdit = !currentUserId || meeting.organizer_id === currentUserId
  const isUpcoming = new Date(meeting.start_time) > new Date()

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Toplantı Detayları"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 pr-4">
              {meeting.title}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={status.color as any}>
                {status.label}
              </Badge>
              <Badge variant="outline" className={type.color}>
                <TypeIcon className="h-3 w-3 mr-1" />
                {type.label}
              </Badge>
            </div>
          </div>
          
          {meeting.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {meeting.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detaylar</TabsTrigger>
            <TabsTrigger value="participants">
              Katılımcılar
              {meeting.participants && meeting.participants.length > 0 && (
                <span className="ml-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full px-1.5 py-0.5">
                  {meeting.participants.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity">Aktiviteler</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date and Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tarih
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(new Date(meeting.start_time), 'dd MMMM yyyy EEEE', { locale: tr })}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saat
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {format(new Date(meeting.start_time), 'HH:mm')} - {format(new Date(meeting.end_time), 'HH:mm')}
                  </p>
                  {isUpcoming && (
                    <p className="text-sm text-blue-600">
                      {formatDistanceToNow(new Date(meeting.start_time), { addSuffix: true, locale: tr })}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Konum
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {meeting.location || 'Belirtilmemiş'}
                  </p>
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Düzenleyen
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {meeting.organizer?.full_name || 'Bilinmiyor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting URL */}
            {meeting.meeting_url && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Toplantı Bağlantısı
                  </p>
                </div>
                <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                >
                  {meeting.meeting_url}
                </a>
              </div>
            )}

            {/* Tags */}
            {meeting.tags && meeting.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiketler
                </p>
                <div className="flex flex-wrap gap-2">
                  {meeting.tags.map((tag, index) => (
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

            {/* Created/Updated Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Oluşturulma: </span>
                  {format(new Date(meeting.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                </div>
                <div>
                  <span className="font-medium">Son Güncelleme: </span>
                  {format(new Date(meeting.updated_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-4">
            {meeting.participants && meeting.participants.length > 0 ? (
              <div className="space-y-3">
                {meeting.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {participant.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Katılımcı
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Henüz katılımcı eklenmemiş</p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-4">
              {/* Sample activity - in real app this would come from API */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center shrink-0">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-gray-100">
                    <span className="font-medium">{meeting.organizer?.full_name}</span>
                    {' '}toplantıyı oluşturdu
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(meeting.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
              </div>

              {meeting.updated_at !== meeting.created_at && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">
                      Toplantı güncellendi
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(meeting.updated_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isUpcoming && meeting.meeting_url && (
            <Button
              onClick={() => window.open(meeting.meeting_url, '_blank')}
              className="flex-1 btn-success"
            >
              <Video className="h-4 w-4 mr-2" />
              Toplantıya Katıl
            </Button>
          )}
          
          {canEdit && (
            <div className="flex gap-2 flex-1">
              <Button
                variant="outline"
                onClick={() => onEdit(meeting)}
                className="flex-1"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete(meeting.id)}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}