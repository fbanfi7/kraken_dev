#!/bin/bash

# Escriba Médico MCP Server Quick Start Script
# This script provides a fast way to get the MCP server architecture up and running

set -e

echo "🚀 Escriba Médico MCP Server Quick Start"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}📋 Checking prerequisites...${NC}"
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("nodejs")
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        missing_deps+=("python3")
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Please install the missing dependencies and run this script again.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites are installed${NC}"
}

# Function to setup environment
setup_environment() {
    echo -e "${BLUE}🔧 Setting up environment...${NC}"
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}📝 Creating .env.local file...${NC}"
        cat > .env.local << 'EOF'
# ===========================================
# MCP SERVER DEVELOPMENT CONFIGURATION
# ===========================================

# Existing Configuration
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Database Configuration
DATABASE_URL=postgresql://medic:medic123@db:5432/escriba
POSTGRES_USER=medic
POSTGRES_PASSWORD=medic123
POSTGRES_DB=escriba

# External APIs (replace with your actual keys)
DEEPGRAM_API_KEY=your_deepgram_api_key_dev
OPENAI_API_KEY=your_openai_api_key_dev
ANTHROPIC_API_KEY=your_anthropic_api_key_dev

# MCP Server Configuration
MCP_GATEWAY_URL=http://localhost:3000
MCP_AUDIO_PROCESSING_URL=http://localhost:3001
MCP_MEDICAL_TEXT_ANALYSIS_URL=http://localhost:3002
MCP_SOAP_GENERATION_URL=http://localhost:3003
MCP_DEVELOPMENT_WORKFLOW_URL=http://localhost:3004
MCP_PATIENT_DATA_MANAGEMENT_URL=http://localhost:3005
MCP_CLINICAL_DECISION_SUPPORT_URL=http://localhost:3006

# Security Configuration
ENCRYPTION_KEY=dev-encryption-key-2024
JWT_SECRET=dev-jwt-secret-key
AUDIT_ENABLED=true
HIPAA_COMPLIANCE_MODE=development

# Performance Configuration
CACHE_ENABLED=true
REDIS_URL=redis://localhost:6379
LOG_LEVEL=debug

# Development Features
MOCK_DATA_ENABLED=true
TESTING_MODE=true
DEBUG=true
EOF
        echo -e "${GREEN}✅ Created .env.local file${NC}"
        echo -e "${YELLOW}⚠️  Please update the API keys in .env.local with your actual values${NC}"
    else
        echo -e "${GREEN}✅ .env.local already exists${NC}"
    fi
    
    # Create necessary directories
    echo -e "${BLUE}📁 Creating project directories...${NC}"
    mkdir -p mcp-servers/{gateway,audio-processing,medical-text-analysis,soap-generation,development-workflow,patient-data-management,clinical-decision-support}
    mkdir -p scripts logs data
    
    echo -e "${GREEN}✅ Project structure created${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Backend dependencies
    if [ -f "backend/requirements.txt" ]; then
        echo -e "${BLUE}Installing Python dependencies...${NC}"
        cd backend
        python3 -m pip install --user -r requirements.txt
        cd ..
        echo -e "${GREEN}✅ Python dependencies installed${NC}"
    fi
    
    # Frontend dependencies
    if [ -f "frontend/package.json" ]; then
        echo -e "${BLUE}Installing Node.js dependencies...${NC}"
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
    fi
}

# Function to setup MCP servers
setup_mcp_servers() {
    echo -e "${BLUE}🎛️  Setting up MCP servers...${NC}"
    
    # Check if KiloCode is available
    if command -v kilocode &> /dev/null; then
        echo -e "${BLUE}🤖 Using KiloCode to generate MCP servers...${NC}"
        
        # Create KiloCode config if it doesn't exist
        if [ ! -f ".kilocode/mcp-config.yaml" ]; then
            mkdir -p .kilocode
            cat > .kilocode/mcp-config.yaml << 'EOF'
project:
  name: "escriba-medico-mcp"
  type: "medical-ai"
  compliance: "hipaa"

mcp_servers:
  audio_processing:
    port: 3001
    capabilities: ["audio_enhancement", "speaker_identification", "quality_assessment"]
    security_level: "high"
    
  medical_text_analysis:
    port: 3002
    capabilities: ["terminology_validation", "entity_extraction", "icd10_coding"]
    security_level: "maximum"
    
  soap_generation:
    port: 3003
    capabilities: ["note_generation", "template_management", "quality_scoring"]
    security_level: "high"
    
  development_workflow:
    port: 3004
    capabilities: ["environment_setup", "testing", "compliance_checking"]
    security_level: "medium"
    
  patient_data_management:
    port: 3005
    capabilities: ["data_anonymization", "audit_logging", "privacy_validation"]
    security_level: "maximum"
    
  clinical_decision_support:
    port: 3006
    capabilities: ["differential_diagnosis", "treatment_recommendations", "risk_assessment"]
    security_level: "high"

templates:
  base_server: "mcp-medical-server-template"
  security: "hipaa-compliant-template"
  testing: "medical-testing-template"
EOF
        fi
        
        kilocode generate mcp-servers --config=.kilocode/mcp-config.yaml
        echo -e "${GREEN}✅ MCP servers generated with KiloCode${NC}"
    else
        echo -e "${YELLOW}⚠️  KiloCode not found. Creating basic MCP server structure...${NC}"
        
        # Create basic structure for each MCP server
        servers=("audio-processing" "medical-text-analysis" "soap-generation" "development-workflow" "patient-data-management" "clinical-decision-support")
        
        for server in "${servers[@]}"; do
            server_dir="mcp-servers/$server"
            
            # Create basic package.json
            if [ ! -f "$server_dir/package.json" ]; then
                cat > "$server_dir/package.json" << EOF
{
  "name": "@escriba-medico/$server-mcp",
  "version": "1.0.0",
  "description": "$server MCP server for escriba-medico",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
EOF
            fi
            
            # Create basic Dockerfile
            if [ ! -f "$server_dir/Dockerfile" ]; then
                cat > "$server_dir/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
EOF
            fi
            
            # Create src directory and basic index.ts
            mkdir -p "$server_dir/src"
            if [ ! -f "$server_dir/src/index.ts" ]; then
                cat > "$server_dir/src/index.ts" << 'EOF'
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    capabilities: []
  });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
  res.json({ status: 'ready' });
});

