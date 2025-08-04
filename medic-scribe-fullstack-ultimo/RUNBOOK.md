# Medic Scribe Fullstack - Operations Runbook

This runbook provides copy-paste commands for setup, testing, and debugging the medic-scribe-fullstack-ultimo project with the new containerized architecture.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Production Deployment](#production-deployment)
8. [Maintenance](#maintenance)

---

## Prerequisites

### Required Software and Versions

**System Requirements:**
- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ and npm (for local development)
- Python 3.10+ (for local development)
- Git

**Install Prerequisites (Ubuntu/Debian):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose Plugin
sudo apt install docker-compose-plugin -y

# Install Node.js 18+ (optional for local dev)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.10 (optional for local dev)
sudo apt install python3.10 python3.10-venv python3-pip -y

# Install Git
sudo apt install git -y
```

**Install Prerequisites (macOS):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install docker docker-compose node python@3.10 git
```

**Verify Installations:**
```bash
docker --version          # Should be 20.10+
docker compose version    # Should be 2.0+
node --version            # Should be 18+ (optional)
python3 --version         # Should be 3.10+ (optional)
git --version
```

---

## Quick Start

**Get running in under 5 minutes:**

```bash
# 1. Clone repository
git clone <repository-url>
cd medic-scribe-fullstack-ultimo

# 2. Setup environment files
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Start development environment
docker-compose -f docker-compose.local.yml up -d

# 4. Access application
# Application: http://localhost
# Backend API: http://localhost/api
# API Docs: http://localhost/api/docs
# Health Check: http://localhost/health
```

---

## Environment Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd medic-scribe-fullstack-ultimo

# Create development branch (optional)
git checkout -b development
```

### 2. Environment Configuration

**Copy and configure environment files:**
```bash
# For development
cp .env.example .env.local

# For production
cp .env.example .env.prod
```

**Edit `.env.local` for development:**
```bash
# Required API Keys
DEEPGRAM_API_KEY=your_deepgram_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (Local)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API URLs (Development)
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws

# Storage Paths (Development)
UPLOAD_FOLDER=./uploads
NOTES_FOLDER=./notes
```

**Edit `.env.prod` for production:**
```bash
# Required API Keys (Production)
DEEPGRAM_API_KEY=your_production_deepgram_api_key
OPENAI_API_KEY=your_production_openai_api_key

# Domain Configuration
DOMAIN=your-domain.com

# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# API URLs (Production)
VITE_API_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com/ws

# SSL Configuration
SSL_EMAIL=admin@your-domain.com

# Storage Paths (Production)
UPLOAD_FOLDER=/app/uploaded_audio
NOTES_FOLDER=/app/generated_notes
```

### 3. Docker Network Verification

```bash
# Verify Docker is running
docker --version
docker compose version

# Check available networks
docker network ls

# Verify Docker daemon is running
docker info
```

---

## Running Services

### Development Mode (Docker Compose)

**Start Development Environment:**
```bash
# Start all development services
docker-compose -f docker-compose.local.yml up -d

# Start with build (if Dockerfiles changed)
docker-compose -f docker-compose.local.yml up -d --build

# View logs for all services
docker-compose -f docker-compose.local.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
docker-compose -f docker-compose.local.yml logs -f nginx
```

**Individual Service Management (Development):**
```bash
# Start specific service
docker-compose -f docker-compose.local.yml up -d backend
docker-compose -f docker-compose.local.yml up -d frontend
docker-compose -f docker-compose.local.yml up -d nginx

# Restart specific service
docker-compose -f docker-compose.local.yml restart backend
docker-compose -f docker-compose.local.yml restart frontend
docker-compose -f docker-compose.local.yml restart nginx

# Stop specific service
docker-compose -f docker-compose.local.yml stop backend
docker-compose -f docker-compose.local.yml stop frontend
docker-compose -f docker-compose.local.yml stop nginx

# Remove service (with volumes)
docker-compose -f docker-compose.local.yml down -v
```

**Development Access Points:**
- **Application**: http://localhost
- **Backend API**: http://localhost/api
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/health
- **WebSocket**: ws://localhost/ws/

### Production Mode (Docker Compose)

**Start Production Environment:**
```bash
# Start all production services
docker-compose -f docker-compose.prod.yml up -d

# Start with build (if Dockerfiles changed)
docker-compose -f docker-compose.prod.yml up -d --build

# View logs for all services
docker-compose -f docker-compose.prod.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f certbot
```

**SSL Certificate Management (Production):**
```bash
# Generate SSL certificates (first time)
docker-compose -f docker-compose.prod.yml run --rm certbot

# Renew SSL certificates
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Force certificate renewal
docker-compose -f docker-compose.prod.yml run --rm certbot --force-renewal

# Restart nginx after certificate changes
docker-compose -f docker-compose.prod.yml restart nginx
```

**Individual Service Management (Production):**
```bash
# Start specific service
docker-compose -f docker-compose.prod.yml up -d backend
docker-compose -f docker-compose.prod.yml up -d frontend
docker-compose -f docker-compose.prod.yml up -d nginx

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart nginx

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop services and remove volumes
docker-compose -f docker-compose.prod.yml down -v
```

**Production Access Points:**
- **Application**: https://your-domain.com
- **Backend API**: https://your-domain.com/api
- **API Documentation**: https://your-domain.com/api/docs
- **Health Check**: https://your-domain.com/health
- **WebSocket**: wss://your-domain.com/ws/

### Local Development (Without Docker)

If you prefer to run services locally for development:

**Backend Setup:**
```bash
cd backend

# Create and activate virtual environment
python3.10 -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Runs on http://localhost:5173
```

**Supabase Local Setup:**
```bash
cd frontend

# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Start local Supabase
supabase start
# Dashboard: http://localhost:54323
# API URL: http://localhost:54321
```

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run tests (if configured)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npx tsc --noEmit

# Lint check
npm run lint
```

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run tests with pytest (if configured)
pytest

# Run tests with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_main.py

# Run tests in verbose mode
pytest -v
```

### API Endpoint Testing

**Test Backend Health:**
```bash
# Test root endpoint
curl http://localhost:8000/

# Test with authentication
curl -H "Authorization: Bearer your_token" http://localhost:8000/protected-endpoint
```

**Test Audio Transcription:**
```bash
# Test transcription endpoint
curl -X POST "http://localhost:8000/transcribe-and-summarize/" \
  -H "Content-Type: multipart/form-data" \
  -F "audio_file=@test_audio.wav" \
  -F "user_id=test_user" \
  -F "prompt_instruction=Generate SOAP note"
```

**Test WebSocket Connection:**
```bash
# Using websocat (install with: cargo install websocat)
websocat ws://localhost:8000/ws/test_user
```

### Database Connection Testing

```bash
cd frontend

# Test Supabase connection
supabase status

# Test database queries
supabase db reset --debug

# Run edge functions locally
supabase functions serve

# Test edge function
curl -X POST 'http://localhost:54321/functions/v1/transcribe-audio' \
  -H 'Authorization: Bearer your_anon_key' \
  -H 'Content-Type: application/json' \
  -d '{"audio_data": "base64_encoded_audio"}'
```

---

## Debugging

### View Logs

**Frontend Logs:**
```bash
# Development server logs
cd frontend && npm run dev

# Browser console logs (F12 in browser)
# Network tab for API calls
# Application tab for PWA/Service Worker
```

**Backend Logs:**
```bash
# Development server logs
cd backend && uvicorn app.main:app --reload --log-level debug

# Docker logs
docker-compose logs -f medical_scribe_api

# Follow logs in real-time
docker-compose logs -f --tail=100 medical_scribe_api
```

**Database Logs:**
```bash
cd frontend

# Supabase logs
supabase logs

# Database logs
supabase logs db

# Edge function logs
supabase logs functions
```

### Debug WebSocket Connections

**Test WebSocket Connectivity:**
```bash
# Using websocat
websocat ws://localhost:8000/ws/debug_user

# Using curl (HTTP upgrade)
curl -i -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  http://localhost:8000/ws/debug_user
```

**Debug WebSocket in Browser:**
```javascript
// Open browser console and run:
const ws = new WebSocket('ws://localhost:8000/ws/test_user');
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', event.data);
ws.onerror = (error) => console.log('Error:', error);
```

### Debug AI Integrations

**Test Deepgram API:**
```bash
# Test API key
curl -X GET "https://api.deepgram.com/v1/projects" \
  -H "Authorization: Token YOUR_DEEPGRAM_API_KEY"

# Test transcription
curl -X POST "https://api.deepgram.com/v1/listen" \
  -H "Authorization: Token YOUR_DEEPGRAM_API_KEY" \
  -H "Content-Type: audio/wav" \
  --data-binary @test_audio.wav
```

**Test OpenAI API:**
```bash
# Test API key
curl -X GET "https://api.openai.com/v1/models" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"

# Test completion
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Test message"}],
    "max_tokens": 100
  }'
```

### Common Troubleshooting Scenarios

**Port Already in Use:**
```bash
# Find process using port 8000
lsof -i :8000
# OR
netstat -tulpn | grep :8000

# Kill process
kill -9 <PID>

# Use different port
uvicorn app.main:app --port 8001
```

**Docker Issues:**
```bash
# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container status
docker-compose ps

# Enter container for debugging
docker-compose exec medical_scribe_api bash
```

**Python Virtual Environment Issues:**
```bash
# Remove and recreate venv
rm -rf venv
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Node.js Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use specific Node version
nvm use 18
```

---

## Production Deployment

### Docker Production Build

**Build and Deploy:**
```bash
# Build production images
cd backend
docker-compose build

# Start production stack
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost/
```

### SSL Certificate Setup

**Using Let's Encrypt with Certbot:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Test certificate renewal
sudo certbot renew --dry-run

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**Manual Certificate Setup:**
```bash
# Create certificates directory
sudo mkdir -p /etc/letsencrypt/live/your-domain.com

# Copy your certificates
sudo cp fullchain.pem /etc/letsencrypt/live/your-domain.com/
sudo cp privkey.pem /etc/letsencrypt/live/your-domain.com/

# Update nginx configuration
# Edit backend/nginx/nginx.conf with your domain
```

### Environment Variable Configuration

**Production Environment Setup:**
```bash
# Backend production environment
cd backend
cp .env.example .env.production

# Edit .env.production with production values
DEEPGRAM_API_KEY=prod_deepgram_key
OPENAI_API_KEY=prod_openai_key
UPLOAD_FOLDER=/app/uploaded_audio
NOTES_FOLDER=/app/generated_notes
```

**Frontend Production Build:**
```bash
cd frontend

# Build for production
npm run build

# Serve production build
npm run preview

# Deploy to static hosting
# Copy dist/ folder to your hosting provider
```

### Health Checks and Monitoring

**Setup Health Check Endpoints:**
```bash
# Test backend health
curl http://localhost:8000/

# Test with monitoring tools
curl -f http://localhost:8000/ || exit 1
```

**Docker Health Checks:**
Add to `docker-compose.yml`:
```yaml
services:
  medical_scribe_api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Monitoring Commands:**
```bash
# Monitor Docker containers
docker stats

# Monitor logs
docker-compose logs -f --tail=100

# Monitor system resources
htop
df -h
free -h
```

---

## Maintenance

### Backup Procedures

**Database Backup:**
```bash
cd frontend

# Backup Supabase database
supabase db dump --local > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres < backup_file.sql
```

**Application Data Backup:**
```bash
# Backup Docker volumes
docker run --rm -v backend_notes_data:/data -v $(pwd):/backup alpine tar czf /backup/notes_backup_$(date +%Y%m%d).tar.gz -C /data .

# Backup uploaded audio (if needed)
docker run --rm -v backend_uploaded_audio_data:/data -v $(pwd):/backup alpine tar czf /backup/audio_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Updates and Upgrades

**Update Dependencies:**
```bash
# Update frontend dependencies
cd frontend
npm update
npm audit fix

# Update backend dependencies
cd backend
source venv/bin/activate
pip list --outdated
pip install --upgrade package_name

# Update Docker images
docker-compose pull
docker-compose up -d
```

**Update Supabase:**
```bash
cd frontend

# Update Supabase CLI
npm update -g supabase

# Update local Supabase
supabase stop
supabase start
```

**System Updates:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt update docker-ce docker-ce-cli containerd.io

# Restart services after updates
docker-compose restart
```

### Monitoring and Alerts

**Log Rotation:**
```bash
# Setup logrotate for Docker logs
sudo nano /etc/logrotate.d/docker

# Add configuration:
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=1M
  missingok
  delaycompress
  copytruncate
}
```

**Disk Space Monitoring:**
```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a

# Clean old logs
sudo journalctl --vacuum-time=7d
```

**Performance Monitoring:**
```bash
# Monitor API performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/

# Monitor database performance
cd frontend && supabase logs db

# Monitor system resources
iostat -x 1
vmstat 1
```

---

## Quick Reference Commands

**Start Development Environment:**
```bash
# All in one terminal (using tmux/screen)
cd medic-scribe-fullstack-ultimo
tmux new-session -d -s medic-scribe
tmux send-keys -t medic-scribe:0 'cd backend && source venv/bin/activate && uvicorn app.main:app --reload' Enter
tmux split-window -t medic-scribe:0
tmux send-keys -t medic-scribe:1 'cd frontend && npm run dev' Enter
tmux split-window -t medic-scribe:1
tmux send-keys -t medic-scribe:2 'cd frontend && supabase start' Enter
tmux attach-session -t medic-scribe
```

**Stop All Services:**
```bash
# Stop Docker services
docker-compose down

# Stop Supabase
cd frontend && supabase stop

# Kill development servers
pkill -f "uvicorn"
pkill -f "vite"
```

**Emergency Reset:**
```bash
# Complete reset (WARNING: This will delete all data)
docker-compose down -v
docker system prune -a
cd frontend && supabase stop
rm -rf backend/venv
rm -rf frontend/node_modules
# Then follow setup instructions again
```

---

## Support and Troubleshooting

For additional support:
1. Check application logs first
2. Verify all environment variables are set
3. Ensure all services are running
4. Test API endpoints individually
5. Check network connectivity and firewall settings

**Common Error Solutions:**
- **Port conflicts**: Change ports in configuration files
- **Permission errors**: Check file permissions and Docker user
- **API key errors**: Verify API keys are valid and have correct permissions
- **Database connection errors**: Ensure Supabase is running and accessible
- **Build errors**: Clear caches and reinstall dependencies

This runbook should cover most operational scenarios for the Medic Scribe Fullstack application.