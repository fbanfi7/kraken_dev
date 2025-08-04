#!/bin/bash

# Medic Scribe Production Deployment Script
# Usage: ./scripts/deploy.sh [domain] [email]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN=${1:-yourdomain.com}
EMAIL=${2:-your-email@domain.com}
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

check_requirements() {
    log "Checking requirements..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    log "Requirements check passed"
}

update_source_code() {
    log "Verifying project directory and updating source code from Git..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Project directory '$PROJECT_DIR' not found. Please clone the repository first: git clone <repo_url> $PROJECT_DIR"
    fi

    cd "$PROJECT_DIR" || error "Could not change to project directory '$PROJECT_DIR'"

    if [ ! -d ".git" ]; then
        error "Directory '$PROJECT_DIR' is not a Git repository."
    fi
    
    log "Pulling latest changes..."
    # Stash any local changes before pulling to prevent errors
    git stash push -m "deploy-script-stash-$(date +%s)" > /dev/null
    git pull --rebase
    # Attempt to apply stashed changes, do not fail if there's nothing to pop
    git stash pop > /dev/null 2>&1 || true
    
    log "Source code updated successfully"
}

install_dependencies() {
    log "Installing system dependencies..."
    
    apt update && apt upgrade -y
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        git \
        ufw \
        fail2ban \
        certbot \
        python3-certbot-nginx
    
    # Stop and disable system NGINX service to prevent conflicts with containerized NGINX.
    # The 'python3-certbot-nginx' package installs NGINX as a dependency, which can
    # auto-start and occupy port 80, causing our Docker container to fail.
    if systemctl --quiet is-active nginx; then
        log "System's NGINX service is active. Stopping it..."
        systemctl stop nginx
    fi
    if systemctl --quiet is-enabled nginx; then
        log "System's NGINX service is enabled. Disabling it..."
        systemctl disable nginx
    fi
    
    log "Dependencies installed"
}

configure_firewall() {
    log "Configuring firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured"
}

configure_fail2ban() {
    log "Configuring fail2ban..."
    
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log "Fail2ban configured"
}

setup_ssl_certificates() {
    log "Setting up SSL certificates..."
    cd "$PROJECT_DIR" || error "Could not change to project directory '$PROJECT_DIR'"

    # Ensure the target directory for nginx configs exists
    mkdir -p nginx

    # --- ETAPA 1: Pre-SSL Nginx Setup ---
    log "Generating temporary Nginx configuration for SSL validation..."
    if [ ! -f "templates/nginx.conf.template.pre-ssl" ]; then
        error "Pre-SSL Nginx template 'templates/nginx.conf.template.pre-ssl' not found."
    fi
    export DOMAIN_NAME="$DOMAIN"
    envsubst '${DOMAIN_NAME}' < templates/nginx.conf.template.pre-ssl > nginx/generated_nginx.conf

    log "Building fresh production images..."
    docker compose -f compose.prod.yml build --no-cache nginx

    log "Starting Nginx with temporary config for SSL validation..."
    docker compose -f compose.prod.yml up -d nginx
    sleep 10 # Wait for Nginx to be fully ready

    # --- ETAPA 2: Request SSL Certificate ---
    log "Requesting SSL certificate from Let's Encrypt..."
    docker compose -f compose.prod.yml run --rm certbot certonly \
        --webroot --webroot-path=/var/www/certbot \
        --email "$EMAIL" --agree-tos --no-eff-email \
        -d "$DOMAIN" --non-interactive

    log "Stopping temporary Nginx..."
    docker compose -f compose.prod.yml stop nginx

    # --- ETAPA 3: Post-SSL Nginx Setup ---
    log "Generating final Nginx configuration with SSL..."
    if [ ! -f "templates/nginx.conf.template.final" ]; then
        error "Final Nginx template 'templates/nginx.conf.template.final' not found."
    fi
    envsubst '${DOMAIN_NAME}' < templates/nginx.conf.template.final > nginx/generated_nginx.conf

    # Nginx will be brought up with the final config in the deploy_application step
    log "SSL certificates obtained and final Nginx config generated."
}

