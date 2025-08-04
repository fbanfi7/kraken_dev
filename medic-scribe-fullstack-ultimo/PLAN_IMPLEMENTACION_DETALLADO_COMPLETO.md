# Plan de Implementación Detallado y Trazable (COMPLETO)
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

---

## 🎯 FASE 1: Preparación y Validación del Entorno Local

### Objetivos
- Verificar prerrequisitos del sistema
- Configurar variables de entorno
- **Containerizar el frontend**
- Actualizar configuración Docker Compose

### Tareas Detalladas

#### 1.1 Containerización del Frontend

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

#### 1.2 Actualizar Docker Compose

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
    depends_on:
      - medical_scribe_api
      - medical_scribe_frontend
    networks:
      - medic_scribe_network

volumes:
  notes_data:
  uploaded_audio_data:

networks:
  medic_scribe_network:
    driver: bridge
```

### Puntos de Verificación FASE 1
- [ ] Dockerfile del frontend creado
- [ ] docker-compose.yml actualizado
- [ ] Variables de entorno configuradas
- [ ] Estructura de red Docker configurada

---

## 🔧 FASE 2: Testing Backend Local (Containerizado)

### Objetivos
- Probar backend en contenedor Docker
- Validar endpoints de la API
- Verificar integración con servicios AI

### Tareas Detalladas

#### 2.1 Build y Test del Backend Container

```bash
cd backend

# Build del contenedor backend
docker-compose build medical_scribe_api

# Iniciar solo el backend para testing
docker-compose up medical_scribe_api
```

#### 2.2 Testing de Endpoints API

```bash
# Test endpoint raíz
curl http://localhost:8000/

# Test transcripción con archivo de prueba
curl -X POST "http://localhost:8000/transcribe-and-summarize/" \
  -F "audio_file=@test_audio.wav" \
  -F "user_id=test_user_123" \
  -F "prompt_instruction=Genera una nota SOAP"
```

### Puntos de Verificación FASE 2
- [ ] Backend container se construye sin errores
- [ ] Endpoints responden correctamente
- [ ] Integración con AI services funciona
- [ ] WebSocket operativo

---

## 🎨 FASE 3: Testing Frontend Local (Containerizado)

### Objetivos
- Construir contenedor del frontend
- Probar build de producción
- Validar funcionalidad PWA

### Tareas Detalladas

#### 3.1 Build del Frontend Container

```bash
cd frontend

# Build del contenedor frontend
docker build -t medical_scribe_frontend .

# Test del contenedor standalone
docker run -d -p 3000:80 --name test_frontend medical_scribe_frontend
curl http://localhost:3000
```

### Puntos de Verificación FASE 3
- [ ] Frontend container se construye sin errores
- [ ] Build de producción se genera correctamente
- [ ] Nginx sirve archivos estáticos
- [ ] PWA funciona correctamente

---

## 🔗 FASE 4: Testing de Integración (Full Stack Containerizado)

### Objetivos
- Probar comunicación entre contenedores
- Validar flujo completo de transcripción
- Verificar proxy de Nginx

### Tareas Detalladas

#### 4.1 Iniciar Stack Completo

```bash
cd backend

# Iniciar todos los servicios
docker-compose up -d

# Verificar que todos los contenedores están corriendo
docker-compose ps
```

#### 4.2 Testing End-to-End

```bash
# Test frontend a través de Nginx
curl http://localhost/

# Test API a través de Nginx
curl http://localhost/api/

# Test WebSocket a través de Nginx
websocat ws://localhost/ws/test_user_123
```

### Puntos de Verificación FASE 4
- [ ] Todos los contenedores inician correctamente
- [ ] Nginx proxy funciona para frontend y API
- [ ] Flujo end-to-end de transcripción funciona
- [ ] WebSocket funciona a través del proxy

---

## 🚀 FASE 5: Preparación para Deployment con Kamal 2

### Objetivos
- Instalar y configurar Kamal 2
- Configurar registry de imágenes
- Preparar variables de entorno de producción

### Tareas Detalladas

#### 5.1 Instalación de Kamal 2

```bash
# Instalar Kamal 2
gem install kamal

# Verificar instalación
kamal version

# Inicializar configuración
cd medic-scribe-fullstack-ultimo
kamal init
```

#### 5.2 Configuración de Docker Registry

```bash
# Opción: Digital Ocean Container Registry
doctl registry create medic-scribe-registry
doctl registry login

