# Deployment Kılavuzu

Bu kılavuz Dernek Yönetim Paneli'nin production ortamına deploy edilmesi için gerekli tüm adımları içerir.

## 📋 İçindekiler

- [Ön Gereksinimler](#ön-gereksinimler)
- [Environment Konfigürasyonu](#environment-konfigürasyonu)
- [Database Setup](#database-setup)
- [Vercel Deployment](#vercel-deployment)
- [Alternative Deployments](#alternative-deployments)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## 🔧 Ön Gereksinimler

### Gerekli Hesaplar
- [Supabase](https://supabase.com) account
- [Vercel](https://vercel.com) account (önerilen)
- [Sentry](https://sentry.io) account (optional - error tracking)

### Local Development Setup
```bash
# Node.js 22.x kurulu olmalı
node --version

# Project'i klonla
git clone [repository-url]
cd dernek-panel-ui

# Dependencies install
npm install
```

## 🌍 Environment Konfigürasyonu

### Production Environment Variables

`.env.production` dosyası oluşturun:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# API Configuration
VITE_API_BASE_URL=/api
NODE_ENV=production

# Security
VITE_APP_URL=https://your-domain.com
SESSION_SECRET=your_session_secret_key

# Performance & Monitoring
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_SENTRY_DSN=https://your-sentry-dsn

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Optional: External Services
VITE_WHATSAPP_API_URL=your_whatsapp_api_url
VITE_SMS_API_KEY=your_sms_api_key
VITE_EMAIL_SERVICE_API_KEY=your_email_service_api_key
```

### Environment Variable Açıklamaları

| Variable | Açıklama | Gerekli |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend için service role key | ✅ |
| `VITE_API_BASE_URL` | API base URL (/api for same domain) | ✅ |
| `VITE_APP_URL` | Frontend app URL | ✅ |
| `SESSION_SECRET` | JWT session secret | ✅ |
| `VITE_SENTRY_DSN` | Error tracking | ❌ |
| `VITE_ENABLE_PERFORMANCE_MONITORING` | Performance tracking | ❌ |

## 🗄️ Database Setup

### 1. Supabase Project Oluşturma

1. [Supabase Dashboard](https://app.supabase.com)
2. "New Project" tıklayın
3. Organization ve project adını seçin
4. Database password belirleyin
5. Region seçin (en yakın)

### 2. Database Schema Setup

#### Option A: Supabase CLI ile (Önerilen)
```bash
# Supabase CLI install
npm install -g supabase

# Project'e login
supabase login

# Local project'i remote ile link et
supabase link --project-ref your-project-ref

# Migrations'ları uygula
supabase db push
```

#### Option B: Manuel SQL
1. Supabase Dashboard > SQL Editor
2. `supabase/migrations/` klasöründeki dosyaları sırayla çalıştır:
   - `20241201000001_initial_setup.sql`
   - `20241201000002_rls_policies.sql`
   - `20241201000003_storage_setup.sql`
   - `20241201000004_seed_data.sql`
   - `20241201000005_error_logging.sql`
   - `20241201000006_notifications_system.sql`

### 3. Authentication Setup

```sql
-- Auth ayarları (Supabase Dashboard > Authentication > Settings)
-- Site URL: https://your-domain.com
-- Redirect URLs: https://your-domain.com/auth/callback

-- Additional allowed URLs:
-- https://your-domain.com
-- https://your-domain.com/login
-- https://your-domain.com/dashboard
```

### 4. Storage Setup

```sql
-- Storage bucket'ları oluştur
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('reports', 'reports', false);
```

### 5. Row Level Security Policies

RLS policies otomatik olarak migration'larla uygulanır. Manuel kontrol için:

```sql
-- Tüm tabloları listele
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public';

-- RLS status kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🚀 Vercel Deployment

### 1. Vercel CLI Setup
```bash
# Vercel CLI install
npm install -g vercel

# Login
vercel login
```

### 2. Project Configuration

`vercel.json` dosyası (mevcut):
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@latest"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/((?!api).*)",
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
        }
      ]
    }
  ]
}
```

### 3. Deploy Steps

```bash
# Initial deployment
vercel

# Production deployment
vercel --prod

# Environment variables set etme
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# ... diğer env variables
```

### 4. Domain Setup

1. Vercel Dashboard > Project > Settings > Domains
2. Custom domain ekle
3. DNS records konfigüre et:
   ```
   Type: CNAME
   Name: your-subdomain (or @)
   Value: cname.vercel-dns.com
   ```

### 5. Environment Variables

Vercel Dashboard'da environment variables set etme:
1. Project Settings > Environment Variables
2. Tüm production variables'ları ekle
3. Deploy et

## 🔄 Alternative Deployments

### Netlify Deployment

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "22"
```

### AWS Amplify

```yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
backend:
  phases:
    preBuild:
      commands:
        - cd api && npm install
    build:
      commands:
        - cd api && npm run build
```

### Docker Deployment

`Dockerfile`:
```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
```

`docker-compose.yml`:
```yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

## ✅ Post-Deployment

### 1. Health Check

```bash
# Endpoint'leri test et
curl -I https://your-domain.com
curl -I https://your-domain.com/api/health

# Performance test
npm run performance:analyze
```

### 2. Initial Admin User

Supabase Dashboard > Authentication > Users > Invite user:
```
Email: admin@your-organization.com
```

Sonra database'de role'ü güncelle:
```sql
UPDATE user_profiles 
SET role = 'super_admin' 
WHERE email = 'admin@your-organization.com';
```

### 3. Seed Data (Optional)

Production için sample data:
```sql
-- Sample organization data
INSERT INTO organizations (name, description) 
VALUES ('Sample NGO', 'Sample organization for testing');

-- Sample funding categories
INSERT INTO funding_categories (name, description) 
VALUES 
  ('Emergency Aid', 'Emergency humanitarian assistance'),
  ('Education', 'Educational support programs'),
  ('Healthcare', 'Medical assistance programs');
```

### 4. SSL Certificate

Vercel otomatik olarak SSL sağlar. Custom domain için:
1. Domain verification
2. Automatic SSL certificate
3. HTTPS redirect

### 5. Performance Optimization

```bash
# Build size check
npm run analyze:bundle

# Performance report
npm run performance:report
```

## 📊 Monitoring & Maintenance

### 1. Performance Monitoring

**Built-in Performance Dashboard:**
- URL: `https://your-domain.com/system/performance`
- Admin role gerekli
- Real-time metrics

**Metrics Collected:**
- Core Web Vitals
- API response times
- Memory usage
- Error rates

### 2. Error Tracking

**Sentry Integration:**
```typescript
// Otomatik error tracking aktif
// Manual error logging:
import * as Sentry from '@sentry/react'

Sentry.captureException(new Error('Custom error'))
```

**Error Dashboard:**
- Sentry Dashboard
- Built-in error logs: `/system/errors` (admin only)

### 3. Database Monitoring

**Supabase Dashboard:**
- Database size
- Connection count
- Query performance
- Storage usage

**Alerts Setup:**
```sql
-- Database size monitoring
SELECT 
  schemaname,
  tablename,
  pg_total_relation_size(schemaname||'.'||tablename) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size DESC;
```

### 4. Backup Strategy

**Automated Backups:**
- Supabase otomatik backup (7 gün)
- Manual backup script:

```bash
# Database backup
pg_dump -h your-db-host -U postgres -d postgres > backup.sql

# Restore
psql -h your-db-host -U postgres -d postgres < backup.sql
```

### 5. Update Strategy

**Regular Updates:**
```bash
# Dependencies check
npm outdated

# Security audit
npm audit

# Update dependencies
npm update

# Test ve deploy
npm test && npm run build && vercel --prod
```

**Database Migrations:**
```bash
# New migration
supabase db diff --file=new_feature

# Apply to production
supabase db push
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Memory issues
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Database Connection Issues
```bash
# Check connection
npx supabase status

# Reset connection
npx supabase db reset
```

#### Performance Issues
```bash
# Bundle analysis
npm run analyze:bundle

# Performance check
npm run performance:analyze
```

### Logs & Debugging

**Vercel Logs:**
```bash
vercel logs your-project-name
```

**Supabase Logs:**
- Dashboard > Logs
- Database, Auth, Storage logs

**Browser DevTools:**
- Performance tab
- Network tab
- Console errors

## 📞 Support

### Emergency Contacts
- **Technical Issues**: [Your technical contact]
- **Deployment Issues**: [Your deployment contact]
- **Database Issues**: [Your database contact]

### Resources
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project Docs**: `/docs` klasörü

---

**Important**: Bu deployment kılavuzu production ortamı için kritik güvenlik ve performans ayarlarını içerir. Adımları dikkatli takip edin ve test edin.
