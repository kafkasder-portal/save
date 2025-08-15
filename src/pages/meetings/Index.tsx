import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Users, Clock, MapPin, Video, Search, Filter, Eye } from 'lucide-react'
import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import MeetingForm from '@components/meetings/MeetingForm'
import MeetingDetailModal from '@components/meetings/MeetingDetailModal'
import { meetingsApi } from '../../api/meetings'
import { Meeting } from '@/types/collaboration'
// import { usePermissions } from '@hooks/usePermissions'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { log } from '@/utils/logger'

export default function MeetingsIndex() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  
  // const permissions = usePermissions()
  // YETKİ KONTROLÜ KALDIRILDI - TÜM KULLANICILAR ERİŞEBİLİR
  const canCreateMeeting = true
  // const canViewMeetings = true

  useEffect(() => {
    // Yetki kontrolü kaldırıldı, direkt yükle
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const data = await meetingsApi.getMeetings()
      setMeetings(data)
    } catch (error) {
      log.error('Failed to fetch meetings:', error)
      toast.error('Toplantılar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setShowForm(false)
    setEditingMeeting(null)
    fetchMeetings()
  }

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setShowForm(true)
    setDetailModalOpen(false)
  }

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId))
  }

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setDetailModalOpen(true)
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Stats calculation
  const stats = {
    total: meetings.length,
    thisWeek: meetings.filter(m => {
      const meetingDate = new Date(m.start_date)
      const now = new Date()
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      return meetingDate >= weekStart && meetingDate < weekEnd
    }).length,
    ongoing: meetings.filter(m => m.status === 'ongoing').length,
    completed: meetings.filter(m => m.status === 'completed').length
  }

  // YETKİ KONTROLÜ KALDIRILDI - ERİŞİM ENGELİ KALKTI
  // if (!canViewMeetings) {
  //   return (
  //     <div className="p-8 text-center">
  //       <h1 className="text-2xl font-bold text-muted-foreground">Erişim Engellendi</h1>
  //       <p className="text-muted-foreground mt-2">
  //         Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.
  //       </p>
  //     </div>
  //   )
  // }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowForm(false)
              setEditingMeeting(null)
            }}
          >
            ← Geri
          </Button>
          <h1 className="text-3xl font-bold">
            {editingMeeting ? 'Toplantı Düzenle' : 'Yeni Toplantı'}
          </h1>
        </div>
        
        <MeetingForm
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingMeeting(null)
          }}
          initialData={editingMeeting || undefined}
          isEditMode={!!editingMeeting}
          meetingId={editingMeeting?.id}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Toplantılar</h1>
          <p className="text-muted-foreground">
            Toplantı planlama ve yönetimi
          </p>
        </div>
        {canCreateMeeting && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Toplantı
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Toplam Toplantı</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bu Hafta</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Devam Eden</p>
              <p className="text-2xl font-bold">{stats.ongoing}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tamamlanan</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Toplantı ara..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="scheduled">Planlandı</option>
            <option value="ongoing">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtreler
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Toplantılar yükleniyor...</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filteredMeetings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Toplantı</th>
                    <th className="text-left p-4 font-medium">Tarih & Saat</th>
                    <th className="text-left p-4 font-medium">Tür & Konum</th>
                    <th className="text-left p-4 font-medium">Durum</th>
                    <th className="text-left p-4 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <tr key={meeting.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {meeting.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{format(new Date(meeting.start_date), 'dd MMM yyyy', { locale: tr })}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(meeting.start_date), 'HH:mm')} - {format(new Date(meeting.end_date), 'HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {meeting.meeting_type === 'online' ? (
                            <Video className="h-4 w-4 text-blue-500" />
                          ) : meeting.meeting_type === 'hybrid' ? (
                            <>
                              <MapPin className="h-4 w-4 text-green-500" />
                              <Video className="h-4 w-4 text-blue-500" />
                            </>
                          ) : (
                            <MapPin className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <div className="capitalize">
                              {meeting.meeting_type === 'physical' ? 'Fiziksel' : 
                               meeting.meeting_type === 'online' ? 'Online' : 'Hibrit'}
                            </div>
                            {meeting.location && (
                              <div className="text-sm text-muted-foreground">
                                {meeting.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          meeting.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {meeting.status === 'scheduled' ? 'Planlandı' :
                           meeting.status === 'ongoing' ? 'Devam Ediyor' :
                           meeting.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(meeting)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detaylar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Arama kriterlerine uygun toplantı bulunamadı' : 'Henüz toplantı oluşturulmamış'}
            </div>
          )}
        </Card>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <MeetingDetailModal
          meetingId={selectedMeeting.id}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false)
            setSelectedMeeting(null)
          }}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
        />
      )}
    </div>
  )
}
