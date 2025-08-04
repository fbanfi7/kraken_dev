# Plan de Implementación Detallado y Trazable (CORREGIDO)
## Medic-Scribe-Fullstack-Ultimo: Testing Local y Deployment con Kamal 2

---

## 📋 Resumen Ejecutivo

Este plan proporciona una guía paso a paso para probar localmente el sistema medic-scribe-fullstack-ultimo y desplegarlo en producción usando Kamal 2 en Digital Ocean. El plan considera que **tanto el backend como el frontend corren en contenedores Docker**.

### Arquitectura Containerizada del Sistema
- **Frontend Container**: React 18.3.1 + TypeScript + Vite (build estático servido por Nginx)
- **Backend Container**: FastAPI + Python 3.10 + WebSocket
- **Nginx Container**: Reverse proxy + SSL termination + static file serving
- **Database**: Supabase (PostgreSQL) + Edge Functions (externo)
- **AI Services**: Deepgram + OpenAI (externos)

### Configuración Actual Detectada
```yaml
# docker-compose.yml actual
services:
  medical_scribe_api:    # Backend en contenedor
    build: .
    volumes:
      - notes_data:/app/generated_notes
      - uploaded_audio_data:/app/uploaded_audio
  
  nginx:                 # Reverse proxy
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    depends_on: [medical_scribe_api]
```

**PROBLEMA IDENTIFICADO**: El frontend no está containerizado y Nginx solo hace proxy al backend.

---

## 🎯 FASE 1: Preparación y Validación del Entorno Local

### Objetivos
- Verificar prerrequisitos del sistema
- Configurar variables de entorno
- Validar conectividad con servicios externos
- **Containerizar el frontend**

### Tareas Detalladas

#### 1.1 Verificación de Prerrequisitos del Sistema
```bash
# Verificar versiones requeridas
node --version    # Debe ser >= 18.0.0
python3 --version # Debe ser >= 3.10.0
docker --version  # Debe estar instalado
docker-compose --version
git --version
```

#### 1.2 Containerización del Frontend

**Crear Dockerfile para Frontend:**
```bash
cd frontend
cat > Dockerfile << 'EOF'
# Multi-stage build para optimizar
FROM node:18-alpine as builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY bun.lockb ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build

# Etapa de producción con Nginx
FROM nginx:alpine

# Copiar build al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
```

**Crear configuración de Nginx para Frontend:**
```bash
cd frontend
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Configuración para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración para PWA
    location /manifest.json {
        add_header Cache-Control "no-cache";
    }

    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
EOF
```

#### 1.3 Actualizar Docker Compose para Incluir Frontend

**Modificar `backend/docker-compose.yml`:**
```yaml
services:
  # Backend API
  medical_scribe_api:
    build: .
    container_name: medical_scribe_api
    restart: always
    env_file:
      - ./.env
    volumes:
      - notes_data:/app/generated_notes
      - uploaded_audio_data:/app/uploaded_audio
    networks:
      - medic_scribe_network

  # Frontend SPA
  medical_scribe_frontend:
    build: ../frontend
    container_name: medical_scribe_frontend
    restart: always
    networks:
      - medic_scribe_network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: medical_scribe_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx:/etc/nginx/conf.d:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/lib/letsencrypt:/var/lib/letsencrypt:ro
    depends_on:
      - medical_scribe_api
      - medical_scribe_frontend
    networks:
      - medic_scribe_network

volumes:
  notes_data:
  uploaded_audio_data:
  certbot_etc:
  certbot_var:
  webroot_data:

networks:
  medic_scribe_network:
    driver: bridge
```

#### 1.4 Actualizar Configuración de Nginx

**Modificar `backend/nginx/nginx.conf`:**
```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name scribe.krakenanalitics.space;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl;
    server_name scribe.krakenanalitics.space;

    ssl_certificate /etc/letsencrypt/live/scribe.krakenanalitics.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scribe.krakenanalitics.space/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Servir frontend estático
    location / {
        proxy_pass http://medical_scribe_frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints al backend
    location /api/ {
        proxy_pass http://medical_scribe_api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }

    # WebSocket para notificaciones en tiempo real
    location /ws/ {
        proxy_pass http://medical_scribe_api:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 1.5 Configuración de Variables de Entorno

**Backend Environment (.env):**
```bash
cd backend
cp .env.example .env

