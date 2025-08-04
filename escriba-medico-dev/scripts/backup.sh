#!/bin/bash

# Medic Scribe Backup Script
# Usage: ./scripts/backup.sh

set -e

# Configuration
PROJECT_DIR="/opt/medic-scribe"
BACKUP_DIR="/opt/backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="medic-scribe_backup_${TIMESTAMP}.tar.gz"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

log "Starting backup process..."

# Backup database
log "Backing up database..."
cd "$PROJECT_DIR"
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "$TEMP_DIR/database.sql"

# Backup configuration files
log "Backing up configuration files..."
cp "$PROJECT_DIR/.env.production" "$TEMP_DIR/"
cp "$PROJECT_DIR/docker-compose.prod.yml" "$TEMP_DIR/"
cp -r "$PROJECT_DIR/nginx" "$TEMP_DIR/"

# Create compressed backup
log "Creating compressed backup..."
cd "$TEMP_DIR"
tar -czf "$BACKUP_DIR/$BACKUP_FILE" .

# Set permissions
chmod 600 "$BACKUP_DIR/$BACKUP_FILE"

# Clean old backups
log "Cleaning old backups..."
find "$BACKUP_DIR" -name "medic-scribe_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

log "Backup completed: $BACKUP_DIR/$BACKUP_FILE"