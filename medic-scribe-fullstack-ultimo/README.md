# Medical Scribe Fullstack

A comprehensive medical transcription and SOAP notes management platform designed for healthcare professionals. The system provides real-time audio transcription, intelligent SOAP note generation, and secure patient data management using modern containerized architecture.

## 🏗️ Architecture Overview

The application uses a containerized architecture with Docker Compose for both development and production environments:

- **Frontend**: React 18.3.1 + TypeScript + Vite (Multi-stage Docker build)
- **Backend**: FastAPI + Python 3.10 (WebSocket support for real-time updates)
- **Reverse Proxy**: Nginx (Environment-specific configurations)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Services**: Deepgram (Speech-to-Text) + OpenAI GPT-4.1 (SOAP generation)
- **SSL**: Let's Encrypt with automated renewal (Production)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (20.10+) and **Docker Compose** (2.0+)
- **Node.js** (18+) and **npm** (for local development)
- **Python** (3.10+) (for local development)
- **Git**

### Install Prerequisites

**Ubuntu/Debian:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.10
sudo apt install python3.10 python3.10-venv python3-pip -y
```

**macOS:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install docker docker-compose node python@3.10 git
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd medic-scribe-fullstack-ultimo
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
# For development
cp .env.example .env.local

# For production
cp .env.example .env.prod
```

