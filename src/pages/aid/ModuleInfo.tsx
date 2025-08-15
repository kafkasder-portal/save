import { useState, useEffect } from 'react'
import { 
  Info, 
  Settings, 
  HelpCircle, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Star, 
  Clock, 
  User, 
  Bookmark, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Play,
  BookOpen,
  Lightbulb,
  AlertCircle,
  Globe,
  Phone,
  Mail
} from 'lucide-react'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
import { log } from '@/utils/logger'

interface ModuleGuide {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'features' | 'advanced' | 'troubleshooting'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  steps: GuideStep[]
  tags: string[]
  lastUpdated: string
  author: string
  views: number
  rating: number
  helpful: number
}

interface GuideStep {
  id: string
  title: string
  content: string
  type: 'text' | 'image' | 'video' | 'code' | 'warning' | 'tip'
  media?: string
  code?: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  views: number
  lastUpdated: string
}

interface Resource {
  id: string
  title: string
  description: string
  type: 'document' | 'video' | 'tutorial' | 'template' | 'api'
  url: string
  downloadUrl?: string
  category: string
  size?: string
  duration?: string
  lastUpdated: string
  downloads: number
}

interface ModuleStats {
  totalGuides: number
  totalFAQs: number
  totalResources: number
  totalViews: number
  averageRating: number
  helpfulVotes: number
}

const categories = [
  { value: 'getting-started', label: 'Başlangıç', icon: Play },
  { value: 'features', label: 'Özellikler', icon: Star },
  { value: 'advanced', label: 'İleri Seviye', icon: Settings },
  { value: 'troubleshooting', label: 'Sorun Giderme', icon: AlertCircle }
]

const difficulties = [
  { value: 'beginner', label: 'Başlangıç', color: 'text-green-600' },
  { value: 'intermediate', label: 'Orta', color: 'text-yellow-600' },
  { value: 'advanced', label: 'İleri', color: 'text-red-600' }
]

const resourceTypes = [
  { value: 'document', label: 'Doküman', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'tutorial', label: 'Eğitim', icon: BookOpen },
  { value: 'template', label: 'Şablon', icon: Bookmark },
  { value: 'api', label: 'API', icon: Settings }
]