# Editar .env con valores reales
cat > .env << EOF
# API Keys (REEMPLAZAR CON VALORES REALES)
DEEPGRAM_API_KEY=your_deepgram_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Rutas de almacenamiento
UPLOAD_FOLDER=/app/uploaded_audio
NOTES_FOLDER=/app/generated_notes
EOF
```

**Frontend Environment (.env):**
```bash
cd frontend
cat > .env << EOF
# Configuración de Supabase
VITE_SUPABASE_URL=https://cwbevytqwvrksygeixil.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Backend URL (para desarrollo local)
VITE_API_URL=http://localhost/api
VITE_WS_URL=ws://localhost/ws
EOF
```

### Puntos de Verificación FASE 1
- [ ] Dockerfile del frontend creado
- [ ] docker-compose.yml actualizado con frontend
- [ ] Configuración de Nginx actualizada para servir frontend y API
- [ ] Variables de entorno configuradas
- [ ] Estructura de red Docker configurada

### Rollback Strategy FASE 1
Si hay problemas:
1. Revertir docker-compose.yml a versión anterior
2. Eliminar Dockerfile del frontend
3. Restaurar configuración original de Nginx
4. Verificar sintaxis de archivos de configuración

---

## 🔧 FASE 2: Testing Backend Local (Containerizado)

### Objetivos
- Probar backend en contenedor Docker
- Validar endpoints de la API
- Verificar integración con servicios AI
- Probar funcionalidad WebSocket

### Tareas Detalladas

#### 2.1 Build y Test del Backend Container

```bash
cd backend

# Build del contenedor backend
docker-compose build medical_scribe_api

# Verificar que la imagen se creó
docker images | grep medical_scribe

# Iniciar solo el backend para testing
docker-compose up medical_scribe_api
```

#### 2.2 Testing de Endpoints API

**Test Health Check:**
```bash
# Esperar a que el contenedor esté listo
sleep 10

# Test endpoint raíz (a través de la red Docker)
docker-compose exec medical_scribe_api curl http://localhost:8000/
```

**Test desde host (si se expone puerto temporalmente):**
```bash
# Modificar temporalmente docker-compose.yml para exponer puerto
# Agregar ports: ["8000:8000"] al servicio medical_scribe_api

docker-compose up -d medical_scribe_api

# Test desde host
curl http://localhost:8000/
```

#### 2.3 Testing de Audio Transcription

**Crear archivo de audio de prueba:**
```bash
# Crear audio simple para testing
echo "El paciente presenta dolor abdominal" | \
  espeak -s 150 -v es -w test_medical_audio.wav
```

**Test transcripción:**
```bash
curl -X POST "http://localhost:8000/transcribe-and-summarize/" \
  -F "audio_file=@test_medical_audio.wav" \
  -F "user_id=test_user_123" \
  -F "prompt_instruction=Genera una nota SOAP basada en esta transcripción médica"
```

#### 2.4 Testing WebSocket en Container

**Test WebSocket connection:**
```bash
# Usando websocat (instalar si no está disponible)
websocat ws://localhost:8000/ws/test_user_123

# O usando Node.js script
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8000/ws/test_user_123');
ws.on('open', () => console.log('Connected'));
ws.on('message', (data) => console.log('Message:', data.toString()));
ws.on('error', (error) => console.log('Error:', error));
"
```

#### 2.5 Verificar Volúmenes y Persistencia

```bash
# Verificar que los volúmenes se crean
docker volume ls | grep backend

# Inspeccionar contenido de volúmenes
docker-compose exec medical_scribe_api ls -la /app/generated_notes
docker-compose exec medical_scribe_api ls -la /app/uploaded_audio

# Verificar que los archivos persisten después de restart
docker-compose restart medical_scribe_api
docker-compose exec medical_scribe_api ls -la /app/generated_notes
```

### Puntos de Verificación FASE 2
- [ ] Backend container se construye sin errores
- [ ] Contenedor inicia correctamente
- [ ] Endpoint de salud responde
- [ ] Transcripción de audio funciona
- [ ] WebSocket se conecta correctamente
- [ ] Volúmenes persisten datos
- [ ] Logs del contenedor son accesibles

### Rollback Strategy FASE 2
Si hay problemas:
1. Verificar logs: `docker-compose logs medical_scribe_api`
2. Inspeccionar contenedor: `docker-compose exec medical_scribe_api bash`
3. Verificar variables de entorno: `docker-compose exec medical_scribe_api printenv`
4. Rebuild imagen: `docker-compose build --no-cache medical_scribe_api`
5. Verificar conectividad de red: `docker network ls`

---

## 🎨 FASE 3: Testing Frontend Local (Containerizado)

### Objetivos
- Construir contenedor del frontend
- Probar build de producción
- Validar funcionalidad PWA
- Verificar servicio de archivos estáticos

### Tareas Detalladas

#### 3.1 Build del Frontend Container

```bash
cd frontend