**Required API Keys:**
- **Deepgram API Key**: Get from [Deepgram Console](https://console.deepgram.com/)
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Supabase Keys**: Get from your [Supabase Dashboard](https://supabase.com/dashboard)

### 3. Development Environment

Start the development environment with hot reload:

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f
```

**Access Points:**
- **Application**: http://localhost
- **Backend API**: http://localhost/api
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/health

### 4. Production Environment

For production deployment:

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Generate SSL certificates (first time only)
docker-compose -f docker-compose.prod.yml run --rm certbot

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 📁 Project Structure

```
medic-scribe-fullstack-ultimo/
├── docker-compose.local.yml    # Development environment
├── docker-compose.prod.yml     # Production environment
├── .env.local                  # Development variables
├── .env.prod                   # Production variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── nginx/
│   ├── nginx.local.conf       # Development nginx config
│   └── nginx.prod.conf        # Production nginx config (SSL)
├── frontend/
│   ├── Dockerfile             # Multi-stage frontend build
│   ├── package.json           # Node.js dependencies
│   ├── src/                   # React source code
│   └── public/                # Static assets
├── backend/
│   ├── Dockerfile             # Python backend container
│   ├── requirements.txt       # Python dependencies
│   ├── app/                   # FastAPI application
│   └── main.py               # Application entry point
└── docs/
    ├── ARCHITECTURE.md        # Technical architecture
    ├── ARQUITECTURA_DEPLOYMENT.md # Deployment procedures
    ├── RUNBOOK.md            # Operations manual
    └── TODO.md               # Project backlog
```

## 🔧 Configuration

### Environment Variables

The application uses environment-specific configuration files:

#### Development (`.env.local`)
```bash
# Environment
NODE_ENV=development
DOMAIN=localhost

# API Keys
DEEPGRAM_API_KEY=your_deepgram_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Supabase (Local)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API URLs
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

#### Production (`.env.prod`)
```bash
# Environment
NODE_ENV=production
DOMAIN=your-domain.com

# API Keys (Production)
DEEPGRAM_API_KEY=your_production_deepgram_api_key
OPENAI_API_KEY=your_production_openai_api_key

# Supabase (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# API URLs (HTTPS)
VITE_API_URL=https://your-domain.com/api
VITE_WS_URL=wss://your-domain.com/ws

# SSL Configuration
SSL_EMAIL=admin@your-domain.com
```

### Docker Network

The application uses a custom Docker network for service communication:

- **Network**: `medic_scribe_network` (172.20.0.0/16)
- **Backend**: 172.20.0.10:8000
- **Frontend**: 172.20.0.20:80
- **Nginx**: 172.20.0.30:80/443

## 🛠️ Development

### Local Development (Without Docker)

If you prefer to run services locally for development:

#### Backend Setup
```bash
cd backend

# Create virtual environment
python3.10 -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

The Docker containers use multi-stage builds for optimization:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Build specific service
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml build backend
```

## 🔍 Testing

### Health Checks

All containers include health checks:

```bash
# Check container health
docker-compose -f docker-compose.local.yml ps

# Manual health check
curl http://localhost/health
curl http://localhost/api/health
```

### API Testing

Test the API endpoints:

```bash
# Test transcription endpoint
curl -X POST "http://localhost/api/transcribe-and-summarize/" \
  -H "Content-Type: multipart/form-data" \
  -F "audio_file=@test_audio.wav" \
  -F "user_id=test_user" \
  -F "prompt_instruction=Generate SOAP note"

# Test WebSocket connection
# Using websocat: cargo install websocat
websocat ws://localhost/ws/test_user
```

## 📊 Monitoring

### Container Monitoring

```bash
# View container stats
docker stats

# View logs
docker-compose -f docker-compose.local.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
docker-compose -f docker-compose.local.yml logs -f nginx
```

### Resource Usage

```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Check volume usage
docker volume ls
```

## 🔒 Security

### SSL/TLS (Production)

The production environment includes automatic SSL certificate management:

```bash
# Generate certificates (first time)
docker-compose -f docker-compose.prod.yml run --rm certbot

# Renew certificates
docker-compose -f docker-compose.prod.yml run --rm certbot renew

# Restart nginx after certificate renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

### Security Features

- **HTTPS/WSS**: All communications encrypted in production
- **CORS**: Environment-specific CORS policies
- **Rate Limiting**: API rate limiting in production
- **Security Headers**: Comprehensive security headers via Nginx
- **Container Security**: Non-root users, minimal attack surface

## 🔄 Deployment

### Development Deployment

```bash
# Start development environment
docker-compose -f docker-compose.local.yml up -d

# Restart services
docker-compose -f docker-compose.local.yml restart

# Stop services
docker-compose -f docker-compose.local.yml down
```

### Production Deployment

```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Update production deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

## 🗄️ Backup & Recovery

### Data Backup

```bash
# Backup audio files
docker run --rm -v medic-scribe-fullstack-ultimo_medic_scribe_audio:/data \
  -v $(pwd):/backup alpine tar czf /backup/audio_backup_$(date +%Y%m%d).tar.gz -C /data .

# Backup generated notes
docker run --rm -v medic-scribe-fullstack-ultimo_medic_scribe_notes:/data \
  -v $(pwd):/backup alpine tar czf /backup/notes_backup_$(date +%Y%m%d).tar.gz -C /data .

# Backup SSL certificates
docker run --rm -v medic-scribe-fullstack-ultimo_letsencrypt_data:/data \
  -v $(pwd):/backup alpine tar czf /backup/ssl_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### Data Recovery

```bash
# Restore audio files
docker run --rm -v medic-scribe-fullstack-ultimo_medic_scribe_audio:/data \
  -v $(pwd):/backup alpine tar xzf /backup/audio_backup_YYYYMMDD.tar.gz -C /data

# Restore generated notes
docker run --rm -v medic-scribe-fullstack-ultimo_medic_scribe_notes:/data \
  -v $(pwd):/backup alpine tar xzf /backup/notes_backup_YYYYMMDD.tar.gz -C /data
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>
```

**Container Build Issues:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.local.yml build --no-cache
```

**SSL Certificate Issues:**
```bash
# Check certificate status
docker-compose -f docker-compose.prod.yml exec nginx ls -la /etc/nginx/ssl/

# Regenerate certificates
docker-compose -f docker-compose.prod.yml run --rm certbot --force-renewal
```

### Logs and Debugging

```bash
# View all logs
docker-compose -f docker-compose.local.yml logs

# Follow specific service logs
docker-compose -f docker-compose.local.yml logs -f backend

# Access container shell
docker-compose -f docker-compose.local.yml exec backend bash
docker-compose -f docker-compose.local.yml exec frontend sh
```

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Technical architecture and design decisions
- **[ARQUITECTURA_DEPLOYMENT.md](docs/ARQUITECTURA_DEPLOYMENT.md)**: Deployment procedures and configurations
- **[RUNBOOK.md](docs/RUNBOOK.md)**: Operations manual and troubleshooting
- **[TODO.md](docs/TODO.md)**: Project backlog and future enhancements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [documentation](#-documentation)
3. Check existing [issues](../../issues)
4. Create a new [issue](../../issues/new) if needed

## 🔗 Links

- **Deepgram**: [https://deepgram.com/](https://deepgram.com/)
- **OpenAI**: [https://openai.com/](https://openai.com/)
- **Supabase**: [https://supabase.com/](https://supabase.com/)
- **Docker**: [https://docker.com/](https://docker.com/)
- **React**: [https://reactjs.org/](https://reactjs.org/)
- **FastAPI**: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)