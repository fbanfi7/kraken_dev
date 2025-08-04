# Instrucciones para Testear la Integración Local de Escriba Médico

## Checklist Previo Detallado (Usando Docker)

### ✅ 1. Verificación del Backend (FastAPI)

- [ ] **Servicio corriendo**: El backend debe estar ejecutándose en `http://localhost:8000`
  ```bash
  docker-compose -f docker-compose.local.yml ps
  # Verificar que el servicio 'api' esté UP
  ```

- [ ] **Logs del backend**: Sin errores críticos
  ```bash
  docker-compose -f docker-compose.local.yml logs api
  ```

- [ ] **Endpoint accesible**: Probar documentación de la API
  ```bash
  curl http://localhost:8000/docs
  ```

### ✅ 2. Verificación del Frontend (React en Docker)

- [ ] **Servicio corriendo**: El frontend debe estar ejecutándose en `http://localhost:8080`
  ```bash
  docker-compose -f docker-compose.local.yml ps
  # Verificar que el servicio 'frontend' esté UP
  ```

- [ ] **Acceso desde navegador**: Abrir `http://localhost:8080`
  - [ ] La página se carga sin errores 404
  - [ ] No hay errores críticos en la consola del navegador (F12)

- [ ] **Logs del frontend**: Sin errores críticos
  ```bash
  docker-compose -f docker-compose.local.yml logs frontend
  ```

### ✅ 3. Verificación de Supabase Local

- [ ] **Supabase CLI instalado**: Verificar instalación via Homebrew
  ```bash
  supabase --version
  ```

- [ ] **Servicios de Supabase corriendo**: Todos los servicios UP
  ```bash
  supabase status
  # Verificar:
  # - API URL: http://127.0.0.1:54321
  # - Studio URL: http://127.0.0.1:54323
  ```

- [ ] **Supabase Studio accesible**: Abrir `http://127.0.0.1:54323`

---

## Enfoque con Docker: Usar Archivo .env

## Paso 1: Configurar Variables de Entorno con .env

### 1.1 Crear Archivo .env para Desarrollo Local

Crea un archivo `.env.local` en la raíz del proyecto (mismo nivel que docker-compose.local.yml):

```bash
# .env.local
# Variables para desarrollo local

# Backend API
VITE_API_URL=http://localhost:8000

# Supabase Local (usando host.docker.internal para acceso desde contenedor)
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Base de datos (si es necesario)
DATABASE_URL=postgresql://medic:medic123@db:5432/escriba
```

### 1.2 Modificar docker-compose.local.yml para Usar el .env

Edita `docker-compose.local.yml` para que use el archivo de entorno:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: medic
      POSTGRES_PASSWORD: medic123
      POSTGRES_DB: escriba
    ports:
      - "5432:5432"
    volumes:
      - pg_local:/var/lib/postgresql/data

  api:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - db
    volumes:
      - notes_data:/app/generated_notes
      - uploaded_audio_data:/app/uploaded_audio

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "8080:5173"
    env_file: .env.local  # Usar el archivo .env.local
    depends_on:
      - api

volumes:
  pg_local:
  notes_data:
  uploaded_audio_data:
```

### 1.3 Modificar el Cliente de Supabase para Usar Variables de Entorno

#### 🎯 **Finalidad de esta Modificación**

**Problema actual:**
Tu archivo `frontend/src/integrations/supabase/client.ts` tiene hardcodeadas las URLs y keys de la instancia de Supabase de producción:

```typescript
// Configuración actual (PRODUCCIÓN)
const SUPABASE_URL = "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";
```

**Objetivo de la modificación:**
- Hacer que el cliente de Supabase use tu instancia **local** en lugar de la de producción
- Permitir que el frontend se conecte a tu Supabase local (http://127.0.0.1:54321)
- Mantener la flexibilidad de usar diferentes configuraciones según el entorno
- Poder revertir fácilmente a la configuración de producción

#### 📝 **Cómo Realizar la Modificación**

**Paso 1: Hacer Backup del Archivo Original**
```bash
# IMPORTANTE: Hacer backup antes de modificar
cp frontend/src/integrations/supabase/client.ts frontend/src/integrations/supabase/client.original.ts
```

**Paso 2: Modificar el Archivo**
Edita `frontend/src/integrations/supabase/client.ts` y reemplaza todo el contenido con:

```typescript
// Este archivo es automáticamente generado. No lo edites directamente.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🔄 MODIFICACIÓN: Usar variables de entorno con fallback a producción
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";