# Tag y push imágenes
docker tag medical_scribe_frontend registry.digitalocean.com/medic-scribe-registry/frontend:latest
docker tag medical_scribe_api registry.digitalocean.com/medic-scribe-registry/backend:latest

docker push registry.digitalocean.com/medic-scribe-registry/frontend:latest
docker push registry.digitalocean.com/medic-scribe-registry/backend:latest
```

### Puntos de Verificación FASE 5
- [ ] Kamal 2 instalado y configurado
- [ ] Imágenes Docker subidas al registry
- [ ] Variables de entorno de producción configuradas

---

## ⚙️ FASE 6: Configuración Kamal 2

### Objetivos
- Configurar servidor de producción
- Configurar deployment multi-container
- Preparar SSL automático

### Tareas Detalladas

#### 6.1 Configuración de Kamal para Multi-Container

**Crear `config/deploy.yml`:**
```yaml
service: medic-scribe
image: registry.digitalocean.com/medic-scribe-registry/backend

servers:
  web:
    hosts:
      - YOUR_DROPLET_IP

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
```

#### 6.2 Configuración de Nginx para Producción

**Crear `nginx-prod/nginx.conf`:**
```nginx
upstream backend {
    server medic-scribe-backend:8000;
}

upstream frontend {
    server medic-scribe-frontend:3000;
}

