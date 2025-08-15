# 🚀 Vercel + Supabase Production Deployment Rehberi

Bu rehber, Dernek Yönetim Panelini Vercel (frontend) ve Supabase (backend) ile production ortamında deploy etmek için gerekli tüm adımları içerir.

## 📋 Avantajlar

### ✅ Vercel Avantajları
- **Otomatik SSL/TLS** sertifikaları
- **Global CDN** ile hızlı erişim
- **Otomatik deployment** (Git push ile)
- **Preview deployments** (PR'lar için)
- **Edge Functions** desteği
- **Analytics** ve **Performance monitoring**
- **DDoS koruması**

### ✅ Supabase Avantajları
- **PostgreSQL** veritabanı
- **Real-time** subscriptions
- **Row Level Security (RLS)**
- **Otomatik backup** ve **point-in-time recovery**
- **Built-in authentication**
- **Storage** (dosya yükleme)
- **Edge Functions**
- **Database branching**

## 🛠️ Kurulum Adımları

### 1. Supabase Projesi Oluşturma

#### 1.1 Supabase Dashboard'da Proje Oluşturma

```bash
# 1. https://supabase.com adresine gidin
# 2. "New Project" butonuna tıklayın
# 3. Proje detaylarını doldurun:
#    - Name: dernek-panel-prod
#    - Database Password: güçlü bir şifre oluşturun
#    - Region: en yakın bölgeyi seçin (örn: West Europe)
# 4. "Create new project" butonuna tıklayın
```

#### 1.2 Environment Variables'ları Alma

```bash
# Supabase Dashboard > Settings > API
# Aşağıdaki bilgileri not edin:

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 1.3 Database Schema'ları Deploy Etme

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Projeye bağlanma
supabase link --project-ref your-project-ref

# Migration'ları deploy etme
supabase db push

# Seed data'yı yükleme (opsiyonel)
supabase db reset --seed
```

### 2. Vercel Projesi Oluşturma

#### 2.1 Vercel CLI Kurulumu

```bash
# Vercel CLI kurulumu
npm install -g vercel

# Vercel'e giriş yapma
vercel login
```

#### 2.2 Proje Konfigürasyonu

```bash
# Proje dizininde
vercel

# Sorulara cevap verin:
# - Set up and deploy: Yes
# - Which scope: [Your account]
# - Link to existing project: No
# - Project name: dernek-panel
# - Directory: ./
# - Override settings: No
```

#### 2.3 Environment Variables'ları Ayarlama

```bash
# Vercel Dashboard'da veya CLI ile
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SENTRY_DSN
vercel env add VITE_ENABLE_ANALYTICS
```

### 3. Proje Konfigürasyonu

#### 3.1 Vite Konfigürasyonu

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', '@radix-ui/react-*']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

#### 3.2 Vercel Konfigürasyonu

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 3.3 Supabase Client Konfigürasyonu

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
})

// Production'da debug'ı kapat
if (import.meta.env.PROD) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Cleanup işlemleri
    }
  })
}
```

### 4. Database Güvenliği

#### 4.1 Row Level Security (RLS) Politikaları

```sql
-- Users tablosu için RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi verilerini görebilir
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Adminler tüm verileri görebilir
CREATE POLICY "Admins can view all data" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Meetings tablosu için RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meetings" ON meetings
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- Tasks tablosu için RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks" ON tasks
    FOR ALL USING (auth.uid() = assigned_to);
```

#### 4.2 Backup Stratejisi

```sql
-- Supabase otomatik backup sağlar, ancak ek güvenlik için:

