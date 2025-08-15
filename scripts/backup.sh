#!/bin/bash

# Backup script for Dernek Panel Production
# This script creates daily backups of database and files

set -e

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="dernek_panel"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

log "Starting backup process..."

# Database backup
log "Creating database backup..."
if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup_$DATE.sql"
    log "Database backup completed: db_backup_$DATE.sql"
else
    error "DATABASE_URL environment variable is not set"
    exit 1
fi

# Compress database backup
log "Compressing database backup..."
gzip "$BACKUP_DIR/db_backup_$DATE.sql"
log "Database backup compressed: db_backup_$DATE.sql.gz"

# File backup (if uploads directory exists)
if [ -d "/app/uploads" ]; then
    log "Creating file backup..."
    tar -czf "$BACKUP_DIR/files_backup_$DATE.tar.gz" -C /app uploads
    log "File backup completed: files_backup_$DATE.tar.gz"
else
    warning "Uploads directory not found, skipping file backup"
fi

# Create backup manifest
log "Creating backup manifest..."
cat > "$BACKUP_DIR/backup_manifest_$DATE.json" << EOF
{
  "backup_date": "$(date -Iseconds)",
  "backup_type": "daily",
  "files": [
    {
      "name": "db_backup_$DATE.sql.gz",
      "type": "database",
      "size": "$(du -h "$BACKUP_DIR/db_backup_$DATE.sql.gz" | cut -f1)"
    }
EOF

if [ -f "$BACKUP_DIR/files_backup_$DATE.tar.gz" ]; then
    cat >> "$BACKUP_DIR/backup_manifest_$DATE.json" << EOF
    ,
    {
      "name": "files_backup_$DATE.tar.gz",
      "type": "files",
      "size": "$(du -h "$BACKUP_DIR/files_backup_$DATE.tar.gz" | cut -f1)"
    }
EOF
fi

cat >> "$BACKUP_DIR/backup_manifest_$DATE.json" << EOF
  ],
  "total_size": "$(du -sh "$BACKUP_DIR" | cut -f1)"
}
EOF

log "Backup manifest created: backup_manifest_$DATE.json"

# Clean up old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "backup_manifest_*.json" -mtime +$RETENTION_DAYS -delete

# Cloud storage backup (if AWS CLI is available)
if command -v aws &> /dev/null; then
    if [ -n "$AWS_S3_BUCKET" ]; then
        log "Uploading backups to S3..."
        aws s3 sync $BACKUP_DIR s3://$AWS_S3_BUCKET/backups/ --delete
        log "S3 upload completed"
    else
        warning "AWS_S3_BUCKET environment variable not set, skipping S3 upload"
    fi
else
    warning "AWS CLI not found, skipping S3 upload"
fi

# Verify backup integrity
log "Verifying backup integrity..."
if [ -f "$BACKUP_DIR/db_backup_$DATE.sql.gz" ]; then
    if gunzip -t "$BACKUP_DIR/db_backup_$DATE.sql.gz"; then
        log "Database backup integrity verified"
    else
        error "Database backup integrity check failed"
        exit 1
    fi
fi

if [ -f "$BACKUP_DIR/files_backup_$DATE.tar.gz" ]; then
    if tar -tzf "$BACKUP_DIR/files_backup_$DATE.tar.gz" > /dev/null; then
        log "File backup integrity verified"
    else
        error "File backup integrity check failed"
        exit 1
    fi
fi

# Send notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    log "Sending backup notification..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Daily backup completed successfully at $(date)\"}" \
        $SLACK_WEBHOOK_URL
fi

log "Backup process completed successfully!"
log "Backup location: $BACKUP_DIR"
log "Total backup size: $(du -sh $BACKUP_DIR | cut -f1)"
