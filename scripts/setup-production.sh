#!/bin/bash

# Production Setup Script for Dernek Panel
# This script sets up a production environment with all necessary components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Configuration
PROJECT_NAME="dernek-panel"
DOMAIN="your-domain.com"
SSL_EMAIL="admin@your-domain.com"

log "Starting production setup for $PROJECT_NAME..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please do not run this script as root"
    exit 1
fi

# Check system requirements
log "Checking system requirements..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    error "Git is not installed. Please install Git first."
    exit 1
fi

log "System requirements check passed!"

# Create necessary directories
log "Creating necessary directories..."
mkdir -p backups
mkdir -p logs
mkdir -p uploads
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p monitoring/logstash/pipeline

# Set proper permissions
chmod 755 backups logs uploads
chmod 644 monitoring/grafana/dashboards/*
chmod 644 monitoring/grafana/datasources/*

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
    log "Creating .env.production file..."
    cp .env.production.example .env.production
    warning "Please edit .env.production with your actual values before continuing"
    echo "Press Enter to continue after editing .env.production..."
    read
fi

# Generate secure secrets
log "Generating secure secrets..."

# Generate JWT secret
if [ -z "$(grep 'JWT_SECRET=' .env.production | cut -d'=' -f2)" ] || [ "$(grep 'JWT_SECRET=' .env.production | cut -d'=' -f2)" = "your-super-secure-jwt-secret-at-least-32-characters-long" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
    log "Generated JWT secret"
fi

# Generate encryption key
if [ -z "$(grep 'ENCRYPTION_KEY=' .env.production | cut -d'=' -f2)" ] || [ "$(grep 'ENCRYPTION_KEY=' .env.production | cut -d'=' -f2)" = "your-32-character-encryption-key" ]; then
    ENCRYPTION_KEY=$(openssl rand -base64 24)
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env.production
    log "Generated encryption key"
fi

# Generate session secret
if [ -z "$(grep 'SESSION_SECRET=' .env.production | cut -d'=' -f2)" ] || [ "$(grep 'SESSION_SECRET=' .env.production | cut -d'=' -f2)" = "your-session-secret-key" ]; then
    SESSION_SECRET=$(openssl rand -base64 32)
    sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$SESSION_SECRET/" .env.production
    log "Generated session secret"
fi

# Generate database password
if [ -z "$(grep 'DB_PASSWORD=' .env.production | cut -d'=' -f2)" ] || [ "$(grep 'DB_PASSWORD=' .env.production | cut -d'=' -f2)" = "your-secure-database-password" ]; then
    DB_PASSWORD=$(openssl rand -base64 16)
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env.production
    log "Generated database password"
fi

# Generate Grafana password
if [ -z "$(grep 'GRAFANA_PASSWORD=' .env.production | cut -d'=' -f2)" ] || [ "$(grep 'GRAFANA_PASSWORD=' .env.production | cut -d'=' -f2)" = "your-secure-grafana-password" ]; then
    GRAFANA_PASSWORD=$(openssl rand -base64 12)
    sed -i "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASSWORD/" .env.production
    log "Generated Grafana password"
fi

# Install dependencies
log "Installing dependencies..."
npm ci
cd api && npm ci && cd ..

# Build applications
log "Building applications..."
npm run build
cd api && npm run build && cd ..

# Create SSL certificates (if using Let's Encrypt)
if [ "$DOMAIN" != "your-domain.com" ]; then
    log "Setting up SSL certificates..."
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        warning "Certbot is not installed. SSL certificates will not be automatically generated."
        warning "Please install certbot and run: sudo certbot certonly --standalone -d $DOMAIN"
    else
        # Generate SSL certificate
        sudo certbot certonly --standalone -d $DOMAIN --email $SSL_EMAIL --agree-tos --non-interactive
        log "SSL certificate generated for $DOMAIN"
    fi
fi

# Setup monitoring configuration
log "Setting up monitoring configuration..."

# Create Prometheus configuration
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'dernek-panel-api'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'dernek-panel-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF

# Create Grafana datasource configuration
cat > monitoring/grafana/datasources/datasource.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create basic Grafana dashboard
cat > monitoring/grafana/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF

# Create Logstash pipeline configuration
cat > monitoring/logstash/pipeline/logstash.conf << EOF
input {
  file {
    path => "/var/log/app/*.log"
    type => "application"
    start_position => "beginning"
  }
}

filter {
  if [type] == "application" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "dernek-panel-%{+YYYY.MM.dd}"
  }
}
EOF

# Setup firewall rules
log "Setting up firewall rules..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # Grafana
    sudo ufw allow 9090/tcp  # Prometheus
    sudo ufw allow 5601/tcp  # Kibana
    sudo ufw --force enable
    log "Firewall rules configured"
else
    warning "UFW not found. Please configure firewall manually."
fi

# Create systemd service for auto-start
log "Creating systemd service..."
sudo tee /etc/systemd/system/dernek-panel.service > /dev/null << EOF
[Unit]
Description=Dernek Panel Production Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker-compose -f docker-compose.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable dernek-panel.service
sudo systemctl start dernek-panel.service

# Setup backup cron job
log "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && ./scripts/backup.sh >> logs/backup.log 2>&1") | crontab -

# Create monitoring script
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# Monitoring script for Dernek Panel
LOG_FILE="logs/monitor.log"
DATE=$(date +'%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting health check..." >> $LOG_FILE

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "[$DATE] ERROR: Some containers are not running" >> $LOG_FILE
    docker-compose restart
    echo "[$DATE] Restarted containers" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "[$DATE] WARNING: Memory usage is ${MEMORY_USAGE}%" >> $LOG_FILE
fi

echo "[$DATE] Health check completed" >> $LOG_FILE
EOF

chmod +x scripts/monitor.sh

# Add monitoring to cron
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $(pwd) && ./scripts/monitor.sh") | crontab -

# Create update script
cat > scripts/update.sh << 'EOF'
#!/bin/bash

# Update script for Dernek Panel
set -e

echo "Starting system update..."

# Backup before update
./scripts/backup.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm ci
cd api && npm ci && cd ..

# Build applications
npm run build
cd api && npm run build && cd ..

# Restart services
sudo systemctl restart dernek-panel.service

echo "Update completed successfully!"
EOF

chmod +x scripts/update.sh

# Final setup
log "Finalizing setup..."

# Start the application
log "Starting application..."
docker-compose up -d

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    log "✅ All services are running successfully!"
else
    error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Display access information
log "🎉 Production setup completed successfully!"
echo ""
echo "📋 Access Information:"
echo "  🌐 Application: http://localhost (or https://$DOMAIN)"
echo "  📊 Grafana: http://localhost:3000 (admin / $GRAFANA_PASSWORD)"
echo "  📈 Prometheus: http://localhost:9090"
echo "  📝 Kibana: http://localhost:5601"
echo ""
echo "🔧 Management Commands:"
echo "  Start services: sudo systemctl start dernek-panel"
echo "  Stop services: sudo systemctl stop dernek-panel"
echo "  View logs: docker-compose logs -f"
echo "  Update system: ./scripts/update.sh"
echo "  Manual backup: ./scripts/backup.sh"
echo ""
echo "📁 Important Directories:"
echo "  Backups: ./backups"
echo "  Logs: ./logs"
echo "  Uploads: ./uploads"
echo ""
echo "⚠️  IMPORTANT:"
echo "  1. Change default passwords in .env.production"
echo "  2. Configure SSL certificates for production"
echo "  3. Set up monitoring alerts"
echo "  4. Test backup and recovery procedures"
echo "  5. Review security settings"
echo ""

log "Setup completed! Please review the information above and secure your installation."
