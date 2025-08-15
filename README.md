# Dernek Yönetim Paneli

Modern, TypeScript tabanlı React uygulaması ile Supabase backend kullanılarak geliştirilmiş kapsamlı dernek/NGO yönetim sistemi.

## 🚀 Özellikler

### ✅ Tamamlanmış Modüller
- **Kimlik Doğrulama**: Supabase Auth ile güvenli giriş/çıkış
- **Kullanıcı Yönetimi**: Rol tabanlı erişim kontrolü (6 farklı rol)
- **Yardım Modülü**: Başvuru, yararlanıcı ve ödeme yönetimi
- **Bağış Modülü**: Nakit, banka ve kredi kartı bağışları
- **Mesajlaşma**: Gerçek zamanlı chat ve bildirimler
- **Toplantı Yönetimi**: Ajanda, katılımcı ve not yönetimi
- **Görev Yönetimi**: Proje görevleri ve takip sistemi
- **Performans İzleme**: Kapsamlı performans metrikleri
- **Error Tracking**: Merkezi hata kayıt sistemi

### 🎯 Teknik Özellikler
- **Real-time**: Supabase Realtime ile canlı güncellemeler
- **Offline Support**: PWA desteği ve cache stratejileri
- **Performance Monitoring**: Web Vitals ve API performans takibi
- **Error Handling**: Kapsamlı hata yönetimi ve logging
- **Testing**: Comprehensive test coverage ile Vitest
- **Type Safety**: Full TypeScript implementation
- **Security**: Row Level Security (RLS) policies

## 📋 Gereksinimler

- **Node.js**: 22.x veya üzeri
- **npm**: 10.x veya üzeri
- **Supabase Account**: Database ve Auth için

## 🛠️ Kurulum

### 1. Repository'yi klonlayın
```bash
git clone [repository-url]
cd dernek-panel-ui
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment değişkenlerini ayarlayın
```bash
cp .env.example .env
```

Gerekli değişkenleri doldurun:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001

# Sentry (Optional)
VITE_SENTRY_DSN=your_sentry_dsn

# Performance Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### 4. Database'i kurun
```bash
# Supabase CLI ile
supabase db reset

# Veya manuel SQL dosyalarını çalıştırın
npm run db:setup
```

### 5. Uygulamayı başlatın
```bash
# Development (frontend + backend)
npm run dev

# Sadece frontend
npm run client:dev

# Sadece backend
npm run server:dev
```

## 📁 Proje Yapısı

```
├── api/                    # Express.js backend
│   ├── routes/            # API route'ları
│   ├── types/             # Backend type definitions
│   └── app.ts            # Express app konfigürasyonu
├── src/                   # React frontend
│   ├── components/        # UI bileşenleri
│   │   ├── ui/           # Temel UI bileşenleri
│   │   ├── performance/  # Performans monitoring bileşenleri
│   │   └── ...
│   ├── pages/            # Sayfa bileşenleri
│   ├── services/         # Business logic servisler
│   ├── store/            # Zustand state management
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility fonksiyonlar
│   └── types/            # TypeScript type definitions
├── supabase/             # Supabase konfigürasyonu
│   ├── migrations/       # Database migration'ları
│   └── config.toml      # Supabase config
├── scripts/              # Build ve utility scriptler
├── reports/              # Performance raporları
└── docs/                 # Dokümantasyon
```

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Test coverage ile
npm run test:coverage

# UI ile interactive test
npm run test:ui

# Sadece belirli dosyalar
npm run test:components
npm run test:hooks
npm run test:utils
```

## 📊 Performans İzleme

### Performance Monitoring
```bash
# Performance raporunu oluştur
npm run performance:analyze

# Bundle analizi
npm run analyze:bundle

# Performance raporunu aç
npm run performance:report
```

### Bundle Analysis
```bash
# Bundle boyutlarını analiz et
npm run analyze

# Build sonrası analiz
npm run analyze:build
```

## 🔧 Development Workflows

### Database İşlemleri
```bash
# Migration oluştur
supabase db diff --file=new_migration

# Migration'ları uygula
supabase db push

# Database'i sıfırla
supabase db reset
```

