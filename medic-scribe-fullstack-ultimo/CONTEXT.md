# Medic-Scribe-Fullstack-Ultimo - Project Context

## 🏥 Project Overview

**Medic-Scribe-Fullstack-Ultimo** is a comprehensive medical transcription and SOAP notes management system designed for healthcare professionals. The system enables doctors to record consultations, automatically transcribe audio using AI, and generate structured SOAP notes with intelligent assistance.

### Purpose
- **Primary Goal**: Streamline medical documentation workflow for healthcare professionals
- **Key Value**: Reduce administrative burden through AI-powered transcription and SOAP note generation
- **Target Users**: Medical doctors, specialists, and healthcare practitioners

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: Radix UI components with shadcn/ui
- **Styling**: Tailwind CSS 3.4.11 with custom design system
- **State Management**: React Query (@tanstack/react-query) + Context API
- **Routing**: React Router DOM 6.26.2
- **PWA**: vite-plugin-pwa with auto-update capabilities

### Backend
- **API Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn with WebSocket support
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL/TLS (Let's Encrypt)
- **Environment**: Python virtual environment with requirements.txt

### Database & Backend Services
- **Primary Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **Edge Functions**: Supabase Deno-based serverless functions
- **Real-time**: WebSocket notifications for AI processing updates

### AI & External Services
- **Speech-to-Text**: Deepgram API (Nova-2 model, Spanish language)
- **AI Text Generation**: OpenAI GPT-4.1 for SOAP note generation
- **Audio Processing**: RecordRTC for browser audio recording

## 🏗 Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Supabase Edge   │    │  FastAPI Backend│
│   (Vite + PWA)   │◄──►│    Functions     │◄──►│   + WebSocket   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Supabase DB    │    │   AI Services    │    │  Nginx Proxy    │
│  (PostgreSQL)   │    │ Deepgram+OpenAI │    │   SSL/TLS       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **Audio Recording**: Frontend captures audio using RecordRTC
2. **Transcription**: Supabase Edge Function sends audio to FastAPI backend
3. **AI Processing**: Backend uses Deepgram for transcription + OpenAI for SOAP generation
4. **Real-time Updates**: WebSocket notifications inform frontend of completion
5. **Data Persistence**: SOAP notes saved to Supabase with proper relationships

## 🗄 Database Schema

### Core Tables
- **`medico`**: Doctor profiles with specialties
- **`paciente`**: Patient information (name, document, coverage)
- **`medico_paciente`**: Many-to-many relationship between doctors and patients
- **`nota_soap`**: SOAP notes linked to doctor-patient relationships
- **`tipo_nota`**: Note types with custom prompts for AI generation
- **`user_profiles`**: Extended user information for authentication

### Key Relationships
```sql
medico ←→ medico_paciente ←→ paciente
                ↓
            nota_soap ←→ tipo_nota
```

### Security
- **Row Level Security (RLS)** enabled on all tables
- **JWT-based authentication** via Supabase Auth
- **User isolation** through `user_id` foreign keys

## 🚀 Key Features

### Core Functionality
- **Audio Recording & Transcription**: Browser-based audio capture with Deepgram AI transcription
- **AI-Powered SOAP Generation**: OpenAI GPT-4.1 generates structured medical notes
- **Patient Management**: Create, edit, and manage patient records
- **Consultation History**: Track all consultations and notes per patient
- **Real-time Notifications**: WebSocket updates during AI processing

### Advanced Features
- **PWA Support**: Installable app with offline capabilities and auto-updates
- **Responsive Design**: Mobile-first design with desktop optimization
- **Theme Support**: Light/dark mode toggle
- **Note Templates**: Customizable prompts for different consultation types
- **Digital Signatures**: Mark notes as reviewed and signed

## 📁 Project Structure

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── AuthPage.tsx    # Authentication interface
│   │   ├── SOAPEditor.tsx  # Main SOAP note editor
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.tsx     # Authentication logic
│   │   ├── useAudioRecording.ts # Audio recording functionality
│   │   └── ...
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── contexts/           # React context providers
│   └── pages/              # Route components
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── transcribe-audio/
│   │   ├── save-soap-note/
│   │   └── get-soap-notes/
│   └── migrations/         # Database schema migrations
└── public/                 # Static assets and PWA manifest
```

### Backend (`/backend`)
```
backend/
├── app/
│   ├── main.py            # FastAPI application entry point
│   └── core/
│       └── medical_processor.py # Medical data processing logic
├── nginx/
│   └── nginx.conf         # Reverse proxy configuration
├── docker-compose.yml     # Container orchestration
├── Dockerfile            # Python container definition
└── requirements.txt      # Python dependencies
```

## 🔧 Development Environment Setup

### Prerequisites
- **Node.js** 18+ with npm/yarn
- **Python** 3.10+
- **Docker** and Docker Compose
- **Supabase CLI** (optional, for local development)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                # Development server on http://localhost:5173
```

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run with Docker
docker-compose up --build
```

### Environment Variables
```bash
# Backend (.env)
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## 🔌 External Integrations

### Deepgram API
- **Purpose**: Speech-to-text transcription
- **Model**: Nova-2 with Spanish language support
- **Features**: Diarization, smart formatting, punctuation
- **Configuration**: Located in [`backend/app/main.py`](backend/app/main.py)

### OpenAI API
- **Purpose**: SOAP note generation from transcriptions
- **Model**: GPT-4.1 with medical-specific prompts
- **Parameters**: Temperature 0.2, max tokens 600
- **Customization**: Prompts stored in `tipo_nota` table

### Supabase Services
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: JWT-based user management
- **Edge Functions**: Serverless functions for AI processing
- **Storage**: File uploads and management (if needed)

## 🔄 Key Workflows

### Audio Transcription Workflow
1. User records audio in browser using RecordRTC
2. Audio sent to Supabase Edge Function (`transcribe-audio`)
3. Edge Function forwards to FastAPI backend
4. Backend processes with Deepgram → OpenAI
5. WebSocket notification sent to frontend
6. Generated SOAP note displayed in editor

### Patient Management Workflow
1. Doctor creates/selects patient
2. System creates `medico_paciente` relationship
3. SOAP notes linked to this relationship
4. Historical consultations tracked per patient

### Note Signing Workflow
1. Doctor reviews generated SOAP note
2. Manual edits marked with `editado: true`
3. Final approval sets `firmado: true`
4. Signed notes become read-only

## 🚀 Deployment

### Production Environment
- **Domain**: `scribe.krakenanalitics.space`
- **SSL**: Let's Encrypt certificates
- **Containers**: Docker Compose with Nginx reverse proxy
- **Database**: Hosted Supabase instance

### Deployment Commands
```bash
# Backend deployment
cd backend
docker-compose up -d --build

# Frontend deployment (typically via CI/CD)
cd frontend
npm run build
# Deploy dist/ to hosting service
```

## 🔐 Security Considerations

### Authentication & Authorization
- JWT tokens for API authentication
- Row Level Security (RLS) for data isolation
- User-specific data access patterns

### Data Privacy
- Medical data encryption at rest
- HTTPS/TLS for data in transit
- Audit trails for data access

### API Security
- CORS configuration for cross-origin requests
- Rate limiting on AI service endpoints
- Input validation and sanitization

## 📝 Development Notes

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Tailwind**: Custom design system in [`frontend/DESIGN_SPECIFICATION.md`](frontend/DESIGN_SPECIFICATION.md)

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user workflows

### Performance Considerations
- Audio processing in chunks to prevent memory issues
- Lazy loading for large patient lists
- Optimistic updates for better UX

---

## 🤝 Getting Started for New Developers

1. **Clone the repository** and review this CONTEXT.md
2. **Set up development environment** following the setup instructions
3. **Review the database schema** in [`frontend/supabase/migrations/`](frontend/supabase/migrations/)
4. **Understand the data flow** by examining the Edge Functions
5. **Start with small changes** to familiarize yourself with the codebase
6. **Test thoroughly** especially around medical data handling

For questions or clarifications, refer to the README files in each directory or consult the team lead.