# Build del contenedor frontend
docker build -t medical_scribe_frontend .

# Verificar que la imagen se creó
docker images | grep medical_scribe_frontend

# Test del contenedor standalone
docker run -d -p 3000:80 --name test_frontend medical_scribe_frontend

# Verificar que sirve contenido
curl http://localhost:3000
```

#### 3.2 Testing con Docker Compose

```bash
cd backend

# Build todos los servicios
docker-compose build

# Iniciar frontend y verificar
docker-compose up -d medical_scribe_frontend

# Verificar logs
docker-compose logs medical_scribe_frontend

# Test acceso directo al frontend
curl http://localhost:3000  # Si se expone puerto temporalmente
```

#### 3.3 Verificar Build de Producción

```bash
# Inspeccionar contenido del contenedor
docker-compose exec medical_scribe_frontend ls -la /usr/share/nginx/html

# Verificar archivos principales
docker-compose exec medical_scribe_frontend ls -la /usr/share/nginx/html/assets

# Verificar configuración de Nginx
docker-compose exec medical_scribe_frontend cat /etc/nginx/conf.d/default.conf
```

#### 3.4 Testing PWA Functionality

**Verificar archivos PWA:**
```bash
# Verificar manifest.json
docker-compose exec medical_scribe_frontend cat /usr/share/nginx/html/manifest.json

# Verificar service worker
docker-compose exec medical_scribe_frontend ls -la /usr/share/nginx/html/sw.js

# Test headers de cache
curl -I http://localhost:3000/manifest.json
curl -I http://localhost:3000/sw.js
```

#### 3.5 Testing de Configuración SPA

**Test routing de SPA:**
```bash
# Verificar que rutas inexistentes redirigen a index.html
curl http://localhost:3000/nonexistent-route
curl http://localhost:3000/profile
curl http://localhost:3000/templates
```

### Puntos de Verificación FASE 3
- [ ] Frontend container se construye sin errores
- [ ] Build de producción se genera correctamente
- [ ] Nginx sirve archivos estáticos
- [ ] Routing de SPA funciona
- [ ] Archivos PWA están presentes
- [ ] Headers de cache configurados correctamente
- [ ] Contenedor es estable y reiniciable

### Rollback Strategy FASE 3
Si hay problemas:
1. Verificar logs: `docker-compose logs medical_scribe_frontend`
2. Inspeccionar build: `docker run -it medical_scribe_frontend sh`
3. Verificar build local: `npm run build` en frontend/
4. Revisar Dockerfile sintaxis
5. Verificar configuración de Nginx

---

## 🔗 FASE 4: Testing de Integración (Full Stack Containerizado)

### Objetivos
- Probar comunicación entre contenedores
- Validar flujo completo de transcripción
- Verificar proxy de Nginx
- Probar funcionalidad WebSocket a través del proxy

### Tareas Detalladas

#### 4.1 Iniciar Stack Completo

```bash
cd backend

# Iniciar todos los servicios
docker-compose up -d

# Verificar que todos los contenedores están corriendo
docker-compose ps

# Verificar logs de todos los servicios
docker-compose logs --tail=50
```

#### 4.2 Testing de Nginx Proxy

**Test Frontend a través de Nginx:**
```bash
# Test acceso al frontend (puerto 80 local)
curl -I http://localhost/

# Verificar que sirve index.html
curl http://localhost/ | grep -i "<!DOCTYPE html>"
```

**Test API a través de Nginx:**
```bash
# Test endpoint API a través del proxy
curl http://localhost/api/

# Debería devolver: {"message": "Bienvenido al Escriba Médico Asistido por IA!"}
```

**Test WebSocket a través de Nginx:**
```bash
# Test WebSocket connection a través del proxy
websocat ws://localhost/ws/test_user_123
```

#### 4.3 Testing de Comunicación Entre Contenedores

**Verificar conectividad de red:**
```bash
# Inspeccionar red Docker
docker network inspect backend_medic_scribe_network

# Test conectividad desde frontend a backend
docker-compose exec medical_scribe_frontend ping medical_scribe_api

