# GitHub Actions Workflow Status

Bu dokümant mevcut GitHub Actions workflow'larının durumunu ve konfigürasyonunu gösterir.

## 🚀 Workflow Badges

[![Deploy to Vercel](https://github.com/your-org/dernek-panel/workflows/Deploy%20to%20Vercel/badge.svg)](https://github.com/your-org/dernek-panel/actions/workflows/deploy.yml)
[![Tests](https://github.com/your-org/dernek-panel/workflows/Deploy%20to%20Vercel/badge.svg?event=push)](https://github.com/your-org/dernek-panel/actions/workflows/deploy.yml)
[![Coverage](https://codecov.io/gh/your-org/dernek-panel/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/dernek-panel)

## 📊 Workflow Overview

### 1. Deploy to Vercel Workflow
**File:** `.github/workflows/deploy.yml`

#### Triggers
- `push` to `main` or `develop` branches
- `pull_request` to `main` branch

#### Jobs
- **Test & Quality Checks** (✅ Required)
- **Build Project** (✅ Required)
- **Deploy Preview** (Pull Requests only)
- **Deploy Production** (Main branch only)
- **Lighthouse Performance Audit** (Pull Requests only)
- **Security Scan** (✅ Required)

### Job Details

#### 🧪 Test Job
```yaml
runs-on: ubuntu-latest
steps:
  - TypeScript Check
  - ESLint Check
  - Unit Tests with Coverage
  - Upload Results
```

#### 🏗️ Build Job
```yaml
runs-on: ubuntu-latest
needs: test
steps:
  - Project Build
  - Bundle Analysis
  - Performance Budget Check
  - Artifact Upload
```

#### 🚀 Deploy Preview
```yaml
runs-on: ubuntu-latest
needs: [test, build]
if: github.event_name == 'pull_request'
steps:
  - Vercel Preview Deploy
  - PR Comment with Deploy URL
```

#### 🌟 Deploy Production
```yaml
runs-on: ubuntu-latest
needs: [test, build]
if: github.ref == 'refs/heads/main'
environment: production
steps:
  - Vercel Production Deploy
  - Health Checks
  - GitHub Release
```

#### 💡 Lighthouse Audit
```yaml
runs-on: ubuntu-latest
needs: deploy-preview
if: github.event_name == 'pull_request'
steps:
  - Performance Audit
  - Accessibility Check
  - Best Practices Check
```

#### 🔒 Security Scan
```yaml
runs-on: ubuntu-latest
needs: test
steps:
  - npm audit
  - Dependency Check
  - Unused Dependencies
```

## 🎯 Performance Budgets

### Bundle Size Limits
- **Maximum Bundle Size:** 5MB (uncompressed)
- **Target Gzipped Size:** < 1MB
- **Performance Budget Check:** Automated in CI

### Lighthouse Thresholds
| Metric | Good | Warning | Error |
|--------|------|---------|-------|
| Performance | ≥ 80% | < 80% | < 60% |
| Accessibility | ≥ 90% | < 90% | < 80% |
| Best Practices | ≥ 85% | < 85% | < 70% |
| SEO | ≥ 80% | < 80% | < 60% |

### Core Web Vitals
| Metric | Good | Warning | Error |
|--------|------|---------|-------|
| FCP | ≤ 2s | ≤ 3s | > 3s |
| LCP | ≤ 3s | ≤ 4s | > 4s |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| TBT | ≤ 300ms | ≤ 600ms | > 600ms |

## 📈 Monitoring & Alerts

### Deployment Monitoring
- **Success Rate:** Target > 95%
- **Deploy Time:** Target < 5 minutes
- **Health Check:** Automated post-deploy

### Test Coverage
- **Minimum Coverage:** 80%
- **Coverage Report:** Uploaded to Codecov
- **Coverage Badge:** Updated automatically

### Security Monitoring
- **Vulnerability Scan:** Every commit
- **Dependency Audit:** Automated
- **Security Alerts:** GitHub Security tab

## 🔧 Workflow Configuration

### Environment Variables

#### Required Secrets
```
VERCEL_TOKEN          # Vercel deployment token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
VITE_SUPABASE_URL     # Supabase project URL
VITE_SUPABASE_ANON_KEY # Supabase anon key
```

#### Optional Secrets
```
VITE_SENTRY_DSN       # Error tracking
LHCI_GITHUB_APP_TOKEN # Lighthouse CI
CODECOV_TOKEN         # Coverage reporting
```

### Workflow Files
```
.github/
├── workflows/
│   └── deploy.yml          # Main deployment workflow
├── ISSUE_TEMPLATE/         # Issue templates
└── PULL_REQUEST_TEMPLATE/  # PR template
```

### Supporting Files
```
lighthouserc.json     # Lighthouse CI configuration
vercel.json           # Vercel deployment configuration
vitest.config.ts      # Test configuration
```

## 📊 Current Status

### Recent Deployments
| Environment | Status | URL | Commit |
|-------------|--------|-----|--------|
| Production | ✅ | https://your-app.vercel.app | `abc1234` |
| Staging | ✅ | https://your-app-git-develop.vercel.app | `def5678` |

### Build History
```
✅ build-456  main    ✅ Tests ✅ Deploy ✅ Health  2 min ago
✅ build-455  develop ✅ Tests ✅ Deploy ✅ Health  1 hour ago
❌ build-454  feature ❌ Tests ❌ Build  ❌ Failed 2 hours ago
✅ build-453  main    ✅ Tests ✅ Deploy ✅ Health  1 day ago
```

### Performance Trends
```
Performance Score: 95/100 ↗️ (+2)
Accessibility:     98/100 ↗️ (+1)
Best Practices:    92/100 →  (0)
SEO:              96/100 ↗️ (+3)
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```
❌ Error: Build failed - TypeScript errors
```
**Solution:** Check TypeScript compilation locally
```bash
npm run type-check
```

#### 2. Test Failures
```
❌ Error: Tests failed - Coverage below threshold
```
**Solution:** Add missing tests or update coverage threshold

#### 3. Deployment Failures
```
❌ Error: Vercel deployment failed
```
**Solution:** 
1. Check Vercel token validity
2. Verify environment variables
3. Check build output

#### 4. Performance Budget Exceeded
```
❌ Error: Bundle size exceeds 5MB limit
```
**Solution:**
1. Run bundle analysis: `npm run analyze:bundle`
2. Remove unused dependencies
3. Implement code splitting

### Debug Commands

```bash
# Local workflow simulation
act -j test

# Build size check
npm run analyze:bundle

# Performance check
npm run lighthouse

# Security audit
npm run security:audit

# Health check
npm run health:check
```

## 📞 Support

### Monitoring Links
- **GitHub Actions:** [View Workflows](https://github.com/your-org/dernek-panel/actions)
- **Vercel Dashboard:** [View Deployments](https://vercel.com/dashboard)
- **Codecov:** [View Coverage](https://codecov.io/gh/your-org/dernek-panel)
- **Lighthouse CI:** [View Reports](https://github.com/your-org/dernek-panel/actions/workflows/deploy.yml)

### Notification Channels
- **GitHub:** Workflow status in PR checks
- **Email:** Failed deployment notifications
- **Slack:** (Configure webhook if needed)

---

**Note:** Bu workflow configuration production-ready bir CI/CD pipeline sağlar. Herhangi bir değişiklik yapmadan önce test ortamında doğrulayın.