app.listen(port, () => {
  console.log(`MCP Server running on port ${port}`);
});
EOF
            fi
        done
        
        echo -e "${GREEN}✅ Basic MCP server structure created${NC}"
    fi
}

# Function to start services
start_services() {
    echo -e "${BLUE}🌟 Starting services...${NC}"
    
    # Check if docker-compose.mcp.yml exists
    if [ ! -f "docker-compose.mcp.yml" ]; then
        echo -e "${YELLOW}⚠️  docker-compose.mcp.yml not found. Using existing docker-compose.local.yml...${NC}"
        
        if [ -f "docker-compose.local.yml" ]; then
            # Start the services with existing compose file
            echo -e "${BLUE}Starting Docker services...${NC}"
            docker-compose -f docker-compose.local.yml up -d
        else
            echo -e "${RED}❌ No Docker Compose file found. Please check the setup guide.${NC}"
            exit 1
        fi
    else
        # Start the services with MCP compose file
        echo -e "${BLUE}Starting Docker services...${NC}"
        docker-compose -f docker-compose.mcp.yml up -d
    fi
    
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 30
    
    echo -e "${GREEN}✅ Services started${NC}"
}

# Function to run health checks
run_health_checks() {
    echo -e "${BLUE}🏥 Running health checks...${NC}"
    
    # Define services and their ports
    declare -A services=(
        ["Frontend"]="8080"
        ["Backend API"]="8000"
        ["PostgreSQL"]="5432"
        ["Redis"]="6379"
    )
    
    local failed_services=0
    
    for service in "${!services[@]}"; do
        port=${services[$service]}
        
        if [ "$service" == "PostgreSQL" ] || [ "$service" == "Redis" ]; then
            # For database services, just check if port is open
            if nc -z localhost $port 2>/dev/null; then
                echo -e "${GREEN}✅ $service (port $port): Online${NC}"
            else
                echo -e "${RED}❌ $service (port $port): Offline${NC}"
                ((failed_services++))
            fi
        else
            # For HTTP services, check health endpoint
            if curl -s -f "http://localhost:$port/health" > /dev/null 2>&1 || curl -s -f "http://localhost:$port" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $service (port $port): Online${NC}"
            else
                echo -e "${RED}❌ $service (port $port): Offline${NC}"
                ((failed_services++))
            fi
        fi
    done
    
    if [ $failed_services -eq 0 ]; then
        echo -e "${GREEN}🎉 All core services are healthy!${NC}"
    else
        echo -e "${YELLOW}⚠️  Some services are offline. Check the logs for details.${NC}"
        echo -e "${BLUE}💡 Run 'docker-compose logs' to see detailed logs${NC}"
    fi
}

# Function to display final information
display_final_info() {
    echo ""
    echo -e "${GREEN}🎉 Quick Start Complete!${NC}"
    echo "========================================"
    echo ""
    echo -e "${BLUE}📍 Service URLs:${NC}"
    echo "  🌐 Frontend: http://localhost:8080"
    echo "  🔧 Backend API: http://localhost:8000"
    echo "  🗄️  PostgreSQL: localhost:5432"
    echo "  🔴 Redis: localhost:6379"
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo "  1. Update API keys in .env.local"
    echo "  2. Review the MCP-SERVER-SETUP-GUIDE.md for detailed configuration"
    echo "  3. Run tests: npm test (in frontend/backend directories)"
    echo "  4. Check logs: docker-compose logs"
    echo ""
    echo -e "${BLUE}🛠️  Useful Commands:${NC}"
    echo "  • View logs: docker-compose logs -f"
    echo "  • Stop services: docker-compose down"
    echo "  • Restart services: docker-compose restart"
    echo "  • Health check: curl http://localhost:8000/health"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "  • This is a development setup. For production, follow the production deployment guide."
    echo "  • Make sure to update API keys before using external services."
    echo "  • Review security settings before deploying to production."
}

# Main execution
main() {
    echo -e "${BLUE}Starting Escriba Médico MCP Server Quick Start...${NC}"
    echo ""
    
    check_prerequisites
    setup_environment
    install_dependencies
    setup_mcp_servers
    start_services
    run_health_checks
    display_final_info
    
    echo ""
    echo -e "${GREEN}✅ Quick start completed successfully!${NC}"
}

# Run main function
main "$@"