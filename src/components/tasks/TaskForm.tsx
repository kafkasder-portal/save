import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select, SelectOption } from '../ui/Select'
import { X, Calendar, User, Flag } from 'lucide-react'
import type { Task } from '../../types/tasks'

const taskSchema = z.object({
  title: z.string().min(1, 'Görev başlığı gereklidir'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskFormData) => Promise<void>
  task?: Task | null
  users?: Array<{ id: string; full_name: string }>
}

const priorities = [
  { value: 'low', label: 'Düşük', color: 'text-green-600' },
  { value: 'medium', label: 'Orta', color: 'text-yellow-600' },
  { value: 'high', label: 'Yüksek', color: 'text-orange-600' },
  { value: 'urgent', label: 'Acil', color: 'text-red-600' },
]

const categories = [
  { value: 'development', label: 'Geliştirme' },
  { value: 'design', label: 'Tasarım' },
  { value: 'testing', label: 'Test' },
  { value: 'documentation', label: 'Dokümantasyon' },
  { value: 'meeting', label: 'Toplantı' },
  { value: 'research', label: 'Araştırma' },
  { value: 'other', label: 'Diğer' },
]

export function TaskForm({ isOpen, onClose, onSubmit, task, users = [] }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      assigned_to: task?.assigned_to || '',
      due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      category: task?.category || '',
      tags: task?.tags?.join(', ') || '',
    }
  })

  const selectedPriority = watch('priority')
  const priorityInfo = priorities.find(p => p.value === selectedPriority)

  const handleFormSubmit = async (data: TaskFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Görev kaydedilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={task ? 'Görev Düzenle' : 'Yeni Görev'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="form-label">
            Görev Başlığı *
          </label>
          <Input
            {...register('title')}
            placeholder="Görev başlığını girin"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label className="form-label">
            Açıklama
          </label>
          <Textarea
            {...register('description')}
            placeholder="Görev detaylarını açıklayın..."
            rows={4}
          />
        </div>

        {/* Öncelik ve Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <Flag className="inline h-4 w-4 mr-1" />
              Öncelik
            </label>
            <Select {...register('priority')}>
              {priorities.map((priority) => (
                <SelectOption key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectOption>
              ))}
            </Select>
            {priorityInfo && (
              <p className={`mt-1 text-sm ${priorityInfo.color}`}>
                {priorityInfo.label} öncelik seçildi
              </p>
            )}
          </div>

          <div>
            <label className="form-label">
              Kategori
            </label>
            <Select {...register('category')} placeholder="Kategori seçin">
              <SelectOption value="">Kategori seçin</SelectOption>
              {categories.map((category) => (
                <SelectOption key={category.value} value={category.value}>
                  {category.label}
                </SelectOption>
              ))}
            </Select>
          </div>
        </div>

        {/* Atanan Kişi ve Bitiş Tarihi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <User className="inline h-4 w-4 mr-1" />
              Atanan Kişi
            </label>
            <Select {...register('assigned_to')} placeholder="Kişi seçin">
              <SelectOption value="">Kişi seçin</SelectOption>
              {users.map((user) => (
                <SelectOption key={user.id} value={user.id}>
                  {user.full_name}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="form-label">
              <Calendar className="inline h-4 w-4 mr-1" />
              Bitiş Tarihi
            </label>
            <Input
              type="date"
              {...register('due_date')}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Etiketler */}
        <div>
          <label className="form-label">
            Etiketler
          </label>
          <Input
            {...register('tags')}
            placeholder="Etiketleri virgülle ayırın (örn: acil, frontend, bug)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Etiketleri virgülle ayırarak girebilirsiniz
          </p>
        </div>

        {/* Form Butonları */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? (
              <div className="spinner h-4 w-4 mr-2" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            {task ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
