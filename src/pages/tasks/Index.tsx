import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
  Grid3X3,
  List,
  BarChart3
} from 'lucide-react'
import type { Task } from '../../types/tasks'
import toast from 'react-hot-toast'
import { TaskForm } from '../../components/tasks/TaskForm'
import { TaskCard } from '../../components/tasks/TaskCard'
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select, SelectOption } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { log } from '@/utils/logger'

export default function TasksIndex() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState('all')
  
  // YETKİ KONTROLÜ KALDIRILDI - TÜM KULLANICILAR ERİŞEBİLİR
  const canCreateTask = true
  const canCompleteTask = true
  const currentUserId = "user-id" // Mock user ID
  
  // Mock users data
  const mockUsers = [
    { id: '1', full_name: 'Ahmet Yılmaz' },
    { id: '2', full_name: 'Ayşe Demir' },
    { id: '3', full_name: 'Mehmet Kaya' },
  ]

  // Mock tasks data with enhanced structure
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Website yeniden tasarımı',
      description: 'Ana sayfa ve ürün sayfalarının modern tasarım ile güncellenmesi',
      priority: 'high',
      status: 'in_progress',
      assigned_to: '1',
      assigned_by: currentUserId,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'design',
      tags: ['frontend', 'ui', 'urgent'],
      assignee: { full_name: 'Ahmet Yılmaz' },
      assigner: { full_name: 'Admin User' },
      comments: [],
      attachments: [],
      activities: []
    },
    {
      id: '2',
      title: 'API dokümantasyonu',
      description: 'REST API endpoints için detaylı dokümantasyon hazırlanması',
      priority: 'medium',
      status: 'pending',
      assigned_to: '2',
      assigned_by: currentUserId,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      category: 'documentation',
      tags: ['api', 'docs'],
      assignee: { full_name: 'Ayşe Demir' },
      assigner: { full_name: 'Admin User' },
      comments: [],
      attachments: [],
      activities: []
    },
    {
      id: '3',
      title: 'Güvenlik testleri',
      description: 'Uygulamanın güvenlik açıkları için penetrasyon testleri',
      priority: 'urgent',
      status: 'pending',
      assigned_to: '3',
      assigned_by: currentUserId,
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'testing',
      tags: ['security', 'testing', 'urgent'],
      assignee: { full_name: 'Mehmet Kaya' },
      assigner: { full_name: 'Admin User' },
      comments: [],
      attachments: [],
      activities: []
    }
  ]

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTasks(mockTasks)
    } catch (error) {
      log.error('Failed to fetch tasks:', error)
      toast.error('Görevler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = () => {
    setShowForm(false)
    setEditingTask(null)
    fetchTasks()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
    setDetailModalOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    toast.success('Görev silindi')
  }

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task)
    setDetailModalOpen(true)
  }

  const handleTaskSubmit = async (data: any) => {
    try {
      if (editingTask) {
        // Update existing task
        setTasks(prev => prev.map(t => 
          t.id === editingTask.id 
            ? { ...t, ...data, updated_at: new Date().toISOString() }
            : t
        ))
        toast.success('Görev güncellendi')
      } else {
        // Create new task
        const newTask: Task = {
          id: Date.now().toString(),
          ...data,
          status: 'pending' as const,
          assigned_by: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
          assignee: mockUsers.find(u => u.id === data.assigned_to) || null,
          assigner: { full_name: 'Admin User' },
          comments: [],
          attachments: [],
          activities: []
        }
        setTasks(prev => [newTask, ...prev])
        toast.success('Görev oluşturuldu')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
      throw error
    }
  }

  const handleQuickStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus, updated_at: new Date().toISOString() }
          : t
      ))
      toast.success('Görev durumu güncellendi')
    } catch (error) {
      log.error('Failed to update task status:', error)
      toast.error('Görev durumu güncellenirken hata oluştu')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || 
                           (assigneeFilter === 'me' && task.assigned_to === currentUserId) ||
                           (assigneeFilter === 'others' && task.assigned_to !== currentUserId)
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  // Stats calculation
  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
    myTasks: tasks.filter(t => t.assigned_to === currentUserId).length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Acil'
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
      default: return 'Orta'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı'
      case 'in_progress': return 'Devam Ediyor'
      case 'overdue': return 'Süresi Geçti'
      case 'cancelled': return 'İptal Edildi'
      default: return 'Bekliyor'
    }
  }

  // Filter tasks by status for tabs
  const getTasksByStatus = (status: string) => {
    if (status === 'all') return filteredTasks
    if (status === 'my') return filteredTasks.filter(t => t.assigned_to === currentUserId)
    if (status === 'overdue') return filteredTasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    )
    return filteredTasks.filter(t => t.status === status)
  }

  const currentTasks = getTasksByStatus(activeTab)

  // Stats calculation
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
    myTasks: tasks.filter(t => t.assigned_to === currentUserId).length
  }

  return (
    <div className="container-responsive py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Görev Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Görevleri oluşturun, atayın ve takip edin
          </p>
        </div>
        {canCreateTask && (
          <Button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Görev
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Toplam Görev</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bekliyor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Devam Eden</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.inProgress}</p>
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
              placeholder="Görev ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <SelectOption value="all">Tüm Durumlar</SelectOption>
              <SelectOption value="pending">Bekliyor</SelectOption>
              <SelectOption value="in_progress">Devam Ediyor</SelectOption>
              <SelectOption value="completed">Tamamlandı</SelectOption>
              <SelectOption value="cancelled">İptal Edildi</SelectOption>
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <SelectOption value="all">Tüm Öncelikler</SelectOption>
              <SelectOption value="urgent">Acil</SelectOption>
              <SelectOption value="high">Yüksek</SelectOption>
              <SelectOption value="medium">Orta</SelectOption>
              <SelectOption value="low">Düşük</SelectOption>
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
            <Grid3X3 className="h-4 w-4" />
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
            Tümü ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Bekliyor ({tasks.filter(t => t.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            Devam Eden ({tasks.filter(t => t.status === 'in_progress').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlanan ({tasks.filter(t => t.status === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="my">
            Benim ({stats.myTasks})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="spinner h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Görevler yükleniyor...</p>
        </div>
      ) : currentTasks.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onView={handleViewDetails}
                onStatusChange={handleQuickStatusChange}
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
                    <th className="table-header-cell">Görev</th>
                    <th className="table-header-cell">Atanan</th>
                    <th className="table-header-cell">Bitiş Tarihi</th>
                    <th className="table-header-cell">Öncelik</th>
                    <th className="table-header-cell">Durum</th>
                    <th className="table-header-cell">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.map((task) => (
                    <tr key={task.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate max-w-xs">
                              {task.description}
                            </div>
                          )}
                          {task.category && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 capitalize">
                              {task.category}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{task.assignee?.full_name || 'Atanmamış'}</span>
                          {task.assigned_to === currentUserId && (
                            <Badge variant="info" className="text-xs">Benim</Badge>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {task.due_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {format(new Date(task.due_date), 'dd MMM yyyy', { locale: tr })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Belirsiz</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <Badge variant={
                          task.priority === 'urgent' ? 'destructive' :
                          task.priority === 'high' ? 'destructive' :
                          task.priority === 'medium' ? 'warning' : 'success'
                        }>
                          {getPriorityText(task.priority)}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <Badge variant={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in_progress' ? 'info' :
                          task.status === 'cancelled' ? 'secondary' : 'warning'
                        }>
                          {getStatusText(task.status)}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(task)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCompleteTask && task.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickStatusChange(task.id, 'in_progress')}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                          {canCompleteTask && task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickStatusChange(task.id, 'completed')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
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
              Görev bulunamadı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Arama kriterlerine uygun görev bulunamadı. Filtreleri kontrol edin.' 
                : 'Henüz görev oluşturulmamış. İlk görevinizi oluşturun!'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && canCreateTask && (
              <Button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                İlk Görevini Oluştur
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingTask(null)
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        users={mockUsers}
      />

      <TaskDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        currentUserId={currentUserId}
      />
    </div>
  )
}
