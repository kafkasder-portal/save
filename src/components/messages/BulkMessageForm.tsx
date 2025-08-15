import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select, SelectOption } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { 
  X, 
  Send, 
  Users,
  Mail,
  MessageSquare,
  Upload,
  Download,
  Plus,
  Trash2,
  FileText,
  AlertCircle
} from 'lucide-react'

const bulkMessageSchema = z.object({
  type: z.enum(['email', 'sms']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Mesaj içeriği gereklidir'),
  recipient_type: z.enum(['all', 'group', 'custom']),
  recipient_groups: z.array(z.string()).optional(),
  send_immediately: z.boolean().default(true),
  scheduled_time: z.string().optional(),
})

type BulkMessageFormData = z.infer<typeof bulkMessageSchema>

interface BulkMessageFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BulkMessageFormData & { recipients: string[] }) => Promise<void>
  template?: any
}

interface Recipient {
  id: string
  name: string
  email?: string
  phone?: string
  groups: string[]
}

const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90555123456',
    groups: ['Personel', 'Yönetici']
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    phone: '+90555234567',
    groups: ['Personel', 'Muhasebe']
  },
  {
    id: '3',
    name: 'Mehmet Kaya',
    email: 'mehmet@example.com',
    phone: '+90555345678',
    groups: ['Personel', 'IT']
  }
]

const recipientGroups = [
  { id: 'personel', name: 'Personel', count: 25 },
  { id: 'yonetici', name: 'Yöneticiler', count: 5 },
  { id: 'muhasebe', name: 'Muhasebe', count: 8 },
  { id: 'it', name: 'IT Ekibi', count: 12 }
]

