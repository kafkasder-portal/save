import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Grid3x3,
  List,
  BarChart3
} from 'lucide-react'
import type { Meeting } from '../../types/meetings'
import toast from 'react-hot-toast'
import { MeetingForm } from '../../components/meetings/MeetingForm'
import { MeetingCard } from '../../components/meetings/MeetingCard'
import { MeetingDetailModal } from '../../components/meetings/MeetingDetailModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, SelectOption } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { log } from '@/utils/logger'

export default function MeetingsIndex() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')
  
  // YETKİ KONTROLÜ KALDIRILDI - TÜM KULLANICILAR ERİŞEBİLİR
  const canCreateMeeting = true
  const currentUserId = "user-id" // Mock user ID
  
  // Mock users data
  const mockUsers = [
    { id: '1', full_name: 'Ahmet Yılmaz' },
    { id: '2', full_name: 'Ayşe Demir' },
    { id: '3', full_name: 'Mehmet Kaya' },
  ]

  // Mock meetings data
  const mockMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Haftalık Proje Toplantısı',
      description: 'Proje ilerlemesini değerlendirme ve sonraki adımları planlama',
      type: 'meeting',
      status: 'scheduled',
      start_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
      end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
      location: 'Toplantı Odası A',
      meeting_url: 'https://zoom.us/j/123456789',
      organizer_id: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['proje', 'haftalık', 'toplantı'],
      participants: [
        { id: '1', full_name: 'Ahmet Yılmaz' },
        { id: '2', full_name: 'Ayşe Demir' }
      ],
      organizer: { full_name: 'Admin User' }
    },
    {
      id: '2',
      title: 'Teknoloji Konferansı',
      description: 'Yeni teknolojilerin tanıtımı ve değerlendirmesi',
      type: 'conference',
      status: 'scheduled',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      location: 'Konferans Salonu',
      meeting_url: 'https://teams.microsoft.com/l/meetup-join/...',
      organizer_id: '2',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['teknoloji', 'konferans', 'yenilik'],
      participants: [
        { id: '1', full_name: 'Ahmet Yılmaz' },
        { id: '2', full_name: 'Ayşe Demir' },
        { id: '3', full_name: 'Mehmet Kaya' }
      ],
      organizer: { full_name: 'Ayşe Demir' }
    },
    {
      id: '3',
      title: 'İK Mülakat',
      description: 'Backend developer pozisyonu için mülakat',
      type: 'interview',
      status: 'completed',
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      end_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      location: 'Online',
      meeting_url: 'https://meet.google.com/abc-defg-hij',
      organizer_id: '3',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['mülakat', 'işe-alım', 'developer'],
      participants: [
        { id: '3', full_name: 'Mehmet Kaya' }
      ],
      organizer: { full_name: 'Mehmet Kaya' }
    }
  ]

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMeetings(mockMeetings)
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
    toast.success('Toplantı silindi')
  }

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setDetailModalOpen(true)
  }

  const handleMeetingSubmit = async (data: any) => {
    try {
      if (editingMeeting) {
        // Update existing meeting
        setMeetings(prev => prev.map(m => 
          m.id === editingMeeting.id 
            ? { ...m, ...data, updated_at: new Date().toISOString() }
            : m
        ))
        toast.success('Toplantı güncellendi')
      } else {
        // Create new meeting
        const newMeeting: Meeting = {
          id: Date.now().toString(),
          ...data,
          status: 'scheduled' as const,
          organizer_id: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          participants: data.participants ? 
            data.participants.split(',').map((name: string) => ({
              id: Date.now().toString() + Math.random(),
              full_name: name.trim()
            })) : [],
          organizer: { full_name: 'Admin User' }
        }
        setMeetings(prev => [newMeeting, ...prev])
        toast.success('Toplantı oluşturuldu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
      throw error
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    const matchesType = typeFilter === 'all' || meeting.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Filter meetings by status for tabs
  const getMeetingsByStatus = (status: string) => {
    if (status === 'all') return filteredMeetings
    if (status === 'upcoming') return filteredMeetings.filter(m => 
      new Date(m.start_time) > new Date() && m.status !== 'cancelled'
    )
    if (status === 'today') return filteredMeetings.filter(m => 
      new Date(m.start_time).toDateString() === new Date().toDateString()
    )
    return filteredMeetings.filter(m => m.status === status)
  }

  const currentMeetings = getMeetingsByStatus(activeTab)

  // Stats calculation
  const stats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === 'scheduled').length,
    inProgress: meetings.filter(m => m.status === 'in_progress').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    today: meetings.filter(m => 
      new Date(m.start_time).toDateString() === new Date().toDateString()
    ).length
  }

  return (
    <div className="container-responsive py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Toplantı Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Toplantıları planlayın ve yönetin
          </p>
        </div>
        {canCreateMeeting && (
          <Button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Toplantı
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Toplantı</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Planlandı</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.scheduled}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bugün</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.today}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Toplantı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <SelectOption value="all">Tüm Durumlar</SelectOption>
              <SelectOption value="scheduled">Planlandı</SelectOption>
              <SelectOption value="in_progress">Devam Ediyor</SelectOption>
              <SelectOption value="completed">Tamamlandı</SelectOption>
              <SelectOption value="cancelled">İptal Edildi</SelectOption>
            </Select>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <SelectOption value="all">Tüm Türler</SelectOption>
              <SelectOption value="meeting">Toplantı</SelectOption>
              <SelectOption value="conference">Konferans</SelectOption>
              <SelectOption value="workshop">Atölye</SelectOption>
              <SelectOption value="interview">Mülakat</SelectOption>
            </Select>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            Tümü ({filteredMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Yaklaşan ({getMeetingsByStatus('upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="today">
            Bugün ({stats.today})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlanan ({stats.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Meetings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Toplantılar yükleniyor...</p>
        </div>
      ) : currentMeetings.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
                onView={handleViewDetails}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="card p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Toplantı</th>
                    <th className="table-header-cell">Tarih & Saat</th>
                    <th className="table-header-cell">Konum</th>
                    <th className="table-header-cell">Katılımcılar</th>
                    <th className="table-header-cell">Durum</th>
                    <th className="table-header-cell">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMeetings.map((meeting) => (
                    <tr key={meeting.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{meeting.title}</div>
                          {meeting.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-xs">
                              {meeting.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                            {meeting.type === 'meeting' ? 'Toplantı' :
                             meeting.type === 'conference' ? 'Konferans' :
                             meeting.type === 'workshop' ? 'Atölye' : 'Mülakat'}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm">
                              {format(new Date(meeting.start_time), 'dd MMM yyyy', { locale: tr })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(meeting.start_time), 'HH:mm', { locale: tr })} - 
                              {format(new Date(meeting.end_time), 'HH:mm', { locale: tr })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm">{meeting.location || 'Belirtilmemiş'}</span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{meeting.participants?.length || 0}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <Badge variant={
                          meeting.status === 'completed' ? 'success' :
                          meeting.status === 'in_progress' ? 'info' :
                          meeting.status === 'cancelled' ? 'secondary' : 'warning'
                        }>
                          {meeting.status === 'scheduled' ? 'Planlandı' :
                           meeting.status === 'in_progress' ? 'Devam Ediyor' :
                           meeting.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(meeting)}
                          >
                            Detay
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-12 card">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Toplantı bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Arama kriterlerine uygun toplantı bulunamadı. Filtreleri kontrol edin.' 
                : 'Henüz toplantı oluşturulmamış. İlk toplantınızı oluşturun!'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && canCreateMeeting && (
              <Button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                İlk Toplantıyı Oluştur
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <MeetingForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingMeeting(null)
        }}
        onSubmit={handleMeetingSubmit}
        meeting={editingMeeting}
        users={mockUsers}
      />

      <MeetingDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedMeeting(null)
        }}
        meeting={selectedMeeting}
        onEdit={handleEditMeeting}
        onDelete={handleDeleteMeeting}
        currentUserId={currentUserId}
      />
    </div>
  )
}