# Guía de Implementación por Etapas - Escriba Médico

Esta guía documenta cómo implementar paso a paso las 3 etapas principales del proyecto Escriba Médico, desde el backend hasta la integración completa.

## 📋 Resumen de Etapas

- **Etapa 1**: Backend + PostgreSQL → http://localhost:8000
- **Etapa 2**: Frontend React → http://localhost:8080  
- **Etapa 3**: Integración Frontend-Backend (hacer que el frontend llame al backend)
- **Etapa 4**: Deploy con Kamal 2 en Digital Ocean *(fuera del scope de este documento)*

---

## 🚀 Etapa 1: Backend + PostgreSQL

### Objetivo
Tener el backend FastAPI funcionando con base de datos PostgreSQL en http://localhost:8000

### Prerrequisitos
- Docker y Docker Compose instalados
- Archivo `docker-compose.local.yml` configurado

### Pasos de Implementación

#### 1.1 Verificar Estructura del Backend

```bash
# Verificar que existan los archivos necesarios
ls -la backend/
# Debe contener:
# - Dockerfile
# - requirements.txt  
# - app/
# - .env.example
```

#### 1.2 Configurar Variables de Entorno del Backend

```bash
# Crear archivo .env desde el ejemplo
cp backend/.env.example backend/.env

# Editar el archivo .env con configuraciones locales
nano backend/.env
```

Contenido típico del `backend/.env`:
```bash
# Base de datos
DATABASE_URL=postgresql://medic:medic123@db:5432/escriba

# APIs externas
DEEPGRAM_API_KEY=tu_deepgram_api_key
OPENAI_API_KEY=tu_openai_api_key

# Configuración de la aplicación
DEBUG=True
CORS_ORIGINS=["http://localhost:8080"]
```

#### 1.3 Levantar los Servicios

```bash
# Levantar solo backend y base de datos
docker-compose -f docker-compose.local.yml up -d db api

# Verificar que estén corriendo
docker-compose -f docker-compose.local.yml ps
```

#### 1.4 Verificar que la Etapa 1 Funciona

```bash
# Probar endpoint de documentación
curl http://localhost:8000/docs

# Probar endpoint de salud (si existe)
curl http://localhost:8000/health

# Verificar logs del backend
docker-compose -f docker-compose.local.yml logs api
```

**✅ Criterios de Éxito para Etapa 1:**
- [ ] Backend responde en http://localhost:8000
- [ ] Documentación de FastAPI accesible en http://localhost:8000/docs
- [ ] Base de datos PostgreSQL conectada
- [ ] Sin errores críticos en los logs
- [ ] Endpoints básicos responden correctamente

#### 1.5 Solución de Problemas Comunes

**Problema: Puerto 8000 ocupado**
```bash
# Verificar qué proceso usa el puerto
lsof -i :8000
# Matar el proceso si es necesario
kill -9 <PID>
```

**Problema: Error de conexión a la base de datos**
```bash
# Verificar que el contenedor de DB esté corriendo
docker-compose -f docker-compose.local.yml logs db
# Verificar variables de entorno
docker-compose -f docker-compose.local.yml exec api env | grep DATABASE
```

---

## 🎨 Etapa 2: Frontend React

### Objetivo
Tener el frontend React funcionando en http://localhost:8080

### Prerrequisitos
- Etapa 1 completada
- Node.js y npm instalados (para desarrollo)
- Docker configurado para el frontend

### Pasos de Implementación

#### 2.1 Verificar Estructura del Frontend

```bash
# Verificar archivos del frontend
ls -la frontend/
# Debe contener:
# - Dockerfile.dev
# - package.json
# - src/
# - public/
```

#### 2.2 Configurar Variables de Entorno del Frontend

```bash
# Crear archivo de entorno para desarrollo
touch frontend/.env.local
```

Contenido de `frontend/.env.local`:
```bash
# API del backend
VITE_API_URL=http://localhost:8000

# Supabase (inicialmente usar producción)
VITE_SUPABASE_URL=https://cwbevytqwvrksygeixil.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4
```

#### 2.3 Actualizar docker-compose.local.yml

Asegurar que el servicio frontend esté configurado:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.dev
  ports:
    - "8080:5173"  # Mapear puerto del contenedor al host
  env_file: 
    - frontend/.env.local  # Cargar variables de entorno
  depends_on:
    - api
  volumes:
    - ./frontend:/app  # Para desarrollo con hot reload
    - /app/node_modules  # Evitar conflictos con node_modules