// 🐛 DEBUG: Mostrar qué configuración se está usando (útil para verificar)
console.log('🔧 Supabase Client Configuration:', {
  url: SUPABASE_URL,
  keyPreview: SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...',
  isLocal: SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('host.docker.internal'),
  environment: import.meta.env.MODE || 'unknown'
});

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**Explicación de los cambios:**

1. **Variables de entorno con fallback:**
   ```typescript
   // ANTES (hardcodeado):
   const SUPABASE_URL = "https://cwbevytqwvrksygeixil.supabase.co";
   
   // DESPUÉS (flexible):
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cwbevytqwvrksygeixil.supabase.co";
   ```
   - Si existe `VITE_SUPABASE_URL` en el .env, la usa (desarrollo local)
   - Si no existe, usa la URL de producción (fallback)

2. **Debug console.log:**
   - Te permite ver en la consola del navegador qué configuración está usando
   - Útil para verificar que está tomando las variables correctas

#### 🔄 **Cómo Revertir la Modificación**

**Método 1: Usando el Backup**
```bash
# Restaurar desde el backup
cp frontend/src/integrations/supabase/client.original.ts frontend/src/integrations/supabase/client.ts

# Limpiar archivo de backup
rm frontend/src/integrations/supabase/client.original.ts
```

**Método 2: Restaurar Manualmente**
Si perdiste el backup, restaura el contenido original:

```typescript
// Contenido original a restaurar
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

#### ✅ **Qué Debería Ocurrir Si Funciona Bien**

**1. En la Consola del Navegador (F12 → Console):**
Deberías ver un mensaje como este:
```
🔧 Supabase Client Configuration: {
  url: "http://host.docker.internal:54321",
  keyPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  isLocal: true,
  environment: "development"
}
```

**Indicadores de éxito:**
- `url` muestra tu URL local (`host.docker.internal:54321`)
- `isLocal: true`
- `environment: "development"`

**2. En la Pestaña Network (F12 → Network):**
Cuando hagas login o cualquier operación de autenticación, deberías ver requests a:
- `http://host.docker.internal:54321/auth/v1/token` (para login)
- `http://host.docker.internal:54321/rest/v1/medico` (para obtener perfil)

**3. Comportamiento de la Aplicación:**
- La pantalla de login debería aparecer normalmente
- Al hacer login con el usuario de prueba (`test@local.dev`), debería funcionar
- No deberías ver errores de CORS o conexión
- La aplicación debería cargar el perfil del usuario correctamente

**4. En los Logs de Docker:**
```bash
docker-compose -f docker-compose.local.yml logs frontend
```
Deberías ver:
- El mensaje de configuración de Supabase
- Sin errores de conexión
- Requests exitosos a la API local

#### 🚨 **Señales de que Algo Está Mal**

**En la consola del navegador:**
```
🔧 Supabase Client Configuration: {
  url: "https://cwbevytqwvrksygeixil.supabase.co",  // ❌ Sigue usando producción
  isLocal: false  // ❌ No detecta configuración local
}
```

**Errores comunes:**
- `Failed to fetch` en requests de autenticación
- CORS errors
- `isLocal: false` en el debug

**Soluciones:**
1. Verificar que el archivo `.env.local` existe y tiene las variables correctas
2. Reconstruir el contenedor: `docker-compose -f docker-compose.local.yml build frontend`
3. Verificar que las variables se inyectan: `docker-compose -f docker-compose.local.yml exec frontend env | grep VITE_`

### 1.4 Reconstruir y Levantar los Contenedores

```bash
# Detener servicios actuales
docker-compose -f docker-compose.local.yml down

# Reconstruir el frontend con las nuevas variables
docker-compose -f docker-compose.local.yml build frontend

# Levantar todos los servicios
docker-compose -f docker-compose.local.yml up -d
```

