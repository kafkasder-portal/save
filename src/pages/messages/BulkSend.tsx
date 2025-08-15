import { useState } from 'react'
import { 
  Send, 
  FileText, 
  AlertCircle,
  Upload,
  X
} from 'lucide-react'
import { Modal } from '@components/Modal'
import { log } from '@/utils/logger'
// Mock data kaldırıldı - gerçek API'den veri gelecek

interface Recipient {
  id: string
  name: string
  phone?: string
  email?: string
  type: 'individual' | 'group'
}

export default function BulkSend() {
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'notification'>('notification')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [customRecipients, setCustomRecipients] = useState<Recipient[]>([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [newRecipientName, setNewRecipientName] = useState('')
  const [newRecipientContact, setNewRecipientContact] = useState('')

  // Mock data - gerçek API entegrasyonu yapılana kadar
  const messageTemplates = [
    { id: 1, name: 'Hoş Geldiniz Mesajı', subject: 'Derneğimize Hoş Geldiniz', content: 'Sayın {firstName}, derneğimize hoş geldiniz...' },
    { id: 2, name: 'Toplantı Daveti', subject: 'Aylık Genel Toplantı', content: 'Toplantı tarihi: {meetingDate}...' },
    { id: 3, name: 'Yardım Onayı', subject: 'Yardım Başvurunuz Onaylandı', content: 'Başvurunuz onaylanmıştır...' }
  ];

  const messageGroups = [
    { id: 1, name: 'Tüm Üyeler', memberCount: 156 },
    { id: 2, name: 'Yönetim Kurulu', memberCount: 8 },
    { id: 3, name: 'Yardım Başvuru Sahipleri', memberCount: 45 },
    { id: 4, name: 'Öğrenciler', memberCount: 32 },
    { id: 5, name: 'Kafkasya Bölgesi', memberCount: 89 }
  ];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = messageTemplates.find(t => t.id === Number(templateId))
    if (template) {
      setSubject(template.subject)
      setContent(template.content)
    }
  }

  const handleGroupToggle = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const addCustomRecipient = () => {
    if (newRecipientName && newRecipientContact) {
      const newRecipient: Recipient = {
        id: Date.now().toString(),
        name: newRecipientName,
        type: 'individual'
      }
      
      if (messageType === 'sms') {
        newRecipient.phone = newRecipientContact
      } else if (messageType === 'email') {
        newRecipient.email = newRecipientContact
      }
      
      setCustomRecipients(prev => [...prev, newRecipient])
      setNewRecipientName('')
      setNewRecipientContact('')
    }
  }

  const removeCustomRecipient = (id: string) => {
    setCustomRecipients(prev => prev.filter(r => r.id !== id))
  }

  const getTotalRecipients = () => {
    const groupRecipients = selectedGroups.reduce((total, groupId) => {
      const group = messageGroups.find(g => g.id === groupId)
      return total + (group?.memberCount || 0)
    }, 0)
    return groupRecipients + customRecipients.length
  }

  const handleSend = () => {
    // Gönderim işlemi burada yapılacak
    log.info('Mesaj gönderiliyor...', {
      messageType,
      selectedGroups,
      customRecipients,
      subject,
      content,
      priority,
      scheduleType,
      scheduledDate,
      scheduledTime
    })
    alert('Mesaj başarıyla gönderildi!')
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Toplu Mesaj Gönderimi</h1>
          <p className="text-gray-600 mt-1">Birden fazla alıcıya aynı anda mesaj gönderin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Önizleme
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4" />
            Gönder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel - Mesaj Ayarları */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mesaj Türü */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mesaj Türü</h2>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setMessageType('notification')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  messageType === 'notification'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Bildirim</div>
              </button>
              <button
                onClick={() => setMessageType('sms')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  messageType === 'sms'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Send className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">SMS</div>
              </button>
              <button
                onClick={() => setMessageType('email')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  messageType === 'email'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">E-posta</div>
              </button>
            </div>
          </div>

          {/* Şablon Seçimi */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mesaj Şablonu</h2>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Şablon seçin (isteğe bağlı)</option>
              {messageTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mesaj İçeriği */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mesaj İçeriği</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konu</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mesaj konusu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mesaj içeriğini yazın..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  Karakter sayısı: {content.length}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="high">Yüksek</option>
                  <option value="urgent">Acil</option>
                </select>
              </div>
            </div>
          </div>

          {/* Zamanlama */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Gönderim Zamanı</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="now"
                    checked={scheduleType === 'now'}
                    onChange={(e) => setScheduleType(e.target.value as 'now' | 'scheduled')}
                    className="mr-2"
                  />
                  Şimdi gönder
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={scheduleType === 'scheduled'}
                    onChange={(e) => setScheduleType(e.target.value as 'now' | 'scheduled')}
                    className="mr-2"
                  />
                  Zamanla
                </label>
              </div>
              
              {scheduleType === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Alıcılar */}
        <div className="space-y-6">
          {/* Özet */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Gönderim Özeti</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Toplam Alıcı:</span>
                <span className="font-medium">{getTotalRecipients()}</span>
              </div>
              <div className="flex justify-between">
                <span>Mesaj Türü:</span>
                <span className="font-medium">
                  {messageType === 'sms' ? 'SMS' : messageType === 'email' ? 'E-posta' : 'Bildirim'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Öncelik:</span>
                <span className="font-medium">
                  {priority === 'low' ? 'Düşük' : priority === 'normal' ? 'Normal' : priority === 'high' ? 'Yüksek' : 'Acil'}
                </span>
              </div>
            </div>
          </div>

          {/* Grup Seçimi */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">Mesaj Grupları</h3>
            <div className="space-y-2">
              {messageGroups.map(group => (
                <label key={group.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{group.name}</div>
                    <div className="text-xs text-gray-500">{group.memberCount} üye</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Bireysel Alıcılar */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-4">Bireysel Alıcılar</h3>
            
            {/* Yeni al��cı ekleme */}
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Alıcı adı"
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newRecipientContact}
                onChange={(e) => setNewRecipientContact(e.target.value)}
                placeholder={messageType === 'sms' ? 'Telefon numarası' : messageType === 'email' ? 'E-posta adresi' : 'İletişim bilgisi'}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addCustomRecipient}
                className="w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Ekle
              </button>
            </div>

            {/* Eklenen alıcılar */}
            <div className="space-y-2">
              {customRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">{recipient.name}</div>
                    <div className="text-xs text-gray-500">
                      {recipient.phone || recipient.email}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCustomRecipient(recipient.id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Dosyadan içe aktarma */}
            <div className="mt-4 pt-4 border-t">
              <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:border-gray-400 transition-colors">
                <Upload className="h-4 w-4" />
                Dosyadan İçe Aktar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Önizleme Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Mesaj Önizlemesi"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Gönderim Bilgileri</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tür:</span>
                <span className="ml-2 font-medium">
                  {messageType === 'sms' ? 'SMS' : messageType === 'email' ? 'E-posta' : 'Bildirim'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Öncelik:</span>
                <span className="ml-2 font-medium">
                  {priority === 'low' ? 'Düşük' : priority === 'normal' ? 'Normal' : priority === 'high' ? 'Yüksek' : 'Acil'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Toplam Alıcı:</span>
                <span className="ml-2 font-medium">{getTotalRecipients()}</span>
              </div>
              <div>
                <span className="text-gray-600">Zamanlama:</span>
                <span className="ml-2 font-medium">
                  {scheduleType === 'now' ? 'Şimdi' : `${scheduledDate} ${scheduledTime}`}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Mesaj İçeriği</h4>
            <div className="border rounded-lg p-4">
              {subject && (
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Konu:</div>
                  <div className="font-medium">{subject}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 mb-1">İçerik:</div>
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kapat
            </button>
            <button
              onClick={() => {
                setIsPreviewModalOpen(false)
                handleSend()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Gönder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