```

#### 2.4 Levantar el Frontend

```bash
# Construir y levantar el frontend
docker-compose -f docker-compose.local.yml build frontend
docker-compose -f docker-compose.local.yml up -d frontend

# Verificar que esté corriendo
docker-compose -f docker-compose.local.yml ps
```

#### 2.5 Verificar que la Etapa 2 Funciona

```bash
# Probar acceso al frontend
curl http://localhost:8080

# Verificar logs del frontend
docker-compose -f docker-compose.local.yml logs frontend
```

**En el navegador:**
1. Abrir http://localhost:8080
2. Verificar que la aplicación carga
3. Verificar que no hay errores críticos en la consola (F12)

**✅ Criterios de Éxito para Etapa 2:**
- [ ] Frontend accesible en http://localhost:8080
- [ ] Aplicación React carga correctamente
- [ ] Estilos CSS se aplican correctamente
- [ ] Sin errores críticos en la consola del navegador
- [ ] Hot reload funciona (si está en modo desarrollo)

#### 2.6 Solución de Problemas Comunes

**Problema: Puerto 8080 ocupado**
```bash
# Cambiar el puerto en docker-compose.local.yml
ports:
  - "3000:5173"  # Usar puerto 3000 en lugar de 8080
```

**Problema: Aplicación no carga**
```bash
# Verificar logs detallados
docker-compose -f docker-compose.local.yml logs -f frontend

# Verificar que las dependencias se instalaron
docker-compose -f docker-compose.local.yml exec frontend ls -la node_modules
```

**Problema: Hot reload no funciona**
```bash
# Verificar que el volumen esté montado correctamente
docker-compose -f docker-compose.local.yml exec frontend ls -la /app
```

---

## 🔗 Etapa 3: Integración Frontend-Backend

### Objetivo
Hacer que el frontend llame efectivamente al backend y que la autenticación funcione localmente

### Prerrequisitos
- Etapa 1 y 2 completadas
- Supabase local instalado y funcionando
- Usuario de prueba creado en Supabase

### Pasos de Implementación

#### 3.1 Configurar Supabase Local

```bash
# Verificar que Supabase esté corriendo
supabase status

# Si no está corriendo, iniciarlo
supabase start

# Verificar servicios disponibles
# - API URL: http://127.0.0.1:54321
# - Studio URL: http://127.0.0.1:54323
```

#### 3.2 Crear Usuario de Prueba

1. Abrir Supabase Studio: http://127.0.0.1:54323
2. Ir a Authentication → Users
3. Crear usuario:
   - Email: `test@local.dev`
   - Password: `test123456`
   - Email Confirm: ✓ true

#### 3.3 Configurar Frontend para Supabase Local

**Actualizar `.env.local` del frontend:**
```bash
# API del backend
VITE_API_URL=http://localhost:8000

# Supabase LOCAL (cambio importante)
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

#### 3.4 Modificar Cliente de Supabase

**Hacer backup del archivo original:**
```bash
cp frontend/src/integrations/supabase/client.ts frontend/src/integrations/supabase/client.original.ts
```

**Modificar `frontend/src/integrations/supabase/client.ts`:**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar variables de entorno con fallback
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";

// Debug para verificar configuración
console.log('🔧 Supabase Configuration:', {
  url: SUPABASE_URL,
  isLocal: SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('host.docker.internal')
});

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

#### 3.5 Configurar CORS en el Backend

**Verificar configuración CORS en `backend/app/main.py`:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Frontend local
        "http://127.0.0.1:8080",
        "http://host.docker.internal:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3.6 Reconstruir y Probar la Integración

```bash
# Reconstruir frontend con nueva configuración
docker-compose -f docker-compose.local.yml build frontend

# Reiniciar todos los servicios
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d

# Verificar logs
docker-compose -f docker-compose.local.yml logs -f
```

#### 3.7 Probar la Integración Completa

**Paso 1: Verificar Autenticación**
1. Abrir http://localhost:8080
2. Hacer login con `test@local.dev` / `test123456`
3. Verificar en consola del navegador que muestra configuración local

