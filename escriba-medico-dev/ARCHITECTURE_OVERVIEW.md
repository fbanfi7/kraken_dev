# Arquitectura de Despliegue de Escriba Médico

Este documento describe la arquitectura de red y el flujo de solicitudes para la aplicación Escriba Médico en un entorno de producción.

## Topología de Dominio Único

La aplicación utiliza una arquitectura de **dominio único con enrutamiento basado en la ruta**, lo que simplifica la configuración de DNS, SSL y CORS.

- **Dominio Principal:** `https://tudominio.com`
- **Dirección IP:** Todo el tráfico apunta a la IP única del droplet de DigitalOcean.

### Flujo de Solicitudes

El siguiente diagrama ilustra cómo se manejan las solicitudes de los usuarios:

```mermaid
graph TD
    subgraph "Internet"
        Usuario[Usuario]
    end

    subgraph "DigitalOcean Droplet (Tu IP Pública)"
        subgraph "Contenedor Nginx (Proxy Inverso)"
            Nginx[Nginx]
        end

        subgraph "Contenedor Frontend"
            Frontend[React App]
        end

        subgraph "Contenedor Backend"
            Backend[FastAPI]
        end

        subgraph "Contenedor Base de Datos"
            Database[PostgreSQL]
        end

        Usuario -- HTTPS Request --> Nginx
        Nginx -- Sirve archivos estáticos --> Frontend
        Nginx -- Petición a /api --> Backend
        Backend -- Consulta/Escribe --> Database
    end

    Usuario -- 1. Accede a https://tudominio.com --> Nginx
    Nginx -- 2. Sirve la App de React --> Usuario
    Usuario -- 3. La App hace una llamada a /api/v1/notes --> Nginx
    Nginx -- 4. Reenvía la petición a /api --> Backend
    Backend -- 5. Procesa la lógica --> Database
    Database -- 6. Devuelve datos --> Backend
    Backend -- 7. Devuelve respuesta JSON --> Nginx
    Nginx -- 8. Envía respuesta a la App --> Usuario
```

### Resumen de Rutas

| Ruta Solicitada por el Usuario   | Servicio de Destino   | Propósito                                 |
| -------------------------------- | --------------------- | ----------------------------------------- |
| `https://tudominio.com`          | **Frontend (React)**  | Cargar la interfaz de usuario principal   |
| `https://tudominio.com/assets/*` | **Frontend (React)**  | Servir archivos estáticos (JS, CSS, etc.) |
| `https://tudominio.com/api/*`    | **Backend (FastAPI)** | Gestionar la lógica de negocio, API       |

Esta configuración está definida principalmente en el archivo [`nginx/nginx.conf`](nginx/nginx.conf:1) y orquestada por `docker-compose.yml`.