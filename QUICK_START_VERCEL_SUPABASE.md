# ⚡ Vercel + Supabase Hızlı Başlangıç

Bu rehber, Dernek Yönetim Panelini Vercel ve Supabase ile 5 dakikada production'a deploy etmek için gerekli adımları içerir.

## 🚀 5 Dakikada Production Deployment

### 1. Supabase Projesi Oluşturma (2 dakika)

```bash
# 1. https://supabase.com adresine gidin
# 2. "Start your project" butonuna tıklayın
# 3. GitHub ile giriş yapın
# 4. "New Project" butonuna tıklayın
# 5. Proje detaylarını doldurun:
#    - Name: dernek-panel
#    - Database Password: güçlü bir şifre oluşturun
#    - Region: West Europe (Türkiye için en yakın)
# 6. "Create new project" butonuna tıklayın
```

### 2. Environment Variables'ları Alma (1 dakika)

```bash
# Supabase Dashboard > Settings > API
# Aşağıdaki bilgileri kopyalayın:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Vercel'e Deploy Etme (2 dakika)

```bash
# 1. https://vercel.com adresine gidin
# 2. GitHub ile giriş yapın
# 3. "New Project" butonuna tıklayın
# 4. GitHub repository'nizi seçin
# 5. Framework Preset: Vite
# 6. Root Directory: ./
# 7. Environment Variables ekleyin:
#    - VITE_SUPABASE_URL: [Supabase URL'iniz]
#    - VITE_SUPABASE_ANON_KEY: [Supabase Anon Key'iniz]
# 8. "Deploy" butonuna tıklayın
```

## 🎉 Tamamlandı!

Artık uygulamanız production'da çalışıyor! 🚀

**URL**: https://your-project.vercel.app

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: https://vercel.com/dashboard/[project]/analytics
- **Performance**: https://vercel.com/dashboard/[project]/speed-insights
- **Functions**: https://vercel.com/dashboard/[project]/functions

### Supabase Dashboard
- **Database**: https://supabase.com/dashboard/project/[project-ref]/editor
- **Auth**: https://supabase.com/dashboard/project/[project-ref]/auth/users
- **Storage**: https://supabase.com/dashboard/project/[project-ref]/storage/buckets

## 🔧 Geliştirme

### Local Development

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/dernek-panel.git
cd dernek-panel

# Environment variables'ları ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Dependencies'leri yükleyin
npm install

# Development server'ı başlatın
npm run dev
```

### Database Migration

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Projeye bağlanın
supabase link --project-ref your-project-ref

# Migration'ları deploy edin
supabase db push
```

## 🔒 Güvenlik

### Supabase RLS (Row Level Security)

```sql
-- Users tablosu için RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);
```

### Environment Variables

```bash
# Vercel Dashboard > Project Settings > Environment Variables

# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ENABLE_ANALYTICS=true

# Preview (Development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ENABLE_ANALYTICS=false
```

## 📈 Performance

### Vercel Optimizasyonları

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)
```

### Bundle Optimizasyonu

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', '@radix-ui/react-*']
        }
      }
    }
  }
})
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

**1. CORS Hatası**
```bash
# Supabase Dashboard > Settings > API
# Additional allowed origins ekleyin:
https://your-domain.vercel.app
```

**2. Environment Variables Hatası**
```bash
# Vercel Dashboard > Project Settings > Environment Variables
# Tüm environment variables'ların doğru olduğunu kontrol edin
```

**3. Database Bağlantı Hatası**
```bash
# Supabase Dashboard > Settings > Database
# Connection string'i kontrol edin
```

### Log Kontrolü

```bash
# Vercel logs
vercel logs

# Supabase logs
supabase logs
```

## 💰 Maliyet

### Vercel (Hobby Plan)
- **Fiyat**: $0/ay
- **Bandwidth**: 100GB
- **Functions**: 100GB-hours
- **Builds**: 6000 minutes

### Supabase (Free Tier)
- **Fiyat**: $0/ay
- **Database**: 500MB
- **Bandwidth**: 2GB
- **Auth Users**: 50,000
- **Storage**: 1GB

## 🔄 Otomatik Deployment

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 📞 Destek

### Faydalı Linkler
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support

### Community
- **Vercel Discord**: https://discord.gg/vercel
- **Supabase Discord**: https://discord.supabase.com

---

**🎉 Tebrikler!** Artık modern, güvenli ve ölçeklenebilir bir production ortamınız var! 🚀