# Test conectividad desde nginx a ambos servicios
docker-compose exec nginx ping medical_scribe_api
docker-compose exec nginx ping medical_scribe_frontend
```

#### 4.4 Testing End-to-End del Flujo de Transcripción

**Preparar archivo de audio:**
```bash
# Crear audio de prueba médico
echo "Paciente masculino de 45 años presenta dolor torácico opresivo de 2 horas de evolución" | \
  espeak -s 120 -v es -w medical_consultation.wav
```

**Test flujo completo:**
```bash
# 1. Subir audio a través del proxy Nginx
curl -X POST "http://localhost/api/transcribe-and-summarize/" \
  -F "audio_file=@medical_consultation.wav" \
  -F "user_id=integration_test_user" \
  -F "prompt_instruction=Genera una nota SOAP completa basada en esta consulta médica"

# 2. Verificar que se creó archivo en volumen
docker-compose exec medical_scribe_api ls -la /app/generated_notes/

# 3. Verificar logs de procesamiento
docker-compose logs medical_scribe_api | tail -20
```

#### 4.5 Testing de WebSocket en Tiempo Real

**Script de testing WebSocket:**
```bash
# Crear script de test
cat > test_websocket.js << 'EOF'
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost/ws/integration_test_user');

ws.on('open', function open() {
  console.log('WebSocket conectado a través de Nginx proxy');
});

ws.on('message', function message(data) {
  const parsed = JSON.parse(data);
  console.log('Mensaje recibido:', parsed);
  
  if (parsed.type === 'summary_ready') {
    console.log('✅ Nota SOAP recibida via WebSocket');
    process.exit(0);
  }
});

ws.on('error', function error(err) {
  console.error('Error WebSocket:', err);
  process.exit(1);
});

// Timeout después de 60 segundos
setTimeout(() => {
  console.log('❌ Timeout - No se recibió notificación');
  process.exit(1);
}, 60000);
EOF

# Ejecutar test
node test_websocket.js &

# En paralelo, enviar audio para procesamiento
sleep 2
curl -X POST "http://localhost/api/transcribe-and-summarize/" \
  -F "audio_file=@medical_consultation.wav" \
  -F "user_id=integration_test_user" \
  -F "prompt_instruction=Test WebSocket notification"
```

#### 4.6 Testing de Manejo de Errores

**Test error handling:**
```bash
# Test con archivo inválido
echo "not an audio file" > fake_audio.txt
curl -X POST "http://localhost/api/transcribe-and-summarize/" \
  -F "audio_file=@fake_audio.txt" \
  -F "user_id=error_test_user" \
  -F "prompt_instruction=This should fail"

# Verificar respuesta de error apropiada
```

**Test límites de archivo:**
```bash
# Crear archivo muy grande (>100MB según nginx config)
dd if=/dev/zero of=large_file.wav bs=1M count=150

curl -X POST "http://localhost/api/transcribe-and-summarize/" \
  -F "audio_file=@large_file.wav" \
  -F "user_id=size_test_user" \
  -F "prompt_instruction=Large file test"

# Debería fallar con error 413 (Request Entity Too Large)
```

### Puntos de Verificación FASE 4
- [ ] Todos los contenedores inician correctamente
- [ ] Nginx proxy funciona para frontend y API
- [ ] Comunicación entre contenedores operativa
- [ ] Flujo end-to-end de transcripción funciona
- [ ] WebSocket funciona a través del proxy
- [ ] Manejo de errores es apropiado
- [ ] Volúmenes persisten datos correctamente
- [ ] Logs son accesibles y útiles

### Rollback Strategy FASE 4
Si hay problemas:
1. Verificar logs de todos los servicios: `docker-compose logs`
2. Inspeccionar configuración de red: `docker network inspect`
3. Verificar configuración de Nginx: `docker-compose exec nginx nginx -t`
4. Test individual de cada servicio
5. Verificar variables de entorno en cada contenedor
6. Reiniciar servicios uno por uno

---

## 🚀 FASE 5: Preparación para Deployment con Kamal 2

### Objetivos
- Instalar y configurar Kamal 2
- Adaptar configuración Docker para producción
- Configurar registry de imágenes
- Preparar variables de entorno de producción

### Tareas Detalladas

#### 5.1 Instalación de Kamal 2

```bash
# Instalar Kamal 2
gem install kamal

# Verificar instalación
kamal version