### 1.5 Verificar que las Variables se Aplicaron

```bash
# Verificar que el contenedor frontend tenga las variables
docker-compose -f docker-compose.local.yml exec frontend env | grep VITE_

# Verificar logs del frontend para ver el debug de configuración
docker-compose -f docker-compose.local.yml logs frontend | grep "Supabase Client Configuration"
```

## Paso 2: Crear Usuario de Prueba en Supabase Studio

### 2.1 Acceder a Supabase Studio

Abre: http://127.0.0.1:54323

### 2.2 Crear Usuario de Prueba

1. Ve a "Authentication" → "Users"
2. Haz clic en "Add user"
3. Crear usuario:
   - Email: `test@local.dev`
   - Password: `test123456`
   - Email Confirm: `true` ✓

### 2.3 Verificar/Aplicar Migraciones de Base de Datos

```bash
# Aplicar migraciones si es necesario
supabase db reset
# O
supabase migration up
```

## Paso 3: Testear la Integración

### 3.1 Verificar Configuración

```bash
# Verificar que todos los servicios estén UP
docker-compose -f docker-compose.local.yml ps

# Verificar que el frontend esté usando la configuración local
docker-compose -f docker-compose.local.yml logs frontend | grep "Supabase Client Configuration"
```

### 3.2 Hacer Login

1. Abre http://localhost:8080
2. Usar credenciales:
   - Email: `test@local.dev`
   - Password: `test123456`

### 3.3 Probar Funcionalidad

Una vez logueado:

1. **Crear nota médica**
2. **Verificar llamadas al backend**:
   - F12 → Network tab
   - Buscar llamadas a `http://localhost:8000`
3. **Verificar logs en tiempo real**:
   ```bash
   docker-compose -f docker-compose.local.yml logs -f api frontend
   ```

## Paso 4: Scripts de Automatización

### 4.1 Script para Alternar Configuraciones

```bash
#!/bin/bash
# toggle-env-config.sh

if [ "$1" == "local" ]; then
    echo "Configurando para desarrollo local..."
    
    # Backup del cliente original
    if [ ! -f frontend/src/integrations/supabase/client.original.ts ]; then
        cp frontend/src/integrations/supabase/client.ts frontend/src/integrations/supabase/client.original.ts
    fi
    
    # Crear archivo .env.local
    cat > .env.local << EOF
# Variables para desarrollo local
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
DATABASE_URL=postgresql://medic:medic123@db:5432/escriba
EOF
    
    # Modificar cliente para usar variables de entorno
    cat > frontend/src/integrations/supabase/client.ts << 'EOF'
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";

console.log('🔧 Supabase Client Configuration:', {
  url: SUPABASE_URL,
  keyPreview: SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...',
  isLocal: SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('host.docker.internal'),
  environment: import.meta.env.MODE || 'unknown'
});

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
EOF
    
    echo "✅ Configuración local creada."
    echo "Ejecuta: docker-compose -f docker-compose.local.yml build frontend && docker-compose -f docker-compose.local.yml up -d"
    
elif [ "$1" == "prod" ]; then
    echo "Restaurando configuración de producción..."
    
    # Restaurar cliente original
    if [ -f frontend/src/integrations/supabase/client.original.ts ]; then
        cp frontend/src/integrations/supabase/client.original.ts frontend/src/integrations/supabase/client.ts
        rm frontend/src/integrations/supabase/client.original.ts
    fi
    
    # Remover archivo .env.local
    rm -f .env.local
    
    echo "✅ Configuración de producción restaurada."
    
else
    echo "Uso: ./toggle-env-config.sh [local|prod]"
    echo "  local: Configura para desarrollo local"
    echo "  prod:  Restaura configuración de producción"
fi
```

## Ventajas del Enfoque con .env

1. **Más limpio**: Variables separadas del docker-compose
2. **Versionable**: Puedes tener `.env.local` en `.gitignore`
3. **Flexible**: Fácil cambiar configuraciones sin tocar docker-compose
4. **Estándar**: Es la práctica recomendada
5. **Reversible**: Fácil alternar entre configuraciones

Este enfoque es mucho más profesional y mantenible.