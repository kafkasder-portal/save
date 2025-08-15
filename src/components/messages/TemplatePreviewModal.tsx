import { useState } from 'react'
import { Modal } from '../Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { 
  X, 
  Send, 
  Edit3,
  Copy,
  Mail,
  MessageSquare,
  FileText,
  RefreshCw
} from 'lucide-react'

interface MessageTemplate {
  id: string
  name: string
  subject?: string
  content: string
  type: 'email' | 'sms' | 'notification'
  category: string
  variables: string[]
  usage_count: number
  created_at: string
  updated_at: string
  is_active: boolean
}

interface TemplatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: MessageTemplate | null
  onEdit?: (template: MessageTemplate) => void
  onUse?: (template: MessageTemplate) => void
  onDuplicate?: (template: MessageTemplate) => void
}

const typeConfig = {
  email: { icon: Mail, label: 'E-posta', color: 'text-blue-600' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-green-600' },
  notification: { icon: FileText, label: 'Bildirim', color: 'text-purple-600' },
} as const

export function TemplatePreviewModal({
  isOpen,
  onClose,
  template,
  onEdit,
  onUse,
  onDuplicate
}: TemplatePreviewModalProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [useRealData, setUseRealData] = useState(false)

  if (!template) return null

  const typeInfo = typeConfig[template.type]
  const TypeIcon = typeInfo.icon

  // Sample data for preview
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

  const getPreviewContent = () => {
    let content = template.content
    
    const dataToUse = useRealData ? variableValues : sampleData

    template.variables.forEach(variable => {
      const value = dataToUse[variable] || variable
      content = content.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    return content
  }

  const getPreviewSubject = () => {
    if (!template.subject) return ''
    
    let subject = template.subject
    const dataToUse = useRealData ? variableValues : sampleData

    template.variables.forEach(variable => {
      const value = dataToUse[variable] || variable
      subject = subject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    return subject
  }

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }))
  }

  const resetToSampleData = () => {
    setVariableValues({})
    setUseRealData(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Template Önizleme" size="lg">
      <div className="space-y-6">
        {/* Template Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TypeIcon className={`h-6 w-6 ${typeInfo.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {template.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={template.is_active ? 'success' : 'secondary'}>
                  {template.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
                <Badge variant="outline">
                  {typeInfo.label}
                </Badge>
                <Badge variant="outline">
                  {template.category}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(template)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            )}
            {onDuplicate && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicate(template)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopyala
              </Button>
            )}
            {onUse && (
              <Button
                size="sm"
                onClick={() => onUse(template)}
                className="btn-primary"
              >
                <Send className="h-4 w-4 mr-2" />
                Kullan
              </Button>
            )}
          </div>
        </div>

        {/* Variables Input */}
        {template.variables.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Değişken Değerleri
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetToSampleData}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Örnek Verilere Dön
                </Button>
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={useRealData}
                    onChange={(e) => setUseRealData(e.target.checked)}
                    className="mr-2"
                  />
                  Gerçek veri kullan
                </label>
              </div>
            </div>

            {useRealData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {template.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {variable}
                    </label>
                    <Input
                      value={variableValues[variable] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      placeholder={sampleData[variable] || 'Değer girin'}
                    />
                  </div>
                ))}
              </div>
            )}

            {!useRealData && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Önizlemede örnek veriler kullanılıyor. Gerçek verilerle test etmek için 
                  "Gerçek veri kullan" seçeneğini işaretleyin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Önizleme
          </h4>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Subject (Email only) */}
            {template.type === 'email' && template.subject && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">Konu:</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {getPreviewSubject()}
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-4 bg-white dark:bg-gray-900">
              <div 
                className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                style={{
                  fontFamily: template.type === 'email' ? 'inherit' : 'monospace'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: getPreviewContent().replace(/\n/g, '<br>') 
                }}
              />
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Karakter sayısı: {getPreviewContent().length}
                  {template.type === 'sms' && ` / 160`}
                </span>
                <span>
                  Son güncellenme: {new Date(template.updated_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Template Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {template.usage_count}
            </p>
            <p className="text-sm text-gray-500">Kullanım</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {template.variables.length}
            </p>
            <p className="text-sm text-gray-500">Değişken</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(template.created_at).toLocaleDateString('tr-TR')}
            </p>
            <p className="text-sm text-gray-500">Oluşturulma</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Kapat
          </Button>
          {onUse && (
            <Button
              onClick={() => onUse(template)}
              className="flex-1 btn-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              Bu Template'i Kullan
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
