import { memo, useState } from 'react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { 
  FileText, 
  Mail, 
  MessageSquare,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Send,
  Eye
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

interface TemplateCardProps {
  template: MessageTemplate
  onEdit: (template: MessageTemplate) => void
  onDelete: (templateId: string) => void
  onDuplicate: (template: MessageTemplate) => void
  onUse: (template: MessageTemplate) => void
  onPreview: (template: MessageTemplate) => void
}

const typeConfig = {
  email: { icon: Mail, label: 'E-posta', color: 'text-blue-600' },
  sms: { icon: MessageSquare, label: 'SMS', color: 'text-green-600' },
  notification: { icon: FileText, label: 'Bildirim', color: 'text-purple-600' },
} as const

export const TemplateCard = memo(function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onUse,
  onPreview
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const typeInfo = typeConfig[template.type]
  const TypeIcon = typeInfo.icon

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
  }

  return (
    <div className="card transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
          <Badge variant={template.is_active ? 'success' : 'secondary'}>
            {template.is_active ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 min-w-[150px]">
              <button
                onClick={() => {
                  onPreview(template)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Önizle
              </button>
              
              <button
                onClick={() => {
                  onUse(template)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Kullan
              </button>
              
              <button
                onClick={() => {
                  onEdit(template)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Düzenle
              </button>
              
              <button
                onClick={() => {
                  onDuplicate(template)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Kopyala
              </button>
              
              <button
                onClick={() => {
                  onDelete(template.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title and Subject */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {template.name}
        </h3>
        
        {template.subject && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Konu: {template.subject}
          </p>
        )}
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {getPreviewText(template.content)}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-400">
            {typeInfo.label}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 dark:text-gray-400">
            {template.category}
          </span>
        </div>

        {/* Variables */}
        {template.variables.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-500">Değişkenler: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {template.variables.slice(0, 3).map((variable, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {variable}
                </span>
              ))}
              {template.variables.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{template.variables.length - 3} daha
                </span>
              )}
            </div>
          </div>
        )}

        {/* Usage Count */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{template.usage_count} kez kullanıldı</span>
          <span>{new Date(template.updated_at).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPreview(template)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Önizle
        </Button>
        <Button
          size="sm"
          onClick={() => onUse(template)}
          className="flex-1 btn-primary"
        >
          <Send className="h-4 w-4 mr-2" />
          Kullan
        </Button>
      </div>
    </div>
  )
})