export default function ModuleInfo() {
  const [guides, setGuides] = useState<ModuleGuide[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [stats, setStats] = useState<ModuleStats>({
    totalGuides: 0,
    totalFAQs: 0,
    totalResources: 0,
    totalViews: 0,
    averageRating: 0,
    helpfulVotes: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'guides' | 'faqs' | 'resources'>('guides')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)


  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Mock data
      const mockGuides: ModuleGuide[] = [
        {
          id: '1',
          title: 'Yardım Yönetimi Modülüne Giriş',
          description: 'Yardım yönetimi modülünün temel özelliklerini ve kullanımını öğrenin',
          category: 'getting-started',
          difficulty: 'beginner',
          estimatedTime: 15,
          steps: [
            {
              id: '1',
              title: 'Modüle Giriş',
              content: 'Yardım yönetimi modülü, ihtiyaç sahiplerine yapılan yardımları takip etmek ve yönetmek için kullanılır.',
              type: 'text'
            },
            {
              id: '2',
              title: 'Ana Sayfaya Genel Bakış',
              content: 'Ana sayfada toplam istatistikler, son başvurular ve hızlı erişim linkleri bulunur.',
              type: 'text'
            },
            {
              id: '3',
              title: 'Navigasyon Menüsü',
              content: 'Sol menüden tüm yardım yönetimi sayfalarına erişebilirsiniz.',
              type: 'text'
            }
          ],
          tags: ['başlangıç', 'genel bakış', 'navigasyon'],
          lastUpdated: new Date().toISOString(),
          author: 'Sistem Yöneticisi',
          views: 245,
          rating: 4.8,
          helpful: 32
        },
        {
          id: '2',
          title: 'İhtiyaç Sahipleri Yönetimi',
          description: 'İhtiyaç sahiplerini nasıl ekleyeceğinizi, düzenleyeceğinizi ve yöneteceğinizi öğrenin',
          category: 'features',
          difficulty: 'beginner',
          estimatedTime: 20,
          steps: [
            {
              id: '1',
              title: 'Yeni İhtiyaç Sahibi Ekleme',
              content: 'İhtiyaç Sahipleri sayfasında "Yeni Ekle" butonuna tıklayarak yeni kayıt oluşturabilirsiniz.',
              type: 'text'
            },
            {
              id: '2',
              title: 'Zorunlu Alanlar',
              content: 'Ad, soyad, telefon ve adres bilgileri zorunlu alanlardır.',
              type: 'warning'
            },
            {
              id: '3',
              title: 'Arama ve Filtreleme',
              content: 'Kayıtları ad, telefon veya adres bilgilerine göre arayabilir ve filtreleyebilirsiniz.',
              type: 'tip'
            }
          ],
          tags: ['ihtiyaç sahipleri', 'ekleme', 'düzenleme'],
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author: 'Eğitim Ekibi',
          views: 189,
          rating: 4.6,
          helpful: 28
        },
        {
          id: '3',
          title: 'Yardım Başvuruları İşleme',
          description: 'Gelen yardım başvurularını nasıl değerlendireceğinizi ve işleyeceğinizi öğrenin',
          category: 'features',
          difficulty: 'intermediate',
          estimatedTime: 30,
          steps: [
            {
              id: '1',
              title: 'Başvuru Durumları',
              content: 'Başvurular beklemede, değerlendiriliyor, onaylandı, reddedildi durumlarında olabilir.',
              type: 'text'
            },
            {
              id: '2',
              title: 'Değerlendirme Süreci',
              content: 'Her başvuru için öncelik seviyesi ve değerlendirme notları ekleyebilirsiniz.',
              type: 'text'
            },
            {
              id: '3',
              title: 'Toplu İşlemler',
              content: 'Birden fazla başvuruyu aynı anda onaylayabilir veya reddedebilirsiniz.',
              type: 'tip'
            }
          ],
          tags: ['başvurular', 'değerlendirme', 'onay'],
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'Uzman Kullanıcı',
          views: 156,
          rating: 4.9,
          helpful: 24
        },
        {
          id: '4',
          title: 'Raporlama ve Analiz',
          description: 'Yardım verilerini analiz etmek ve raporlar oluşturmak için gelişmiş özellikler',
          category: 'advanced',
          difficulty: 'advanced',
          estimatedTime: 45,
          steps: [
            {
              id: '1',
              title: 'Grafik Türleri',
              content: 'Bar, pasta ve çizgi grafikleri ile verilerinizi görselleştirin.',
              type: 'text'
            },
            {
              id: '2',
              title: 'Filtreleme Seçenekleri',
              content: 'Tarih aralığı, kategori ve durum filtrelerini kullanarak detaylı analizler yapın.',
              type: 'text'
            },
            {
              id: '3',
              title: 'Veri Dışa Aktarma',
              content: 'Raporları CSV formatında dışa aktarabilirsiniz.',
              type: 'tip'
            }
          ],
          tags: ['raporlar', 'analiz', 'grafikler'],
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          author: 'Veri Analisti',
          views: 98,
          rating: 4.7,
          helpful: 18
        }
      ]

      const mockFAQs: FAQ[] = [
        {
          id: '1',
          question: 'Yeni bir ihtiyaç sahibi nasıl eklenir?',
          answer: 'İhtiyaç Sahipleri sayfasında sağ üstteki "Yeni Ekle" butonuna tıklayın. Açılan formda gerekli bilgileri doldurup "Kaydet" butonuna basın.',
          category: 'İhtiyaç Sahipleri',
          helpful: 45,
          views: 234,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          question: 'Yardım başvurusu nasıl onaylanır?',
          answer: 'Yardım Başvuruları sayfasında ilgili başvuruyu seçin, "Değerlendir" butonuna tıklayın ve durumu "Onaylandı" olarak değiştirin.',
          category: 'Başvurular',
          helpful: 38,
          views: 189,
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          question: 'Nakdi yardım nasıl kaydedilir?',
          answer: 'Nakdi Yardım Veznesi sayfasında "Yeni Dağıtım" butonuna tıklayın. Alıcı bilgilerini, tutarı ve açıklamayı girdikten sonra kaydedin.',
          category: 'Nakdi Yardım',
          helpful: 29,
          views: 156,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          question: 'Raporları nasıl dışa aktarabilirim?',
          answer: 'Raporlar sayfasında istediğiniz filtreleri uygulayın ve "İndir" butonuna tıklayarak CSV formatında dışa aktarın.',
          category: 'Raporlar',
          helpful: 22,
          views: 98,
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          question: 'Banka ödeme emri nasıl gönderilir?',
          answer: 'Banka Ödeme Emirleri sayfasında yeni emir oluşturun, gerekli bilgileri doldurun ve "Gönder" butonuna tıklayın.',
          category: 'Banka İşlemleri',
          helpful: 31,
          views: 145,
          lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      const mockResources: Resource[] = [
        {
          id: '1',
          title: 'Yardım Yönetimi Kullanıcı Kılavuzu',
          description: 'Modülün tüm özelliklerini detaylı olarak açıklayan kapsamlı kullanıcı kılavuzu',
          type: 'document',
          url: '#',
          downloadUrl: '#',
          category: 'Dokümantasyon',
          size: '2.5 MB',
          lastUpdated: new Date().toISOString(),
          downloads: 156
        },
        {
          id: '2',
          title: 'Hızlı Başlangıç Videosu',
          description: 'Modülün temel özelliklerini gösteren 10 dakikalık tanıtım videosu',
          type: 'video',
          url: '#',
          category: 'Eğitim',
          duration: '10:30',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          downloads: 89
        },
        {
          id: '3',
          title: 'Başvuru Formu Şablonu',
          description: 'Yardım başvuruları için kullanılabilecek standart form şablonu',
          type: 'template',
          url: '#',
          downloadUrl: '#',
          category: 'Şablonlar',
          size: '125 KB',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 234
        },
        {
          id: '4',
          title: 'API Dokümantasyonu',
          description: 'Yardım yönetimi modülü için REST API referans dokümantasyonu',
          type: 'api',
          url: '#',
          category: 'Geliştirici',
          lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 67
        },
        {
          id: '5',
          title: 'İleri Seviye Eğitim Serisi',
          description: 'Modülün gelişmiş özelliklerini kapsayan 5 bölümlük video eğitim serisi',
          type: 'tutorial',
          url: '#',
          category: 'Eğitim',
          duration: '45:00',
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          downloads: 123
        }
      ]

      setGuides(mockGuides)
      setFaqs(mockFAQs)
      setResources(mockResources)
      setStats({
        totalGuides: mockGuides.length,
        totalFAQs: mockFAQs.length,
        totalResources: mockResources.length,
        totalViews: mockGuides.reduce((sum, guide) => sum + guide.views, 0),
        averageRating: mockGuides.reduce((sum, guide) => sum + guide.rating, 0) / mockGuides.length,
        helpfulVotes: mockGuides.reduce((sum, guide) => sum + guide.helpful, 0)
      })
    } catch (error) {
      log.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = searchQuery === '' || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || guide.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || guide.difficulty === difficultyFilter

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || resource.type === typeFilter

    return matchesSearch && matchesType
  })

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyInfo = difficulties.find(d => d.value === difficulty)
    return (
      <span className={`text-xs font-medium ${difficultyInfo?.color || 'text-gray-600'}`}>
        {difficultyInfo?.label || difficulty}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    const categoryInfo = categories.find(c => c.value === category)
    const Icon = categoryInfo?.icon || Info
    return <Icon className="h-4 w-4" />
  }

  const getResourceTypeIcon = (type: string) => {
    const typeInfo = resourceTypes.find(t => t.value === type)
    const Icon = typeInfo?.icon || FileText
    return <Icon className="h-4 w-4" />
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const renderStepContent = (step: GuideStep) => {
    switch (step.type) {
      case 'warning':
        return (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">{step.content}</div>
          </div>
        )
      case 'tip':
        return (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">{step.content}</div>
          </div>
        )
      case 'code':
        return (
          <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
            <pre>{step.code || step.content}</pre>
          </div>
        )
      default:
        return <div className="text-sm text-gray-700">{step.content}</div>
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">Modül Bilgilendirme</h1>
          <p className="text-muted-foreground dark:text-gray-400">Yardım yönetimi modülü hakkında rehberler, SSS ve kaynaklar</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            <ExternalLink className="h-4 w-4" />
            Destek Merkezi
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.totalGuides}</div>
              <div className="text-sm text-blue-700">Toplam Rehber</div>
            </div>
          </div>
        </div>
        <div className="bg-green-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-green-700" />
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.totalFAQs}</div>
              <div className="text-sm text-green-700">Sık Sorulan Sorular</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-purple-700" />
            <div>
              <div className="text-2xl font-bold text-purple-900">{stats.totalResources}</div>
              <div className="text-sm text-purple-700">Kaynaklar</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-100 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-yellow-700" />
            <div>
              <div className="text-2xl font-bold text-yellow-900">{stats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-yellow-700">Ortalama Puan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Play className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Hızlı Başlangıç</h3>
          </div>
          <p className="text-blue-100 mb-4">Modülü kullanmaya hemen başlayın</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50">
            Başla
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Video className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Video Eğitimler</h3>
          </div>
          <p className="text-green-100 mb-4">Görsel eğitimlerle öğrenin</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded text-sm font-medium hover:bg-green-50">
            İzle
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Canlı Destek</h3>
          </div>
          <p className="text-purple-100 mb-4">Uzmanlarımızdan yardım alın</p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded text-sm font-medium hover:bg-purple-50">
            İletişim
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('guides')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guides'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Rehberler ({filteredGuides.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faqs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              SSS ({filteredFAQs.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Kaynaklar ({filteredResources.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-64 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
          />
        </div>
        
        {activeTab === 'guides' && (
          <>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 text-sm"
            >
              <option value="all">Tüm Seviyeler</option>
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>{difficulty.label}</option>
              ))}
            </select>
          </>
        )}

        {activeTab === 'resources' && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="all">Tüm Tipler</option>
            {resourceTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* İçerik */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="rounded-lg border">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(guide.category)}
                    {expandedGuide === guide.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{guide.title}</h3>
                      {getDifficultyBadge(guide.difficulty)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {guide.estimatedTime} dk
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {guide.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {guide.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {guide.helpful}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {guide.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedGuide === guide.id && (
                <div className="border-t p-4">
                  <div className="space-y-4">
                    {guide.steps.map((step, index) => (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{step.title}</h4>
                          {renderStepContent(step)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      {guide.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                        <ThumbsUp className="h-4 w-4" />
                        Faydalı
                      </button>
                      <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700">
                        <MessageSquare className="h-4 w-4" />
                        Yorum
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {filteredFAQs.map(faq => (
            <div key={faq.id} className="rounded-lg border">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    {expandedFAQ === faq.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{faq.category}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {faq.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {faq.helpful}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedFAQ === faq.id && (
                <div className="border-t p-4">
                  <div className="text-sm text-gray-700 mb-4">{faq.answer}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Son güncelleme: {formatDateTime(faq.lastUpdated)}</span>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                        <ThumbsUp className="h-3 w-3" />
                        Faydalı
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map(resource => (
            <div key={resource.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-gray-100 rounded">
                  {getResourceTypeIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{resource.category}</span>
                    {resource.size && <span>{resource.size}</span>}
                    {resource.duration && <span>{resource.duration}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <div>Son güncelleme: {formatDateTime(resource.lastUpdated)}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Download className="h-3 w-3" />
                    {resource.downloads} indirme
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <Eye className="h-4 w-4" />
                    Görüntüle
                  </button>
                  {resource.downloadUrl && (
                    <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700">
                      <Download className="h-4 w-4" />
                      İndir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* İletişim Bilgileri */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Yardıma mı ihtiyacınız var?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">E-posta Desteği</div>
              <div className="text-sm text-muted-foreground">destek@example.com</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium">Telefon Desteği</div>
              <div className="text-sm text-muted-foreground">0850 123 45 67</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium">Online Destek</div>
              <div className="text-sm text-muted-foreground">7/24 Canlı Destek</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
