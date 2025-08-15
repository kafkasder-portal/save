# GitHub Actions + Vercel Setup Kılavuzu

Bu kılavuz GitHub Actions workflow'unu Vercel ile entegre etmek için gerekli tüm adımları içerir.

## 📋 Gerekli Secrets

GitHub repository'nizde aşağıdaki secrets'ları ayarlamanız gerekir:

### 🔐 Repository Secrets

GitHub repo > Settings > Secrets and variables > Actions > New repository secret

| Secret Name | Açıklama | Nereden Alınır |
|-------------|----------|----------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Settings](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel CLI: `vercel link` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel CLI: `vercel link` |
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | [Supabase Dashboard](https://app.supabase.com) |
| `VITE_SUPABASE_URL_PROD` | Production Supabase URL | Production Supabase project |
| `VITE_SUPABASE_ANON_KEY_PROD` | Production Supabase anon key | Production Supabase project |
| `VITE_SENTRY_DSN` | Sentry DSN (optional) | [Sentry Dashboard](https://sentry.io) |

## 🚀 Kurulum Adımları

### 1. Vercel CLI Setup

```bash
# Vercel CLI kurulum
npm install -g vercel

# Login
vercel login

# Project'i link et
vercel link
```

`vercel link` komutundan sonra `.vercel/project.json` dosyası oluşur:

```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

### 2. GitHub Secrets Ekleme

#### Vercel Token Alma
1. [Vercel Account Settings](https://vercel.com/account/tokens)
2. "Create Token" tıklayın
3. Token'ı `VERCEL_TOKEN` olarak GitHub'a ekleyin

#### Vercel IDs Alma
```bash
# Project link edildikten sonra
cat .vercel/project.json
```

Bu değerleri GitHub secrets'a ekleyin:
- `VERCEL_ORG_ID`: orgId değeri
- `VERCEL_PROJECT_ID`: projectId değeri

#### Supabase Keys
1. [Supabase Dashboard](https://app.supabase.com)
2. Project Settings > API
3. URL ve anon key'i GitHub secrets'a ekleyin

### 3. Environment Variables Script

Otomatik environment variable setup için:

```bash
# Script'i çalıştırılabilir yap
chmod +x scripts/setup-vercel-env.sh

# Environment variables'ları ekle
./scripts/setup-vercel-env.sh
```

## 🔄 Workflow Açıklaması

### Workflow Tetikleyicileri

```yaml
on:
  push:
    branches: [ main, develop ]  # Production ve staging deployments
  pull_request:
    branches: [ main ]           # Preview deployments
```

### Jobs Overview

#### 1. **Test Job**
- TypeScript type checking
- ESLint linting
- Unit testleri
- Coverage reporting

#### 2. **Build Job**
- Project build
- Bundle analysis
- Performance budget check
- Build artifact upload

#### 3. **Deploy Preview** (PR'larda)
- Vercel preview deployment
- PR'a comment ile deploy URL
- Preview environment variables

#### 4. **Deploy Production** (main branch)
- Production deployment
- Health checks
- GitHub release oluşturma
- Production environment variables

#### 5. **Lighthouse** (PR'larda)
- Performance audit
- Accessibility check
- Best practices validation

#### 6. **Security Scan**
- Dependency vulnerability check
- Security audit
- Unused dependency detection

## 📊 Performance Budget

Workflow otomatik olarak bundle size kontrolü yapar:

```bash
# Maximum bundle size: 5MB
MAX_SIZE=5242880

if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
  echo "❌ Bundle size exceeds limit"
  exit 1
fi
```

## 🎯 Lighthouse Audits

Performance thresholds:

| Metric | Threshold | Level |
|--------|-----------|-------|
| Performance | ≥ 80% | Warning |
| Accessibility | ≥ 90% | Error |
| Best Practices | ≥ 85% | Warning |
| SEO | ≥ 80% | Warning |
| FCP | ≤ 2s | Warning |
| LCP | ≤ 3s | Warning |
| CLS | ≤ 0.1 | Error |

## 🔧 Troubleshooting

### Common Issues

#### 1. Vercel Token Error
```
Error: No team specified and no default team found
```

**Çözüm:**
```bash
vercel teams list
vercel switch [team-name]
vercel link
```

#### 2. Environment Variables Missing
```
Build failed: VITE_SUPABASE_URL is not defined
```

**Çözüm:**
1. Vercel dashboard'da environment variables kontrolü
2. GitHub secrets kontrolü
3. `setup-vercel-env.sh` script'ini tekrar çalıştır

#### 3. Build Timeout
```
Error: Build exceeded maximum duration
```

**Çözüm:**
1. `vercel.json`'da `maxDuration` artır
2. Build performance optimizasyonu
3. Dependency cleanup

#### 4. Test Failures
```
Tests failed in CI but pass locally
```

**Çözüm:**
1. Node.js version uyumluluğu
2. Environment variables eksikliği
3. Timezone farkları
4. Test isolation sorunları

### Debug Commands

```bash
# Local Vercel build test
vercel build

# GitHub Actions locally test (act CLI)
act -j test

# Bundle size analizi
npm run analyze:bundle

# Performance local test
npm run performance:analyze
```

## 🔄 Deployment Flow

### Development Workflow

```mermaid
graph LR
    A[Feature Branch] --> B[Create PR]
    B --> C[GitHub Actions]
    C --> D[Tests & Build]
    D --> E[Preview Deploy]
    E --> F[Lighthouse Audit]
    F --> G[Code Review]
    G --> H[Merge to Main]
    H --> I[Production Deploy]
```

### Branch Strategy

- **`main`**: Production branch - auto-deploy to production
- **`develop`**: Staging branch - auto-deploy to staging
- **`feature/*`**: Feature branches - preview deployments on PR

### Environment Mapping

| Branch | Environment | URL Pattern |
|--------|-------------|-------------|
| `main` | Production | `your-app.vercel.app` |
| `develop` | Staging | `your-app-git-develop.vercel.app` |
| PR branches | Preview | `your-app-git-feature-pr-123.vercel.app` |

## 📝 Best Practices

### 1. Environment Variables
- Production ve staging için ayrı Supabase projeleri
- Sensitive data'yı GitHub secrets'ta saklayın
- Environment-specific configuration

### 2. Testing Strategy
- Unit testleri her PR'da çalışır
- E2E testleri production deploy öncesi
- Performance regression tests

### 3. Security
- Dependency security scans
- Secret rotation
- Access control

### 4. Monitoring
- Deploy notifications
- Error tracking integration
- Performance monitoring

## 🚨 Emergency Procedures

### Rollback Process

```bash
# Vercel rollback
vercel rollback [deployment-url]

# GitHub revert
git revert [commit-hash]
git push origin main
```

### Hotfix Process

```bash
# Hotfix branch
git checkout -b hotfix/critical-fix main
# Make fixes
git commit -m "hotfix: critical issue"
git push origin hotfix/critical-fix
# Create PR to main for immediate deployment
```

## 📞 Support

### Monitoring Links
- **GitHub Actions**: `https://github.com/[repo]/actions`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Lighthouse Reports**: Auto-generated in PR comments

### Debugging Resources
- GitHub Actions logs
- Vercel function logs
- Browser DevTools
- Lighthouse CI reports

---

**Note**: Bu workflow production-ready bir CI/CD pipeline'ı sağlar. Tüm adımları takip ederek güvenli ve otomatik deployment sürecine sahip olabilirsiniz.
