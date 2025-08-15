import React from 'react'
import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { X, Calendar, MapPin, Users, Video, Monitor, Edit, Trash2 } from 'lucide-react'
import { Meeting } from '@/types/collaboration'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MeetingDetailModalProps {
  meeting: Meeting | null
  onClose: () => void
  onEdit: (meeting: Meeting) => void
  onDelete: (meetingId: string) => void
  isOpen: boolean
}

export default function MeetingDetailModal({ 
  meeting, 
  onClose, 
  onEdit, 
  onDelete, 
  isOpen 
}: MeetingDetailModalProps) {
  if (!isOpen || !meeting) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planlandı'
      case 'ongoing':
        return 'Devam Ediyor'
      case 'completed':
        return 'Tamamlandı'
      case 'cancelled':
        return 'İptal Edildi'
      default:
        return status
    }
  }

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual':
        return <Video className="h-5 w-5" />
      case 'hybrid':
        return <Monitor className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getMeetingTypeText = (type: string) => {
    switch (type) {
      case 'virtual':
        return 'Sanal'
      case 'hybrid':
        return 'Hibrit'
      case 'in_person':
        return 'Yüz Yüze'
      default:
        return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{meeting.title}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
              {getStatusText(meeting.status)}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(meeting)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(meeting.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {meeting.description && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{meeting.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Başlangıç</p>
                  <p className="font-medium">
                    {format(new Date(meeting.start_date), 'PPP p', { locale: tr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Bitiş</p>
                  <p className="font-medium">
                    {format(new Date(meeting.end_date), 'PPP p', { locale: tr })}
                  </p>
                </div>
              </div>

              {meeting.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Konum</p>
                    <p className="font-medium">{meeting.location}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getMeetingTypeIcon(meeting.meeting_type)}
                <div>
                  <p className="text-sm text-gray-500">Toplantı Türü</p>
                  <p className="font-medium">{getMeetingTypeText(meeting.meeting_type)}</p>
                </div>
              </div>

              {meeting.max_participants && (
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Maksimum Katılımcı</p>
                    <p className="font-medium">{meeting.max_participants} kişi</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Organizatör</p>
                  <p className="font-medium">{meeting.organizer_name || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </div>
          </div>

          {meeting.created_at && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Oluşturulma: {format(new Date(meeting.created_at), 'PPP p', { locale: tr })}
              </p>
              {meeting.updated_at && meeting.updated_at !== meeting.created_at && (
                <p className="text-sm text-gray-500">
                  Güncellenme: {format(new Date(meeting.updated_at), 'PPP p', { locale: tr })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </Card>
    </div>
  )
}
