import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select, SelectOption } from '../ui/Select'
import { X, Calendar, Clock, MapPin, Users, Video } from 'lucide-react'
import type { Meeting } from '../../types/meetings'

const meetingSchema = z.object({
  title: z.string().min(1, 'Toplantı başlığı gereklidir'),
  description: z.string().optional(),
  type: z.enum(['meeting', 'conference', 'workshop', 'interview']),
  start_time: z.string().min(1, 'Başlangıç zamanı gereklidir'),
  end_time: z.string().min(1, 'Bitiş zamanı gereklidir'),
  location: z.string().optional(),
  meeting_url: z.string().optional(),
  participants: z.string().optional(),
  tags: z.string().optional(),
})

type MeetingFormData = z.infer<typeof meetingSchema>

interface MeetingFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MeetingFormData) => Promise<void>
  meeting?: Meeting | null
  users?: Array<{ id: string; full_name: string }>
}

const meetingTypes = [
  { value: 'meeting', label: 'Toplantı' },
  { value: 'conference', label: 'Konferans' },
  { value: 'workshop', label: 'Atölye' },
  { value: 'interview', label: 'Mülakat' },
]

export function MeetingForm({ isOpen, onClose, onSubmit, meeting, users = [] }: MeetingFormProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: meeting?.title || '',
      description: meeting?.description || '',
      type: meeting?.type || 'meeting',
      start_time: meeting?.start_time ? new Date(meeting.start_time).toISOString().slice(0, 16) : '',
      end_time: meeting?.end_time ? new Date(meeting.end_time).toISOString().slice(0, 16) : '',
      location: meeting?.location || '',
      meeting_url: meeting?.meeting_url || '',
      participants: meeting?.participants?.map(p => p.full_name).join(', ') || '',
      tags: meeting?.tags?.join(', ') || '',
    }
  })

  const selectedType = watch('type')
  const typeInfo = meetingTypes.find(t => t.value === selectedType)

  const handleFormSubmit = async (data: MeetingFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Toplantı kaydedilirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={meeting ? 'Toplantı Düzenle' : 'Yeni Toplantı'}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Başlık */}
        <div>
          <label className="form-label">
            Toplantı Başlığı *
          </label>
          <Input
            {...register('title')}
            placeholder="Toplantı başlığını girin"
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
            placeholder="Toplantı detaylarını açıklayın..."
            rows={3}
          />
        </div>

        {/* Tip */}
        <div>
          <label className="form-label">
            <Users className="inline h-4 w-4 mr-1" />
            Toplantı Türü
          </label>
          <Select {...register('type')}>
            {meetingTypes.map((type) => (
              <SelectOption key={type.value} value={type.value}>
                {type.label}
              </SelectOption>
            ))}
          </Select>
          {typeInfo && (
            <p className="mt-1 text-sm text-gray-600">
              {typeInfo.label} türü seçildi
            </p>
          )}
        </div>

        {/* Tarih ve Saat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <Calendar className="inline h-4 w-4 mr-1" />
              Başlangıç Zamanı *
            </label>
            <Input
              type="datetime-local"
              {...register('start_time')}
              className={errors.start_time ? 'border-red-500' : ''}
            />
            {errors.start_time && (
              <p className="mt-1 text-sm text-red-600">{errors.start_time.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              <Clock className="inline h-4 w-4 mr-1" />
              Bitiş Zamanı *
            </label>
            <Input
              type="datetime-local"
              {...register('end_time')}
              className={errors.end_time ? 'border-red-500' : ''}
            />
            {errors.end_time && (
              <p className="mt-1 text-sm text-red-600">{errors.end_time.message}</p>
            )}
          </div>
        </div>

        {/* Konum ve Toplantı URL'si */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <MapPin className="inline h-4 w-4 mr-1" />
              Konum
            </label>
            <Input
              {...register('location')}
              placeholder="Toplantı konumu (örn: Ofis, Zoom)"
            />
          </div>

          <div>
            <label className="form-label">
              <Video className="inline h-4 w-4 mr-1" />
              Toplantı URL'si
            </label>
            <Input
              type="url"
              {...register('meeting_url')}
              placeholder="https://zoom.us/j/..."
            />
          </div>
        </div>

        {/* Katılımcılar */}
        <div>
          <label className="form-label">
            <Users className="inline h-4 w-4 mr-1" />
            Katılımcılar
          </label>
          <Input
            {...register('participants')}
            placeholder="Katılımcı isimlerini virgülle ayırın"
          />
          <p className="mt-1 text-sm text-gray-500">
            Katılımcı isimlerini virgülle ayırarak girebilirsiniz
          </p>
        </div>

        {/* Etiketler */}
        <div>
          <label className="form-label">
            Etiketler
          </label>
          <Input
            {...register('tags')}
            placeholder="Etiketleri virgülle ayırın (örn: acil, proje, toplantı)"
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
            {meeting ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
    start_date: '',
    end_date: '',
    location: '',
    meeting_type: 'in_person',
    max_participants: 10,
    status: 'scheduled'
  })

  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        start_date: meeting.start_date,
        end_date: meeting.end_date,
        location: meeting.location || '',
        meeting_type: meeting.meeting_type,
        max_participants: meeting.max_participants || 10,
        status: meeting.status
      })
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        meeting_type: 'in_person',
        max_participants: 10,
        status: 'scheduled'
      })
    }
  }, [meeting])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error('Lütfen gerekli alanları doldurun')
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır')
      return
    }

    onSave(formData)
  }

  const handleInputChange = (field: keyof CreateMeetingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {meeting ? 'Toplantı Düzenle' : 'Yeni Toplantı'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Başlık *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Toplantı başlığı"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Toplantı açıklaması"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Başlangıç Tarihi *</label>
              <Input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bitiş Tarihi *</label>
              <Input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Konum</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Toplantı konumu"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Toplantı Türü</label>
              <select
                value={formData.meeting_type}
                onChange={(e) => handleInputChange('meeting_type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in_person">Yüz Yüze</option>
                <option value="virtual">Sanal</option>
                <option value="hybrid">Hibrit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maksimum Katılımcı</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
                  min="1"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Durum</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Planlandı</option>
              <option value="ongoing">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button type="submit" className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>{meeting ? 'Güncelle' : 'Oluştur'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