### Code Quality
```bash
# ESLint kontrolü
npm run lint

# ESLint otomatik düzeltme
npm run lint:fix

# TypeScript kontrolü
npm run type-check
```

## 🏗️ Mimari

### Frontend Teknolojileri
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool ve dev server
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **React Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation

### Backend Teknolojileri
- **Express.js**: API server
- **Supabase**: Database ve Auth
- **PostgreSQL**: Ana database
- **Node.js**: Runtime environment

### DevOps & Monitoring
- **Vitest**: Testing framework
- **Sentry**: Error tracking
- **Custom Performance Service**: Web Vitals tracking
- **PWA**: Offline support

## 🔐 Güvenlik

### Authentication & Authorization
- **Supabase Auth**: JWT tabanlı kimlik doğrulama
- **Role-based Access Control**: 6 farklı kullanıcı rolü
- **Row Level Security**: Database seviyesinde güvenlik

### Kullanıcı Rolleri
1. **Super Admin**: Tam sistem erişimi
2. **Admin**: Yönetimsel işlemler
3. **Manager**: Operasyonel yönetim
4. **Coordinator**: Proje koordinasyonu
5. **Operator**: Operasyonel işlemler
6. **Viewer**: Sadece görüntüleme

### Security Policies
- RLS policies her tablo için aktif
- API endpoint'leri authentication gerektiriyor
- Input validation tüm formlarda
- XSS ve CSRF koruması

## 📈 Performans Optimizasyonları

### Implemented Optimizations
- **Code Splitting**: Route bazlı lazy loading
- **React Query Caching**: Intelligent server state caching
- **Memory Management**: Automatic cleanup ve garbage collection
- **Bundle Optimization**: Tree shaking ve minification
- **Image Optimization**: Progressive loading
- **Service Workers**: Offline caching

### Performance Metrics
- **Core Web Vitals**: FCP, LCP, FID, CLS tracking
- **API Performance**: Response time ve error rate monitoring
- **Memory Usage**: JavaScript heap tracking
- **Bundle Size**: Asset size optimization

## 🚀 Deployment

### Production Build
```bash
# Production build oluştur
npm run build

# Build'i preview et
npm run preview
```

### Environment Setup
Production için `.env.production` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_API_BASE_URL=your_production_api_url
```

### Vercel Deployment
Bu proje Vercel için optimize edilmiştir:
```bash
# Vercel CLI ile deploy
vercel

# Production deployment
vercel --prod
```

## 🐛 Troubleshooting

### Yaygın Sorunlar

#### Database Connection Issues
```bash
# Supabase connection'ı test et
npm run test:db-connection

# Migration sorunları
supabase db reset
```

#### Performance Issues
```bash
# Performance analizi çalıştır
npm run performance:analyze

# Memory leak kontrolü
npm run analyze:memory
```

#### Build Issues
```bash
# Cache'i temizle
npm run clean
npm install

# TypeScript errors
npm run type-check
```

## 📞 Support

### Development Support
- **GitHub Issues**: Bug reports ve feature requests
- **Documentation**: `docs/` klasöründe detaylı dokümantasyon
- **Performance Dashboard**: `/system/performance` sayfasında

### Performance Monitoring
- Real-time performance dashboard
- Automatic error reporting
- Memory usage tracking
- API response time monitoring

## 🤝 Contributing

### Development Guidelines
1. **Type Safety**: Tüm kod TypeScript ile yazılmalı
2. **Testing**: Yeni özellikler test ile birlikte geliştirilmeli
3. **Performance**: Performance impact düşünülmeli
4. **Documentation**: API değişiklikleri dokümante edilmeli

### Pull Request Process
1. Feature branch oluşturun
2. Testleri yazın
3. Performance impact'ini kontrol edin
4. Documentation güncelleyin
5. PR oluşturun

## 📄 License

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Advanced reporting system
- [ ] Multi-language support

### Performance Goals
- [ ] < 2s page load time
- [ ] > 95% uptime
- [ ] < 100ms API response time
- [ ] 100% Core Web Vitals compliance

---

**Geliştirici Notları**: Bu README dosyas�� projenin güncel durumunu yansıtmaktadır. Yeni özellikler eklendiğinde düzenli olarak güncellenmelidir.