-- Fonksiyon oluşturma
CREATE OR REPLACE FUNCTION export_data_to_json()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'users', (SELECT json_agg(u) FROM users u),
        'meetings', (SELECT json_agg(m) FROM meetings m),
        'tasks', (SELECT json_agg(t) FROM tasks t),
        'exported_at', now()
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job ile otomatik export (Supabase Edge Functions kullanarak)
```

### 5. Vercel Edge Functions

#### 5.1 API Route Oluşturma

```typescript
// api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Database bağlantısını kontrol et
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      return res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      })
    }

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
```

#### 5.2 Authentication Middleware

```typescript
// api/middleware/auth.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export async function authenticateUser(
  req: VercelRequest,
  res: VercelResponse
) {
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' })
  }

  const token = authHeader.replace('Bearer ', '')
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  return user
}
```

### 6. Deployment Pipeline

#### 6.1 GitHub Actions ile Otomatik Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy-preview:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel (Preview)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
    
    - name: Run database migrations
      run: |
        npx supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    
    - name: Notify deployment
      run: |
        curl -X POST -H 'Content-type: application/json' \
          --data "{\"text\":\"✅ Production deployment completed!\"}" \
          ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 7. Monitoring ve Analytics

#### 7.1 Vercel Analytics

```typescript
// src/main.tsx
import { injectSpeedInsights } from '@vercel/speed-insights'
import { inject } from '@vercel/analytics'

// Analytics ve Performance monitoring
inject()
injectSpeedInsights()
```

#### 7.2 Sentry Error Tracking

```typescript
// src/lib/errorTracking.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'your-domain.vercel.app']
    }),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

### 8. Environment Variables

#### 8.1 Vercel Environment Variables

```bash
# Vercel Dashboard > Project Settings > Environment Variables

# Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ENABLE_ANALYTICS=true
VITE_APP_URL=https://your-domain.vercel.app

# Preview (Development)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ENABLE_ANALYTICS=false
VITE_APP_URL=https://your-preview-url.vercel.app
```

#### 8.2 Supabase Environment Variables

```bash
# Supabase Dashboard > Settings > API

# Public (Client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Private (Server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 9. Güvenlik Kontrol Listesi

- [ ] **Supabase RLS** politikaları aktif
- [ ] **Environment variables** güvenli
- [ ] **CORS** ayarları doğru
- [ ] **Rate limiting** aktif
- [ ] **SSL/TLS** sertifikaları geçerli
- [ ] **Backup** stratejisi hazır
- [ ] **Monitoring** aktif
- [ ] **Error tracking** kurulu
- [ ] **Analytics** aktif
- [ ] **Security headers** ayarlı

### 10. Yönetim Komutları

```bash
# Vercel deployment
vercel                    # Preview deployment
vercel --prod            # Production deployment

# Supabase management
supabase db push         # Database migration
supabase db reset        # Database reset
supabase functions deploy # Edge functions deploy

# Monitoring
vercel logs              # Vercel logs
supabase logs            # Supabase logs
```

### 11. Cost Optimization

#### 11.1 Vercel Optimizasyonu
- **Hobby Plan**: $0/ay (100GB bandwidth)
- **Pro Plan**: $20/ay (1TB bandwidth)
- **Enterprise Plan**: Custom pricing

#### 11.2 Supabase Optimizasyonu
- **Free Tier**: $0/ay (500MB database, 2GB bandwidth)
- **Pro Plan**: $25/ay (8GB database, 250GB bandwidth)
- **Team Plan**: $599/ay (100GB database, 2TB bandwidth)

### 12. Performance Optimizasyonu

```typescript
// src/hooks/useOptimizedQuery.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useOptimizedQuery<T>(
  key: string,
  query: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(query)
        .select('*')
        .limit(100) // Pagination için limit
      
      if (error) throw error
      return data as T
    },
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    cacheTime: 10 * 60 * 1000, // 10 dakika cache
    ...options
  })
}
```

## 🎉 Sonuç

Vercel + Supabase kombinasyonu ile:

✅ **Sıfır sunucu yönetimi**  
✅ **Otomatik SSL/TLS**  
✅ **Global CDN**  
✅ **Otomatik backup**  
✅ **Real-time capabilities**  
✅ **Built-in authentication**  
✅ **Edge functions**  
✅ **Excellent developer experience**  

Bu setup ile production ortamınız enterprise-grade güvenlik ve performans ile çalışacak! 🚀