# Inicializar configuración en el proyecto
cd medic-scribe-fullstack-ultimo
kamal init
```

#### 5.2 Configuración de Docker Registry

**Opción A: Docker Hub**
```bash
# Login a Docker Hub
docker login

# Tag imágenes para registry
docker tag medical_scribe_frontend your-dockerhub-username/medic-scribe-frontend:latest
docker tag medical_scribe_api your-dockerhub-username/medic-scribe-api:latest

# Push imágenes
docker push your-dockerhub-username/medic-scribe-frontend:latest
docker push your-dockerhub-username/medic-scribe-api:latest
```

**Opción B: Digital Ocean Container Registry**
```bash
# Instalar doctl
snap install doctl

# Autenticar
doctl auth init

# Crear registry
doctl registry create medic-scribe-registry

# Login al registry
doctl registry login

# Tag y push imágenes
docker tag medical_scribe_frontend registry.digitalocean.com/medic-scribe-registry/frontend:latest
docker tag medical_scribe_api registry.digitalocean.com/medic-scribe-registry/backend:latest

docker push registry.digitalocean.com/medic-scribe-registry/frontend:latest
docker push registry.digitalocean.com/medic-scribe-registry/backend:latest
```

#### 5.3 Configuración de Kamal para Multi-Container

**Crear `config/deploy.yml`:**
```yaml
service: medic-scribe
image: registry.digitalocean.com/medic-scribe-registry/backend

servers:
  web:
    hosts:
      - YOUR_DROPLET_IP
    labels:
      traefik.http.routers.medic-scribe.rule: Host(`scribe.krakenanalitics.space`)
      traefik.http.routers.medic-scribe.tls.certresolver: letsencrypt

registry:
  server: registry.digitalocean.com/medic-scribe-registry
  username: YOUR_DO_REGISTRY_USERNAME
  password:
    - KAMAL_REGISTRY_PASSWORD

# Configuración para múltiples servicios
accessories:
  frontend:
    image: registry.digitalocean.com/medic-scribe-registry/frontend:latest
    host: YOUR_DROPLET_IP
    port: 3000
    
  nginx:
    image: nginx:alpine
    host: YOUR_DROPLET_IP
    port: 80:80,443:443
    volumes:
      - "/etc/letsencrypt:/etc/letsencrypt:ro"
      - "./nginx-prod:/etc/nginx/conf.d:ro"

env:
  clear:
    PORT: 8000
  secret:
    - DEEPGRAM_API_KEY
    - OPENAI_API_KEY
    - SUPABASE_URL
    - SUPABASE_ANON_KEY

volumes:
  - "medic_scribe_notes:/app/generated_notes"
  - "medic_scribe_audio:/app/uploaded_audio"

healthcheck:
  path: /
  port: 8000
  max_attempts: 7
  interval: 20s
```

#### 5.4 Configuración de Nginx para Producción

**Crear `nginx-prod/nginx.conf`:**
```nginx
upstream backend {
    server medic-scribe-backend:8000;
}

upstream frontend {
    server medic-scribe-frontend:3000;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name scribe.krakenanalitics.space;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name scribe.krakenanalitics.space;

    ssl_certificate /etc/letsencrypt/live/scribe.krakenanalitics.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scribe.krakenanalitics.space/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (SPA)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
        
        # Timeouts para archivos grandes
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeouts
        proxy_read_timeout 86400;
    }
}
```

#### 5.5 Preparar Variables de Entorno de Producción

**Crear `.env.production`:**
```bash
# .env.production (NO COMMITEAR)
DEEPGRAM_API_KEY=prod_deepgram_key_here
OPENAI_API_KEY=prod_openai_key_here
SUPABASE_URL=https://cwbevytqwvrksygeixil.supabase.co
SUPABASE_ANON_KEY=prod_supabase_anon_key
UPLOAD_FOLDER=/app/uploaded_audio
NOTES_FOLDER=/app/generated_notes
```

**Configurar secretos en Kamal:**
```bash
# Configurar variables secretas
export DEEPGRAM_API_KEY="your_prod_key"
export OPENAI_API_KEY="your_prod_key"
export SUPABASE_URL="your_supabase_url"
export SUPABASE_ANON_KEY="your_supabase_key"

kamal env push
```

### Puntos de Verificación FASE 5
- [ ] Kamal 2 instalado y configurado
- [ ] Imágenes Docker subidas al registry
- [ ] Configuración de deploy.yml completa
- [ ] Nginx configurado para produc