create_env_file_if_not_exists() {
    log "Checking for .env.production file..."
    # This function is executed from within $PROJECT_DIR
    if [ ! -f ".env.production" ]; then
        log "Production environment file (.env.production) not found. Creating from backend example."
        if [ -f "backend/.env.example" ]; then
            cp "backend/.env.example" ".env.production"
        else
            warning "backend/.env.example not found. Creating a default .env.production."
            cat > .env.production << EOF
# PostgreSQL
POSTGRES_DB=medic_scribe
POSTGRES_USER=medic_scribe
POSTGRES_PASSWORD=your_secure_password_here
DB_HOST=db
DB_PORT=5432

# FastAPI
API_V1_STR=/api/v1

# Domain and Email for Nginx and Certbot
DOMAIN_NAME=yourdomain.com
CERTBOT_EMAIL=your-email@domain.com
EOF
        fi
    else
        log ".env.production file already exists."
    fi
}
stop_existing_services() {
    log "Stopping existing services..."
    if [ -f "$PROJECT_DIR/compose.prod.yml" ]; then
        docker compose -f "$PROJECT_DIR/compose.prod.yml" down --remove-orphans || true
    else
        warning "Compose file not found in $PROJECT_DIR, skipping 'docker compose down'."
    fi
    log "Existing services stopped"
}

deploy_application() {
    log "Deploying application..."

    # The files are already copied and images built in the SSL step.
    # We just need to bring all services up.
    cd "$PROJECT_DIR"
    
    # Update environment variables in .env.production
    log "Updating .env.production with domain and email..."
    # Use a different delimiter for sed to avoid issues with slashes in domain/email
    sed -i "s|DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN|g" .env.production
    sed -i "s|CERTBOT_EMAIL=.*|CERTBOT_EMAIL=$EMAIL|g" .env.production

    log "Bringing all services up..."
    docker compose -f compose.prod.yml up -d

    log "Application deployed"
}

verify_nginx_ssl() {
    log "Verifying Nginx SSL configuration..."
    
    # Check if SSL files exist
    if docker compose -f "$PROJECT_DIR/compose.prod.yml" exec nginx test -f /etc/letsencrypt/options-ssl-nginx.conf; then
        log "✅ SSL configuration files found"
    else
        error "❌ SSL configuration files missing"
    fi
    
    # Test nginx configuration
    if docker compose -f "$PROJECT_DIR/compose.prod.yml" exec nginx nginx -t; then
        log "✅ Nginx configuration is valid"
    else
        error "❌ Nginx configuration has errors"
    fi
    
    # Check if HTTPS is working
    if curl -f -k "https://$DOMAIN/health" > /dev/null 2>&1; then
        log "✅ HTTPS endpoint is responding"
    else
        warning "⚠️ HTTPS endpoint not responding yet"
    fi
}

verify_deployment() {
    log "Verifying deployment..."
    
    # Wait for services to start
    sleep 30
    
    # Check if services are running
    if docker compose -f "$PROJECT_DIR/compose.prod.yml" ps | grep -q "Up"; then
        log "✅ All services are running"
    else
        error "❌ Some services failed to start"
    fi
    
    # Verify SSL configuration
    verify_nginx_ssl
    
    # Check if application is accessible
    if curl -f "https://$DOMAIN" > /dev/null 2>&1; then
        log "✅ Application is accessible at https://$DOMAIN"
    else
        warning "⚠️  Application might not be accessible yet. Check DNS propagation."
    fi
}

main() {
    log "Starting Medic Scribe deployment..."
create_env_file_if_not_exists
    log "Domain: $DOMAIN"
    log "Email: $EMAIL"
    
    check_requirements
    update_source_code # This will pull the latest changes
    install_dependencies
    configure_firewall
    configure_fail2ban
    stop_existing_services
    setup_ssl_certificates
    deploy_application
    verify_deployment
    
    log "🎉 Deployment completed successfully!"
    log "Your Medic Scribe application is now running at: https://$DOMAIN"
}

# Run main function
main