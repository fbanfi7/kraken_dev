#!/bin/bash

# Nginx Rollback Script
# Usage: ./scripts/rollback_nginx.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/root/escriba-medico-dev"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

backup_current_config() {
    log "Creating backup of current configuration..."
    
    # Create backup directory with timestamp
    BACKUP_DIR="backups/nginx_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup current nginx config if it exists
    if [ -f "nginx/generated_nginx.conf" ]; then
        cp nginx/generated_nginx.conf "$BACKUP_DIR/nginx.conf.backup"
        log "✅ Current nginx config backed up to $BACKUP_DIR"
    fi
    
    # Backup SSL certificates if they exist
    if docker compose -f compose.prod.yml exec nginx test -d /etc/letsencrypt/live 2>/dev/null; then
        log "SSL certificates found, creating backup..."
        docker compose -f compose.prod.yml exec nginx tar -czf /tmp/ssl_backup.tar.gz -C /etc/letsencrypt . 2>/dev/null || true
        docker cp "$(docker compose -f compose.prod.yml ps -q nginx):/tmp/ssl_backup.tar.gz" "$BACKUP_DIR/" 2>/dev/null || true
        log "✅ SSL certificates backed up"
    fi
    
    echo "$BACKUP_DIR" > .last_backup_path
}

stop_services() {
    log "Stopping all services..."
    
    if docker compose -f compose.prod.yml ps | grep -q "Up"; then
        docker compose -f compose.prod.yml down
        log "✅ Services stopped"
    else
        log "ℹ️ Services were not running"
    fi
}

create_minimal_nginx() {
    log "Creating minimal nginx configuration..."
    
    mkdir -p nginx
    
    cat > nginx/generated_nginx.conf << 'EOF'
# Minimal Nginx Configuration - Emergency Rollback
events {
    worker_connections 1024;
}

http {
    server_tokens off;
    
    # Simple HTTP server for emergency access
    server {
        listen 80 default_server;
        server_name _;
        
        location /health {
            access_log off;
            return 200 "nginx emergency mode - healthy\n";
            add_header Content-Type text/plain;
        }
        
        location / {
            return 503 "Service temporarily unavailable - maintenance mode";
            add_header Content-Type text/plain;
        }
    }
}
EOF
    
    log "✅ Minimal nginx configuration created"
}

start_emergency_mode() {
    log "Starting nginx in emergency mode..."
    
    # Start only nginx in emergency mode
    docker compose -f compose.prod.yml up -d nginx
    
    # Wait for nginx to start
    sleep 5
    
    # Check if nginx is responding
    if curl -f "http://localhost/health" > /dev/null 2>&1; then
        log "✅ Nginx is running in emergency mode"
        log "🌐 Service available at http://your-domain (HTTP only)"
    else
        error "❌ Failed to start nginx in emergency mode"
    fi
}

restore_from_backup() {
    if [ -f ".last_backup_path" ]; then
        BACKUP_PATH=$(cat .last_backup_path)
        if [ -d "$BACKUP_PATH" ] && [ -f "$BACKUP_PATH/nginx.conf.backup" ]; then
            log "Restoring from backup: $BACKUP_PATH"
            cp "$BACKUP_PATH/nginx.conf.backup" nginx/generated_nginx.conf
            log "✅ Configuration restored from backup"
            return 0
        fi
    fi
    return 1
}

show_status() {
    log "Current system status:"
    
    # Show running containers
    echo "Running containers:"
    docker compose -f compose.prod.yml ps
    
    # Show nginx status
    if docker compose -f compose.prod.yml exec nginx nginx -t 2>/dev/null; then
        log "✅ Nginx configuration is valid"
    else
        warning "⚠️ Nginx configuration has issues"
    fi
    
    # Show available endpoints
    log "Available endpoints:"
    log "  - HTTP Health Check: http://your-domain/health"
    if docker compose -f compose.prod.yml exec nginx test -f /etc/letsencrypt/options-ssl-nginx.conf 2>/dev/null; then
        log "  - HTTPS: https://your-domain (if SSL is working)"
    else
        log "  - HTTPS: Not available (SSL not configured)"
    fi
}

main() {
    log "Starting nginx rollback procedure..."
    
    cd "$PROJECT_DIR" || error "Could not change to project directory '$PROJECT_DIR'"
    
    # Create backup before making changes
    backup_current_config
    
    # Stop all services
    stop_services
    
    # Try to restore from backup first
    if restore_from_backup; then
        log "Attempting to start with restored configuration..."
        if docker compose -f compose.prod.yml up -d nginx && sleep 5 && curl -f "http://localhost/health" > /dev/null 2>&1; then
            log "✅ Successfully restored from backup"
            show_status
            exit 0
        else
            warning "⚠️ Backup restoration failed, switching to emergency mode"
        fi
    fi
    
    # Create minimal configuration and start emergency mode
    create_minimal_nginx
    start_emergency_mode
    
    show_status
    
    log "🚨 System is now in emergency mode"
    log "📋 Next steps:"
    log "   1. Check the backup in: $(cat .last_backup_path 2>/dev/null || echo 'No backup created')"
    log "   2. Fix the nginx configuration issues"
    log "   3. Run the deploy script again"
    log "   4. Or manually restore services with: docker compose -f compose.prod.yml up -d"
}

# Run main function
main