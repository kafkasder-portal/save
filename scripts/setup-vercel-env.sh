#!/bin/bash

# Vercel Environment Variables Setup Script
# Bu script Vercel'e environment variables'ları otomatik olarak ekler

set -e

echo "🚀 Setting up Vercel environment variables..."

# Vercel CLI'nin kurulu olduğunu kontrol et
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI bulunamadı. Lütfen önce kurun:"
    echo "npm install -g vercel"
    exit 1
fi

# .env dosyasının varlığını kontrol et
if [ ! -f .env ]; then
    echo "❌ .env dosyası bulunamadı. Lütfen önce .env.example'dan kopyalayın."
    exit 1
fi

echo "📋 Environment variables ekleniyor..."

# Production Environment Variables
echo "Setting up Production environment..."

# Supabase Configuration
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# API Configuration
vercel env add VITE_API_BASE_URL production
vercel env add SESSION_SECRET production

# App Configuration
vercel env add VITE_APP_URL production
vercel env add NODE_ENV production

# Performance & Monitoring
vercel env add VITE_ENABLE_PERFORMANCE_MONITORING production
vercel env add VITE_SENTRY_DSN production

# Optional: Analytics
read -p "Google Analytics ID eklemek istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add VITE_GOOGLE_ANALYTICS_ID production
fi

# Optional: External Services
read -p "WhatsApp API URL eklemek istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add VITE_WHATSAPP_API_URL production
fi

read -p "SMS API Key eklemek istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add VITE_SMS_API_KEY production
fi

read -p "Email Service API Key eklemek istiyor musunuz? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel env add VITE_EMAIL_SERVICE_API_KEY production
fi

# Preview Environment Variables
echo ""
echo "Setting up Preview environment..."

vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add VITE_API_BASE_URL preview
vercel env add SESSION_SECRET preview
vercel env add VITE_ENABLE_PERFORMANCE_MONITORING preview

# Development Environment Variables
echo ""
echo "Setting up Development environment..."

vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
vercel env add SUPABASE_SERVICE_ROLE_KEY development
vercel env add VITE_API_BASE_URL development
vercel env add SESSION_SECRET development
vercel env add VITE_ENABLE_PERFORMANCE_MONITORING development

echo ""
echo "✅ Environment variables başarıyla eklendi!"
echo ""
echo "📝 Sonraki adımlar:"
echo "1. Vercel dashboard'da environment variables'ları kontrol edin"
echo "2. Deployment'ı tetiklemek için bir commit push edin"
echo "3. GitHub Actions workflow'unun çalıştığını kontrol edin"
echo ""
echo "🔗 Yararlı linkler:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- GitHub Actions: https://github.com/[your-repo]/actions"
echo "- Supabase Dashboard: https://app.supabase.com"
