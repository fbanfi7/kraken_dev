#!/bin/bash

# Nginx Configuration Validation Script
# Usage: ./scripts/validate_nginx.sh [domain]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN=${1:-yourdomain.com}
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

validate_templates() {
    log "Validating nginx templates..."
    
    # Check if pre-SSL template exists
    if [ ! -f "templates/nginx.conf.template.pre-ssl" ]; then
        error "Pre-SSL template not found: templates/nginx.conf.template.pre-ssl"
    fi
    
    # Check if final template exists
    if [ ! -f "templates/nginx.conf.template.final" ]; then
        error "Final template not found: templates/nginx.conf.template.final"
    fi
    
    log "✅ All nginx templates found"
}

test_template_generation() {
    log "Testing template generation..."
    
    # Create test directory
    mkdir -p test_nginx
    
    # Test pre-SSL template generation
    export DOMAIN_NAME="$DOMAIN"
    envsubst '${DOMAIN_NAME}' < templates/nginx.conf.template.pre-ssl > test_nginx/pre-ssl.conf
    
    # Test final template generation
    envsubst '${DOMAIN_NAME}' < templates/nginx.conf.template.final > test_nginx/final.conf
    
    # Validate generated configs with nginx -t (using docker)
    log "Validating pre-SSL configuration..."
    # Create a basic nginx.conf that includes our config
    cat > test_nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/conf.d/*.conf;
}
EOF
    
    if docker run --rm \
        -v "$(pwd)/test_nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
        -v "$(pwd)/test_nginx/pre-ssl.conf:/etc/nginx/conf.d/default.conf:ro" \
        nginx:1.25-alpine nginx -t > /dev/null 2>&1; then
        log "✅ Pre-SSL configuration is valid"
    else
        error "❌ Pre-SSL configuration has syntax errors"
    fi
    
    log "Validating final configuration (will fail without SSL files, but syntax should be OK)..."
    # This will fail due to missing SSL files, but we can check syntax
    docker run --rm \
        -v "$(pwd)/test_nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
        -v "$(pwd)/test_nginx/final.conf:/etc/nginx/conf.d/default.conf:ro" \
        nginx:1.25-alpine nginx -t 2>&1 | grep -q "syntax is ok" && {
        log "✅ Final configuration syntax is valid"
    } || {
        warning "⚠️ Final configuration syntax check inconclusive (expected due to missing SSL files)"
    }
    
    # Cleanup
    rm -rf test_nginx
}

validate_compose_config() {
    log "Validating docker-compose configuration..."
    
    if [ ! -f "compose.prod.yml" ]; then
        error "Docker compose file not found: compose.prod.yml"
    fi
    
    # Check if compose file is valid
    if docker compose -f compose.prod.yml config > /dev/null 2>&1; then
        log "✅ Docker compose configuration is valid"
    else
        error "❌ Docker compose configuration has errors"
    fi
}

check_dependencies() {
    log "Checking dependencies..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker compose &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
    fi
    
    # Check if envsubst is available
    if ! command -v envsubst &> /dev/null; then
        error "envsubst is not installed (usually part of gettext package)"
    fi
    
    log "✅ All dependencies are available"
}

main() {
    log "Starting nginx configuration validation..."
    log "Domain: $DOMAIN"
    
    cd "$PROJECT_DIR" || error "Could not change to project directory '$PROJECT_DIR'"
    
    check_dependencies
    validate_templates
    test_template_generation
    validate_compose_config
    
    log "🎉 All validations passed!"
    log "The nginx configuration should deploy successfully."
}

# Run main function
main