**Paso 2: Verificar Llamadas al Backend**
1. Abrir F12 → Network
2. Realizar acciones en la aplicación (crear nota, etc.)
3. Verificar que aparezcan requests a `http://localhost:8000`

**Paso 3: Verificar Logs del Backend**
```bash
# Monitorear logs del backend en tiempo real
docker-compose -f docker-compose.local.yml logs -f api
```

**✅ Criterios de Éxito para Etapa 3:**
- [ ] Login funciona con usuario local
- [ ] Frontend se conecta a Supabase local
- [ ] Frontend hace llamadas al backend local
- [ ] Backend recibe y procesa requests del frontend
- [ ] Sin errores de CORS
- [ ] Datos se persisten correctamente
- [ ] Flujo completo funciona end-to-end

#### 3.8 Casos de Prueba Específicos

**Caso 1: Autenticación**
```bash
# En la consola del navegador debería aparecer:
# 🔧 Supabase Configuration: { url: "http://host.docker.internal:54321", isLocal: true }
```

**Caso 2: Creación de Nota Médica**
1. Crear una nueva nota
2. Verificar request a backend: `POST http://localhost:8000/api/notes`
3. Verificar respuesta exitosa
4. Verificar que se guarda en la base de datos

**Caso 3: Transcripción de Audio**
1. Subir archivo de audio
2. Verificar request: `POST http://localhost:8000/api/transcribe`
3. Verificar que el backend procesa el audio
4. Verificar respuesta con transcripción

#### 3.9 Solución de Problemas de Integración

**Problema: Frontend no puede conectarse a Supabase local**
```bash
# Verificar conectividad desde el contenedor
docker-compose -f docker-compose.local.yml exec frontend ping host.docker.internal

# Si falla, usar IP del host
ip route show default | awk '/default/ {print $3}'
# Actualizar VITE_SUPABASE_URL con la IP real
```

**Problema: CORS errors**
```bash
# Verificar configuración CORS en backend
docker-compose -f docker-compose.local.yml logs api | grep -i cors

# Verificar que el origen esté permitido
curl -H "Origin: http://localhost:8080" -I http://localhost:8000/docs
```

**Problema: Requests no llegan al backend**
```bash
# Verificar que el backend esté accesible desde el frontend
docker-compose -f docker-compose.local.yml exec frontend curl http://api:8000/docs

# Verificar variables de entorno en el frontend
docker-compose -f docker-compose.local.yml exec frontend env | grep VITE_API_URL
```

---

## 🔄 Revertir Configuraciones

### Para Volver a Producción

```bash
# Restaurar cliente de Supabase original
cp frontend/src/integrations/supabase/client.original.ts frontend/src/integrations/supabase/client.ts

# Actualizar .env.local para producción
cat > frontend/.env.local << EOF
VITE_API_URL=https://tu-dominio-produccion.com/api
VITE_SUPABASE_URL=https://cwbevytqwvrksygeixil.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4
EOF

# Reconstruir frontend
docker-compose -f docker-compose.local.yml build frontend
```

---

## 📊 Checklist de Verificación Final

### Etapa 1 ✅
- [ ] Backend responde en http://localhost:8000
- [ ] Base de datos PostgreSQL conectada
- [ ] Documentación API accesible
- [ ] Logs sin errores críticos

### Etapa 2 ✅  
- [ ] Frontend accesible en http://localhost:8080
- [ ] Aplicación React carga correctamente
- [ ] Sin errores en consola del navegador
- [ ] Estilos aplicados correctamente

### Etapa 3 ✅
- [ ] Supabase local funcionando
- [ ] Usuario de prueba creado
- [ ] Login funciona localmente
- [ ] Frontend llama al backend
- [ ] Sin errores de CORS
- [ ] Flujo end-to-end completo

### Preparación para Etapa 4 (Deploy)
- [ ] Configuraciones locales documentadas
- [ ] Scripts de reversión probados
- [ ] Variables de producción identificadas
- [ ] Proceso de build verificado

---

## 🚀 Próximos Pasos

Una vez completadas las 3 etapas, estarás listo para:

1. **Etapa 4**: Deploy con Kamal 2 en Digital Ocean
2. **Optimizaciones**: Performance, seguridad, monitoreo
3. **Testing**: Pruebas automatizadas, testing de integración
4. **CI/CD**: Pipeline de despliegue automatizado

¡Felicitaciones por completar la integración local! 🎉