export function BulkMessageForm({ isOpen, onClose, onSubmit, template }: BulkMessageFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [customRecipients, setCustomRecipients] = useState<string>('')
  const [previewRecipients, setPreviewRecipients] = useState<Recipient[]>([])
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<BulkMessageFormData>({
    resolver: zodResolver(bulkMessageSchema),
    defaultValues: {
      type: 'email',
      recipient_type: 'all',
      send_immediately: true,
      content: template?.content || '',
      subject: template?.subject || '',
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    if (template) {
      setValue('content', template.content)
      setValue('subject', template.subject || '')
      setValue('type', template.type)
    }
  }, [template, setValue])

  useEffect(() => {
    updatePreviewRecipients()
  }, [watchedValues.recipient_type, watchedValues.recipient_groups, selectedRecipients, customRecipients])

  const updatePreviewRecipients = () => {
    let recipients: Recipient[] = []

    switch (watchedValues.recipient_type) {
      case 'all':
        recipients = mockRecipients
        break
      case 'group':
        if (watchedValues.recipient_groups) {
          recipients = mockRecipients.filter(recipient =>
            watchedValues.recipient_groups!.some(groupId =>
              recipient.groups.some(group => 
                group.toLowerCase() === recipientGroups.find(g => g.id === groupId)?.name.toLowerCase()
              )
            )
          )
        }
        break
      case 'custom':
        const emails = customRecipients.split(',').map(email => email.trim()).filter(Boolean)
        recipients = mockRecipients.filter(recipient => 
          emails.includes(recipient.email || '')
        )
        break
    }

    setPreviewRecipients(recipients)
  }

  const handleFormSubmit = async (data: BulkMessageFormData) => {
    setLoading(true)
    try {
      const recipientIds = previewRecipients.map(r => r.id)
      await onSubmit({ ...data, recipients: recipientIds })
      reset()
      onClose()
    } catch (error) {
      console.error('Bulk message send error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedRecipients([])
    setCustomRecipients('')
    setPreviewRecipients([])
    onClose()
  }

  const getEstimatedCost = () => {
    const count = previewRecipients.length
    if (watchedValues.type === 'email') {
      return `${count} e-posta (Ücretsiz)`
    } else {
      const cost = count * 0.05 // SMS cost per message
      return `${count} SMS (~${cost.toFixed(2)} TL)`
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Toplu Mesaj Gönder" size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Message Type */}
        <div>
          <label className="form-label">
            Mesaj Türü *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <input
                type="radio"
                value="email"
                {...register('type')}
                className="mr-3"
              />
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              <span>E-posta</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <input
                type="radio"
                value="sms"
                {...register('type')}
                className="mr-3"
              />
              <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
              <span>SMS</span>
            </label>
          </div>
        </div>

        {/* Subject (Email only) */}
        {watchedValues.type === 'email' && (
          <div>
            <label className="form-label">
              Konu
            </label>
            <Input
              {...register('subject')}
              placeholder="E-posta konusu"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <label className="form-label">
            Mesaj İçeriği *
          </label>
          <Textarea
            {...register('content')}
            placeholder={watchedValues.type === 'email' 
              ? "E-posta içeriğini yazın..."
              : "SMS içeriğini yazın... (Max 160 karakter)"
            }
            rows={watchedValues.type === 'email' ? 8 : 4}
            maxLength={watchedValues.type === 'sms' ? 160 : undefined}
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
          {watchedValues.type === 'sms' && (
            <p className="mt-1 text-sm text-gray-500">
              {watchedValues.content?.length || 0}/160 karakter
            </p>
          )}
        </div>

        {/* Recipients */}
        <div>
          <label className="form-label">
            Alıcılar *
          </label>
          
          {/* Recipient Type Selection */}
          <div className="space-y-3 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                {...register('recipient_type')}
                className="mr-2"
              />
              <span>Tüm kullanıcılar ({mockRecipients.length} kişi)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="group"
                {...register('recipient_type')}
                className="mr-2"
              />
              <span>Gruplar</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                {...register('recipient_type')}
                className="mr-2"
              />
              <span>Özel liste</span>
            </label>
          </div>

          {/* Group Selection */}
          {watchedValues.recipient_type === 'group' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Gönderilecek grupları seçin:</p>
              <div className="grid grid-cols-2 gap-2">
                {recipientGroups.map((group) => (
                  <label key={group.id} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="checkbox"
                      value={group.id}
                      {...register('recipient_groups')}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {group.name} ({group.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Recipients */}
          {watchedValues.recipient_type === 'custom' && (
            <div>
              <Textarea
                value={customRecipients}
                onChange={(e) => setCustomRecipients(e.target.value)}
                placeholder="E-posta adreslerini virgülle ayırarak girin..."
                rows={3}
              />
              <p className="mt-1 text-sm text-gray-500">
                Örnek: ahmet@example.com, ayse@example.com
              </p>
            </div>
          )}
        </div>

        {/* Preview Recipients */}
        {previewRecipients.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alıcı Önizlemesi ({previewRecipients.length} kişi)
              </h4>
              <Badge variant="outline">
                {getEstimatedCost()}
              </Badge>
            </div>
            
            <div className="max-h-32 overflow-y-auto space-y-1">
              {previewRecipients.slice(0, 10).map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900 dark:text-gray-100">{recipient.name}</span>
                  <span className="text-gray-500">
                    {watchedValues.type === 'email' ? recipient.email : recipient.phone}
                  </span>
                </div>
              ))}
              {previewRecipients.length > 10 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{previewRecipients.length - 10} kişi daha...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Scheduling */}
        <div>
          <label className="form-label">
            Gönderim Zamanı
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                {...register('send_immediately')}
                value="true"
                className="mr-2"
              />
              <span>Hemen gönder</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                {...register('send_immediately')}
                value="false"
                className="mr-2"
              />
              <span>Zamanla</span>
            </label>
          </div>
          
          {!watchedValues.send_immediately && (
            <div className="mt-3">
              <Input
                type="datetime-local"
                {...register('scheduled_time')}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Warning */}
        {previewRecipients.length > 50 && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Büyük Grup Uyarısı
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {previewRecipients.length} kişiye mesaj göndereceksiniz. Bu işlem birkaç dakika sürebilir.
              </p>
            </div>
          </div>
        )}

        {/* Form Actions */}
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
            disabled={loading || previewRecipients.length === 0}
            className="flex-1 btn-primary"
          >
            {loading ? (
              <div className="spinner h-4 w-4 mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {watchedValues.send_immediately ? 'Gönder' : 'Zamanla'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
