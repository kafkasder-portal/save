# 🚀 Production Deployment Rehberi - Veri Güvenliği Odaklı

## 📋 Genel Bakış

Bu rehber, dernek yönetim panelinin production ortamında güvenli bir şekilde çalışması için gerekli tüm adımları içerir. Veri kaybını önlemek ve sistem sürekliliğini sağlamak ana hedeflerdir.

## 🏗️ 1. Veritabanı Güvenliği

### 1.1 Supabase Production Kurulumu

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Production projesi oluşturma
supabase projects create dernek-panel-prod --org-id YOUR_ORG_ID

# Production ortamına bağlanma
supabase link --project-ref YOUR_PROJECT_REF
```

### 1.2 Veritabanı Yedekleme Stratejisi

```sql
-- Otomatik yedekleme için PostgreSQL fonksiyonu
CREATE OR REPLACE FUNCTION create_daily_backup()
RETURNS void AS $$
BEGIN
  -- Günlük tam yedekleme
  PERFORM pg_dump(
    'postgresql://user:pass@host:5432/dbname',
    '--format=custom',
    '--file=/backups/daily_backup_' || to_char(current_date, 'YYYY_MM_DD') || '.dump'
  );
END;
$$ LANGUAGE plpgsql;

-- Cron job ile otomatik yedekleme
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT create_daily_backup();');
```

### 1.3 RLS (Row Level Security) Politikaları

```sql
-- Kullanıcı bazlı veri erişimi
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

-- Rol bazlı erişim kontrolü
CREATE POLICY "Admin access to all data" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );
```

## 🔐 2. Güvenlik Konfigürasyonu

### 2.1 Environment Variables

```bash
# .env.production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
SENTRY_DSN=your-sentry-dsn
```

### 2.2 SSL/TLS Konfigürasyonu

```javascript
// api/server.ts
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  ca: fs.readFileSync('/path/to/ca-bundle.pem')
};

const server = https.createServer(options, app);
```

### 2.3 Rate Limiting

```javascript
// api/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Giriş denemesi sınırı
  message: 'Too many login attempts',
});
```

## 🚀 3. Deployment Stratejisi

### 3.1 Docker Containerization

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dernek-panel
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dernek-panel
  template:
    metadata:
      labels:
        app: dernek-panel
    spec:
      containers:
      - name: dernek-panel
        image: dernek-panel:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 3.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run test
    - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 📊 4. Monitoring ve Logging

### 4.1 Sentry Error Tracking

```javascript
// src/lib/errorTracking.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});
```

### 4.2 Application Performance Monitoring

```javascript
// src/hooks/usePerformance.ts
import { useEffect } from 'react';

export const usePerformance = () => {
  useEffect(() => {
    // Core Web Vitals monitoring
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);
};
```

## 🔄 5. Backup ve Recovery

### 5.1 Otomatik Backup Script

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="dernek_panel"

# Veritabanı yedekleme
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Dosya yedekleme
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /app/uploads

# Eski yedekleri temizleme (30 günden eski)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Cloud storage'a yedekleme
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/
```

### 5.2 Disaster Recovery Plan

```markdown
## Disaster Recovery Checklist

### Veritabanı Kurtarma
1. En son yedeği kontrol et
2. Yeni veritabanı instance'ı oluştur
3. Yedeği geri yükle
4. Bağlantıları test et

### Uygulama Kurtarma
1. Code repository'den en son versiyonu çek
2. Environment variables'ları ayarla
3. Uygulamayı deploy et
4. Health check'leri çalıştır

### Veri Doğrulama
1. Kritik verilerin bütünlüğünü kontrol et
2. Kullanıcı hesaplarını doğrula
3. İş süreçlerini test et
```

## 🛡️ 6. Güvenlik Önlemleri

### 6.1 Input Validation

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(100),
});

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};
```

### 6.2 SQL Injection Koruması

```typescript
// api/routes/users.ts
import { sql } from '@supabase/supabase-js';

// Güvenli sorgu
const getUser = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};
```

## 📈 7. Performance Optimizasyonu

### 7.1 Database Indexing

```sql
-- Performans için gerekli indexler
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Composite indexler
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_meetings_user_date ON meetings(user_id, meeting_date);
```

### 7.2 Caching Strategy

```typescript
// src/hooks/useApi.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useApi = <T>(key: string, fetcher: () => Promise<T>) => {
  return useQuery({
    queryKey: [key],
    queryFn: fetcher,
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000, // 10 dakika
  });
};
```

## 🔧 8. Maintenance ve Updates

### 8.1 Otomatik Güncelleme Script

```bash
#!/bin/bash
# scripts/update.sh

echo "Starting system update..."

# Yedekleme
./scripts/backup.sh

# Code güncelleme
git pull origin main

# Dependencies güncelleme
npm ci

# Build
npm run build

# Database migration
npm run db:migrate

# Restart services
pm2 restart all

echo "Update completed successfully!"
```

### 8.2 Health Check Endpoint

```typescript
// api/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Database bağlantısını kontrol et
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      return res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

## 📋 9. Deployment Checklist

- [ ] Environment variables ayarlandı
- [ ] SSL sertifikaları yüklendi
- [ ] Database backup sistemi kuruldu
- [ ] Monitoring araçları aktif
- [ ] Security headers konfigüre edildi
- [ ] Rate limiting aktif
- [ ] Error tracking kuruldu
- [ ] Performance monitoring aktif
- [ ] Disaster recovery plan hazır
- [ ] Documentation güncel
- [ ] Team training tamamlandı

## 🚨 10. Emergency Contacts

- **System Admin**: admin@dernek.org
- **Database Admin**: db-admin@dernek.org
- **Security Team**: security@dernek.org
- **Emergency Hotline**: +90 XXX XXX XX XX

---

Bu rehber, sisteminizin production ortamında güvenli ve sürdürülebilir bir şekilde çalışmasını sağlayacaktır. Düzenli olarak güncellenmeli ve test edilmelidir.
