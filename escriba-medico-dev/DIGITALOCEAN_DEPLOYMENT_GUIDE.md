# 🚀 Complete DigitalOcean Deployment Guide for Medic Scribe

This guide provides step-by-step instructions to deploy your Medic Scribe application to a DigitalOcean droplet.

## 📋 Prerequisites

- DigitalOcean account with billing enabled
- Domain name (optional but recommended)
- Basic knowledge of Linux commands
- SSH key configured in DigitalOcean

## 🎯 Recommended Droplet Configuration

**Production Setup:**
- **Size**: $24/month (4GB RAM, 2 vCPUs, 80GB SSD)
- **Location**: NYC3 (or closest to your users)
- **OS**: Ubuntu 22.04 LTS
- **Additional**: Enable IPv6, Monitoring, Backups

## 📁 Production File Structure

```
/opt/medic-scribe/
├── docker-compose.prod.yml
├── .env.production
├── backend/
│   ├── Dockerfile.prod
│   ├── requirements.txt
│   └── app/
├── frontend/
│   ├── Dockerfile.prod
│   ├── package.json
│   └── src/
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── health-check.sh
└── logs/
```

## 🔧 Step 1: Initial Droplet Setup

```bash
# Connect to your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git ufw fail2ban

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -SL https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add user to docker group
usermod -aG docker $USER
```

## 🔐 Step 2: Security Configuration

```bash
# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

## 🐳 Step 3: Production Docker Compose Configuration

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: medic-scribe-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-medicscribe}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - medic-scribe-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: medic-scribe-backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=${CORS_ORIGINS:-https://yourdomain.com}
    depends_on:
      - postgres
    networks:
      - medic-scribe-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        - VITE_API_URL=${VITE_API_URL:-https://yourdomain.com/api}
    container_name: medic-scribe-frontend
    restart: unless-stopped
    networks:
      - medic-scribe-network

  nginx:
    image: nginx:alpine
    container_name: medic-scribe-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - certbot_data:/etc/letsencrypt
    depends_on:
      - backend
      - frontend
    networks:
      - medic-scribe-network

volumes:
  postgres_data:
  certbot_data:

networks:
  medic-scribe-network:
    driver: bridge
```

## 🏗️ Step 4: Production Dockerfiles

### Backend Dockerfile.prod
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -r -s /bin/false appuser
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile.prod
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## 🌐 Step 5: Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
upstream backend {
    server backend:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.deepgram.com" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend routes
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## 🔐 Step 6: Environment Variables Template

Create `.env.production.template`:

```bash
# Database Configuration
POSTGRES_DB=medicscribe
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# API Keys
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
SECRET_KEY=your_secret_key_for_jwt

# Frontend Configuration
VITE_API_URL=https://yourdomain.com/api
CORS_ORIGINS=https://yourdomain.com

# Production Settings
DEBUG=false
ENVIRONMENT=production
```

## 🚀 Step 7: Deployment Scripts

### Deploy Script
Create `scripts/deploy.sh`:

```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Medic Scribe deployment...${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    exit 1
fi

# Pull latest changes
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml down