# 🚀 Production Kurulum Rehberi

Bu rehber, Dernek Yönetim Panelini production ortamında güvenli bir şekilde kurmak için gerekli adımları içerir.

## 📋 Ön Gereksinimler

### Sistem Gereksinimleri
- **İşletim Sistemi**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB (Önerilen: 8GB+)
- **Disk**: Minimum 20GB boş alan
- **CPU**: 2 çekirdek (Önerilen: 4 çekirdek+)

### Yazılım Gereksinimleri
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Node.js 18+ (opsiyonel, Docker kullanıyorsanız gerekli değil)

## 🛠️ Hızlı Kurulum

### 1. Sistemi Hazırlama

```bash
# Sistem güncellemelerini yapın
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git kurulumu
sudo apt install git -y
```

### 2. Projeyi İndirme

```bash
# Projeyi klonlayın
git clone https://github.com/your-username/dernek-panel.git
cd dernek-panel

# Production branch'ine geçin
git checkout main
```

### 3. Otomatik Kurulum

```bash
# Kurulum script'ini çalıştırın
./scripts/setup-production.sh
```

**Not**: Script çalıştırılmadan önce `.env.production` dosyasını düzenlemeniz gerekecek.

## ⚙️ Manuel Kurulum

### 1. Environment Variables

```bash
# Environment dosyasını oluşturun
cp .env.production.example .env.production

# Dosyayı düzenleyin
nano .env.production
```

**Önemli Ayarlar:**
- `SUPABASE_URL`: Supabase proje URL'iniz
- `SUPABASE_ANON_KEY`: Supabase anonim anahtarınız
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase servis rol anahtarınız
- `JWT_SECRET`: Güvenli JWT anahtarı (32+ karakter)
- `ENCRYPTION_KEY`: Şifreleme anahtarı (32 karakter)

### 2. Uygulamayı Başlatma

```bash
# Dependencies'leri yükleyin
npm ci
cd api && npm ci && cd ..

# Uygulamayı build edin
npm run build
cd api && npm run build && cd ..

# Docker container'larını başlatın
docker-compose up -d
```

### 3. SSL Sertifikası (Opsiyonel)

```bash
# Certbot kurulumu
sudo apt install certbot -y

# SSL sertifikası oluşturun
sudo certbot certonly --standalone -d your-domain.com
```

## 🔧 Yönetim Komutları

### Servis Yönetimi

```bash
# Servisleri başlat
sudo systemctl start dernek-panel

# Servisleri durdur
sudo systemctl stop dernek-panel

# Servis durumunu kontrol et
sudo systemctl status dernek-panel

# Logları görüntüle
docker-compose logs -f
```

### Backup ve Restore

```bash
# Manuel backup
./scripts/backup.sh

# Backup'ları listele
ls -la backups/

# Backup'ı geri yükle (veritabanı)
gunzip -c backups/db_backup_20241201_120000.sql.gz | psql $DATABASE_URL
```

### Güncelleme

```bash
# Sistemi güncelle
./scripts/update.sh

# Veya manuel güncelleme
git pull origin main
npm ci
npm run build
sudo systemctl restart dernek-panel
```

## 📊 Monitoring

### Erişim Bilgileri

- **Ana Uygulama**: http://localhost (veya https://your-domain.com)
- **Grafana**: http://localhost:3000 (admin / [GRAFANA_PASSWORD])
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601

### Health Check

```bash
# Sistem sağlığını kontrol et
curl http://localhost/api/health

# Detaylı sağlık kontrolü
curl http://localhost/api/health/detailed
```

## 🔒 Güvenlik

### Firewall Ayarları

```bash
# Gerekli portları açın
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Grafana (opsiyonel)
sudo ufw --force enable
```

### Güvenlik Kontrol Listesi

- [ ] Default şifreleri değiştirin
- [ ] SSL sertifikası kurun
- [ ] Firewall ayarlarını yapın
- [ ] Monitoring alert'lerini kurun
- [ ] Backup prosedürlerini test edin
- [ ] Rate limiting ayarlarını kontrol edin

## 🚨 Sorun Giderme

### Yaygın Sorunlar

**1. Container'lar başlamıyor**
```bash
# Logları kontrol edin
docker-compose logs

# Container durumunu kontrol edin
docker-compose ps
```

**2. Veritabanı bağlantı hatası**
```bash
# Supabase ayarlarını kontrol edin
cat .env.production | grep SUPABASE

# Bağlantıyı test edin
curl $SUPABASE_URL/rest/v1/
```

**3. Disk alanı yetersiz**
```bash
# Disk kullanımını kontrol edin
df -h

# Eski backup'ları temizleyin
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

### Log Dosyaları

```bash
# Uygulama logları
tail -f logs/app.log

# Backup logları
tail -f logs/backup.log

# Monitoring logları
tail -f logs/monitor.log
```

## 📞 Destek

### Acil Durum İletişim

- **Sistem Yöneticisi**: admin@your-domain.com
- **Veritabanı Yöneticisi**: db-admin@your-domain.com
- **Güvenlik Ekibi**: security@your-domain.com

### Faydalı Komutlar

```bash
# Sistem durumu
htop
df -h
free -h

# Docker durumu
docker system df
docker stats

# Network durumu
netstat -tulpn
```

## 📚 Ek Kaynaklar

- [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
- [API Documentation](docs/API.md)
- [Security Best Practices](docs/SECURITY.md)
- [Monitoring Setup](docs/MONITORING.md)

---

**⚠️ Önemli**: Bu rehber production ortamı için hazırlanmıştır. Test ortamında deneyin ve güvenlik ayarlarını gözden geçirin.