server {
    listen 80;
    server_name scribe.krakenanalitics.space;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name scribe.krakenanalitics.space;

    ssl_certificate /etc/letsencrypt/live/scribe.krakenanalitics.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scribe.krakenanalitics.space/privkey.pem;

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
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Puntos de Verificación FASE 6
- [ ] Configuración de deploy.yml completa
- [ ] Nginx configurado para producción
- [ ] SSL configurado correctamente
- [ ] Accessories configurados para multi-container

---

## 🌐 FASE 7: Deployment en Digital Ocean

### Objetivos
- Crear y configurar droplet
- Ejecutar deployment con Kamal
- Configurar SSL automático
- Verificar servicios en producción

### Tareas Detalladas

#### 7.1 Crear Droplet en Digital Ocean

```bash
# Crear droplet
doctl compute droplet create medic-scribe-prod \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID \
  --enable-monitoring

# Obtener IP del droplet
doctl compute droplet list
```

#### 7.2 Configurar DNS

```bash
# Crear registro A para el dominio
doctl compute domain records create krakenanalitics.space \
  --record-type A \
  --record-name scribe \
  --record-data YOUR_DROPLET_IP \
  --record-ttl 300
```

#### 7.3 Deployment con Kamal

```bash
# Setup inicial del servidor
kamal setup

# Deploy de la aplicación
kamal deploy

# Verificar deployment
kamal app logs
kamal accessory logs nginx
kamal accessory logs frontend
```

#### 7.4 Configurar SSL con Let's Encrypt

```bash
# SSH al servidor
ssh root@YOUR_DROPLET_IP

# Instalar certbot
apt update && apt install certbot python3-certbot-nginx -y

# Generar certificados
certbot --nginx -d scribe.krakenanalitics.space

# Configurar auto-renovación
crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Puntos de Verificación FASE 7
- [ ] Droplet creado y accesible
- [ ] DNS configurado correctamente
- [ ] Deployment exitoso con Kamal
- [ ] SSL configurado y funcionando
- [ ] Todos los servicios corriendo

---

## ✅ FASE 8: Validación en Producción

### Objetivos
- Verificar funcionalidad completa en producción
- Probar performance y escalabilidad
- Configurar monitoreo y alertas
- Documentar procedimientos operativos

### Tareas Detalladas

#### 8.1 Testing Funcional en Producción

```bash
# Test acceso HTTPS
curl -I https://scribe.krakenanalitics.space/

# Test API endpoints
curl https://scribe.krakenanalitics.space/api/

# Test WebSocket
websocat wss://scribe.krakenanalitics.space/ws/prod_test_user
```

#### 8.2 Testing de Performance

```bash
# Test de carga con Apache Bench
ab -n 100 -c 10 https://scribe.krakenanalitics.space/

# Test de transcripción con archivo real
curl -X POST "https://scribe.krakenanalitics.space/api/transcribe-and-summarize/" \
  -F "audio_file=@production_test_audio.wav" \
  -F "user_id=prod_test_user" \
  -F "prompt_instruction=Test de producción"
```

#### 8.3 Configuración de Monitoreo

```bash
# Configurar health checks
kamal app exec 'curl -f http://localhost:8000/ || exit 1'

# Configurar alertas básicas
# Crear script de monitoreo
cat > /root/health_check.sh << 'EOF'
#!/bin/bash
if ! curl -f https://scribe.krakenanalitics.space/ > /dev/null 2>&1; then
  echo "ALERT: Medic Scribe is down!" | mail -s "Service Alert" admin@krakenanalitics.space
fi
EOF

chmod +x /root/health_check.sh

# Agregar a crontab
echo "*/5 * * * * /root/health_check.sh" | crontab -
```

#### 8.4 Backup y Recovery

```bash
# Configurar backup de volúmenes
kamal app exec 'tar -czf /tmp/notes_backup_$(date +%Y%m%d).tar.gz /app/generated_notes'

# Script de backup automático
cat > /root/backup_script.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
kamal app exec "tar -czf /tmp/backup_$DATE.tar.gz /app/generated_notes /app/uploaded_audio"
# Copiar backup a almacenamiento externo
EOF
```

#### 8.5 Documentación Operativa

**Crear runbook de producción:**
```markdown
# Runbook de Producción - Medic Scribe

## Comandos Esenciales

### Deployment
- Deploy: `kamal deploy`
- Rollback: `kamal rollback [VERSION]`
- Logs: `kamal app logs`

### Monitoreo
- Status: `kamal app details`
- Health: `curl https://scribe.krakenanalitics.space/api/`
- Containers: `kamal app exec 'docker ps'`

### Troubleshooting
- Restart: `kamal app restart`
- Shell access: `kamal app exec bash`
- Nginx logs: `kamal accessory logs nginx`

### Backup
- Manual backup: `/root/backup_script.sh`
- Restore: `kamal app exec 'tar -xzf /tmp/backup_file.tar.gz'`
```

### Puntos de Verificación FASE 8
- [ ] Aplicación accesible vía HTTPS
- [ ] Todas las funcionalidades operativas
- [ ] Performance aceptable bajo carga
- [ ] Monitoreo configurado
- [ ] Backups automatizados
- [ ] Documentación operativa completa

### Métricas de Éxito Final
- ✅ Tiempo de respuesta API < 2 segundos
- ✅ Transcripción de audio funciona end-to-end
- ✅ WebSocket notificaciones en tiempo real
- ✅ PWA instalable y funcional
- ✅ SSL A+ rating en SSL Labs
- ✅ Uptime > 99.9%
- ✅ Backup automático funcionando

---

## 🔄 Estrategias de Rollback por Fase

### Rollback FASE 1-4 (Local)
```bash
# Revertir cambios Docker
git checkout HEAD~1 -- backend/docker-compose.yml
git checkout HEAD~1 -- frontend/Dockerfile
docker-compose down && docker-compose up -d
```

### Rollback FASE 5-6 (Configuración)
```bash
# Revertir configuración Kamal
git checkout HEAD~1 -- config/deploy.yml
kamal config validate
```

### Rollback FASE 7-8 (Producción)
```bash
# Rollback automático con Kamal
kamal rollback [PREVIOUS_VERSION]

# Rollback manual
kamal app stop
kamal deploy --version [STABLE_VERSION]
```

---

## 📊 Sistema de Trazabilidad

### Logging y Auditoría
- **Logs de aplicación**: Centralizados en `/var/log/medic-scribe/`
- **Logs de deployment**: Kamal mantiene historial automático
- **Logs de acceso**: Nginx access logs con rotación
- **Métricas de performance**: Integración con herramientas de monitoreo

### Checkpoints de Validación
Cada fase incluye checkpoints específicos que deben completarse antes de avanzar:
- ✅ = Completado exitosamente
- ⚠️ = Completado con advertencias
- ❌ = Falló, requiere corrección

### Documentación de Decisiones
- Todas las decisiones arquitectónicas documentadas
- Cambios de configuración versionados en Git
- Procedimientos de emergencia documentados
- Contactos y escalación definidos

---

## 🎯 Conclusión

Este plan proporciona una ruta clara y trazable para:

1. **Testing Local Completo**: Validación exhaustiva en entorno containerizado
2. **Deployment Automatizado**: Uso de Kamal 2 para deployment consistente
3. **Producción Robusta**: Configuración enterprise-ready con SSL, monitoreo y backups
4. **Operaciones Sostenibles**: Documentación y procedimientos para mantenimiento

**Tiempo Estimado Total**: 2-3 días de trabajo
**Prerrequisitos**: Conocimiento básico de Docker, acceso a Digital Ocean, API keys configuradas

El plan es **ejecutable paso a paso**, **trazable con checkpoints claros**, y **reversible** en caso de problemas.