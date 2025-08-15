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
  Save, 
  Plus,
  Trash2,
  Info,
  Eye,
  Code
} from 'lucide-react'

const templateSchema = z.object({
  name: z.string().min(1, 'Template adı gereklidir'),
  subject: z.string().optional(),
  content: z.string().min(1, 'İçerik gereklidir'),
  type: z.enum(['email', 'sms', 'notification']),
  category: z.string().min(1, 'Kategori gereklidir'),
  is_active: z.boolean().default(true),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface TemplateFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TemplateFormData & { variables: string[] }) => Promise<void>
  template?: any
  title?: string
}

const categories = [
  'Genel',
  'Bilgilendirme',
  'Promosyon',
  'Hatırlatma',
  'Hoş Geldin',
  'Şifre Sıfırlama',
  'Sistem Bildirimi',
  'Davet',
  'Onay',
  'Uyarı'
]

const commonVariables = [
  '{{name}}',
  '{{email}}',
  '{{date}}',
  '{{time}}',
  '{{company}}',
  '{{phone}}',
  '{{title}}',
  '{{department}}',
  '{{amount}}',
  '{{link}}'
]

export function TemplateForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  template,
  title = 'Yeni Template'
}: TemplateFormProps) {
  const [loading, setLoading] = useState(false)
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      content: template?.content || '',
      type: template?.type || 'email',
      category: template?.category || 'Genel',
      is_active: template?.is_active ?? true,
    }
  })

  const watchedContent = watch('content')
  const watchedType = watch('type')

  useEffect(() => {
    if (template) {
      Object.keys(template).forEach(key => {
        if (key in templateSchema.shape) {
          setValue(key as keyof TemplateFormData, template[key])
        }
      })
    }
  }, [template, setValue])

  useEffect(() => {
    // Detect variables in content
    const variablePattern = /\{\{([^}]+)\}\}/g
    const matches = watchedContent?.match(variablePattern) || []
    const uniqueVariables = [...new Set(matches)]
    setDetectedVariables(uniqueVariables)
  }, [watchedContent])

  const handleFormSubmit = async (data: TemplateFormData) => {
    setLoading(true)
    try {
      await onSubmit({ ...data, variables: detectedVariables })
      reset()
      onClose()
    } catch (error) {
      console.error('Template save error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setDetectedVariables([])
    setShowPreview(false)
    onClose()
  }

  const insertVariable = (variable: string) => {
    const content = watch('content') || ''
    const newContent = content + variable
    setValue('content', newContent)
  }

  const getPreviewContent = () => {
    let content = watchedContent || ''
    
    // Replace variables with sample data
    const sampleData: Record<string, string> = {
      '{{name}}': 'Ahmet Yılmaz',
      '{{email}}': 'ahmet@example.com',
      '{{date}}': new Date().toLocaleDateString('tr-TR'),
      '{{time}}': new Date().toLocaleTimeString('tr-TR'),
      '{{company}}': 'Örnek Şirket',
      '{{phone}}': '+90 555 123 4567',
      '{{title}}': 'Yazılım Geliştirici',
      '{{department}}': 'IT Departmanı',
      '{{amount}}': '1.250,00 TL',
      '{{link}}': 'https://example.com'
    }

    Object.entries(sampleData).forEach(([variable, value]) => {
      content = content.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    return content
  }

  const typeOptions: SelectOption[] = [
    { value: 'email', label: 'E-posta' },
    { value: 'sms', label: 'SMS' },
    { value: 'notification', label: 'Bildirim' }
  ]

  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat,
    label: cat
  }))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-hidden">
        {/* Form Section */}
        <div className="lg:col-span-2 overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Template Adı *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Template adını girin"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">
                  Kategori *
                </label>
                <Select
                  options={categoryOptions}
                  value={watch('category')}
                  onChange={(value) => setValue('category', value)}
                  placeholder="Kategori seçin"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Tür *
                </label>
                <Select
                  options={typeOptions}
                  value={watch('type')}
                  onChange={(value) => setValue('type', value as any)}
                  placeholder="Tür seçin"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Aktif
                  </span>
                </label>
              </div>
            </div>

            {/* Subject (Email only) */}
            {watchedType === 'email' && (
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
                İçerik *
              </label>
              <Textarea
                {...register('content')}
                placeholder={watchedType === 'email' 
                  ? "E-posta içeriğini yazın..."
                  : "Mesaj içeriğini yazın..."
                }
                rows={watchedType === 'email' ? 12 : 6}
                maxLength={watchedType === 'sms' ? 160 : undefined}
                className={`${errors.content ? 'border-red-500' : ''} font-mono`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
              {watchedType === 'sms' && (
                <p className="mt-1 text-sm text-gray-500">
                  {watchedContent?.length || 0}/160 karakter
                </p>
              )}
            </div>

            {/* Variables */}
            {detectedVariables.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Tespit Edilen Değişkenler
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detectedVariables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-100 dark:bg-blue-900">
                      {variable}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Bu değişkenler mesaj gönderilirken gerçek verilerle değiştirilecektir.
                </p>
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
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Formu Göster' : 'Önizle'}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <div className="spinner h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Kaydet
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 overflow-y-auto">
          {!showPreview ? (
            <>
              {/* Quick Variables */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Hızlı Değişkenler
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {commonVariables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      className="text-left text-xs p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded font-mono"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Değişken Kullanımı
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Değişkenleri içeriğe eklemek için üzerlerine tıklayın. 
                        Mesaj gönderilirken bu değişkenler gerçek verilerle değiştirilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  İpuçları
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Kişiselleştirme için değişkenleri kullanın</p>
                  <p>• SMS'ler için 160 karakter sınırına dikkat edin</p>
                  <p>• Test gönderimleri yaparak önizleme kontrol edin</p>
                  <p>• Açık ve anlaşılır bir dil kullanın</p>
                </div>
              </div>
            </>
          ) : (
            /* Preview */
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Önizleme
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {watchedType === 'email' && watch('subject') && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Konu: {watch('subject')}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto">
                  <div 
                    className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: getPreviewContent().replace(/\n/g, '<br>') }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bu önizlemede değişkenler örnek verilerle gösterilmektedir.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
