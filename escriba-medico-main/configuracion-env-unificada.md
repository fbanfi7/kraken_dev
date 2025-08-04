# Configuración Unificada de Variables de Entorno

## 🎯 Objetivo
Tener solo **DOS archivos de configuración** en la raíz del proyecto:
- `.env.local` - Para desarrollo local
- `.env.prod` - Para producción

## 📁 Estructura Propuesta

```
escriba-medico-main/
├── .env.local          # ← Variables para desarrollo local
├── .env.prod           # ← Variables para producción
├── docker-compose.local.yml
├── backend/
│   ├── .env            # ← ELIMINAR (mover variables a .env.local)
│   └── .env.example    # ← MANTENER (como referencia)
└── frontend/
    ├── .emv            # ← ELIMINAR (mover variables a .env.local)
    └── src/
```

## 🔧 Implementación

### Paso 1: Crear .env.local (Desarrollo Local)

```bash
# Crear archivo .env.local en la raíz del proyecto
cat > .env.local << 'EOF'
# ===========================================
# CONFIGURACIÓN PARA DESARROLLO LOCAL
# ===========================================

# Backend API
VITE_API_URL=http://localhost:8000

# Supabase Local
VITE_SUPABASE_URL=http://host.docker.internal:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Base de datos PostgreSQL
DATABASE_URL=postgresql://medic:medic123@db:5432/escriba
POSTGRES_USER=medic
POSTGRES_PASSWORD=medic123
POSTGRES_DB=escriba

# APIs externas (usar keys de desarrollo/testing)
DEEPGRAM_API_KEY=tu_deepgram_api_key_dev
OPENAI_API_KEY=tu_openai_api_key_dev

# Configuración de la aplicación
DEBUG=true
CORS_ORIGINS=["http://localhost:8080"]
EOF
```

### Paso 2: Crear .env.prod (Producción)

```bash
# Crear archivo .env.prod en la raíz del proyecto
cat > .env.prod << 'EOF'
# ===========================================
# CONFIGURACIÓN PARA PRODUCCIÓN
# ===========================================

# Backend API (cambiar por tu dominio real)
VITE_API_URL=https://tu-dominio.com/api

# Supabase Producción
VITE_SUPABASE_URL=https://cwbevytqwvrksygeixil.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4

# Base de datos PostgreSQL (producción)
DATABASE_URL=postgresql://usuario_prod:password_prod@db_host:5432/escriba_prod
POSTGRES_USER=usuario_prod
POSTGRES_PASSWORD=password_prod
POSTGRES_DB=escriba_prod

# APIs externas (usar keys de producción)
DEEPGRAM_API_KEY=tu_deepgram_api_key_prod
OPENAI_API_KEY=tu_openai_api_key_prod

# Configuración de la aplicación
DEBUG=false
CORS_ORIGINS=["https://tu-dominio.com"]
EOF
```

### Paso 3: Modificar docker-compose.local.yml

```yaml
services:
  db:
    image: postgres:15
    env_file: .env.local  # ← Usar archivo unificado
    ports:
      - "5432:5432"
    volumes:
      - pg_local:/var/lib/postgresql/data

  api:
    build: ./backend
    env_file: .env.local  # ← Usar archivo unificado
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
    env_file: .env.local  # ← Usar archivo unificado
    depends_on:
      - api

volumes:
  pg_local:
  notes_data:
  uploaded_audio_data:
```

### Paso 4: Modificar Cliente de Supabase (Una Sola Vez)

```typescript
// frontend/src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usar variables de entorno (funcionará tanto en local como en prod)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://cwbevytqwvrksygeixil.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmV2eXRxd3Zya3N5Z2VpeGlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk4ODEsImV4cCI6MjA2NjM0NTg4MX0.F7d_3S_VWrd_sC3tHGFy_hME_ufOlrioqeOaBJ82mb4";

// Debug para saber qué configuración está usando
console.log('🔧 Environment:', {
  url: SUPABASE_URL,
  isLocal: SUPABASE_URL.includes('host.docker.internal') || SUPABASE_URL.includes('127.0.0.1'),
  mode: import.meta.env.MODE
});

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Paso 5: Limpiar Archivos Antiguos

```bash
# Hacer backup de los archivos existentes
cp backend/.env backend/.env.backup
cp frontend/.emv frontend/.emv.backup

# Eliminar archivos antiguos (después de verificar que todo funciona)
rm backend/.env
rm frontend/.emv
```

### Paso 6: Script de Alternancia

```bash
#!/bin/bash
# toggle-env.sh - Script para alternar entre configuraciones

if [ "$1" == "local" ]; then
    echo "🔧 Configurando para desarrollo local..."
    
    # Usar .env.local
    if [ -f .env.local ]; then
        echo "✅ Usando .env.local"
        # docker-compose.local.yml ya está configurado para usar .env.local
    else
        echo "❌ Error: .env.local no existe"
        exit 1
    fi
    
elif [ "$1" == "prod" ]; then
    echo "🚀 Configurando para producción..."
    
    # Crear docker-compose.prod.yml que use .env.prod
    cp docker-compose.local.yml docker-compose.prod.yml
    sed -i 's/.env.local/.env.prod/g' docker-compose.prod.yml
    
    echo "✅ Usar: docker-compose -f docker-compose.prod.yml"
    
else
    echo "Uso: ./toggle-env.sh [local|prod]"
    echo "  local: Configurar para desarrollo local"
    echo "  prod:  Configurar para producción"
fi
```

## 🎯 Ventajas de Este Enfoque

1. **Simplicidad**: Solo 2 archivos de configuración
2. **Claridad**: Fácil saber qué configuración se está usando
3. **Mantenibilidad**: Un solo lugar para cada entorno
4. **Reversibilidad**: Fácil alternar entre configuraciones
5. **Versionado**: Puedes versionar .env.prod y mantener .env.local en .gitignore

## 🔄 Cómo Usar

### Para Desarrollo Local:
```bash
# Usar configuración local (por defecto)
docker-compose -f docker-compose.local.yml up -d
```

### Para Producción:
```bash
# Crear configuración de producción
./toggle-env.sh prod

# Usar configuración de producción
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ Verificación

Después de implementar, verifica que funciona:

```bash
# Verificar variables en contenedores
docker-compose -f docker-compose.local.yml exec frontend env | grep VITE_
docker-compose -f docker-compose.local.yml exec api env | grep DATABASE_URL

# Verificar en la consola del navegador
# Debería mostrar: isLocal: true para desarrollo local
```

Esta configuración unificada simplifica enormemente la gestión de variables de entorno y hace que sea muy fácil alternar entre desarrollo local y producción.