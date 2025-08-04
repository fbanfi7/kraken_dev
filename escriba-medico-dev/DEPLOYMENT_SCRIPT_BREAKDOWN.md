# Análisis del Script de Despliegue (`scripts/deploy.sh`)

Este documento detalla el funcionamiento del script `deploy.sh`, diseñado para automatizar el despliegue completo de la aplicación Escriba Médico en un servidor de producción.

## Resumen General

El script es una herramienta "todo en uno" que realiza las siguientes tareas principales:
1.  **Configuración del Entorno del Servidor:** Instala y configura software esencial.
2.  **Aseguramiento del Servidor:** Implementa un firewall y protección contra ataques.
3.  **Gestión de SSL:** Obtiene e instala certificados SSL para HTTPS.
4.  **Despliegue de la Aplicación:** Construye y ejecuta la aplicación usando Docker.
5.  **Verificación:** Confirma que el despliegue ha sido exitoso.

---

## Desglose por Funciones

El script está organizado en funciones modulares. A continuación se describe cada una.

### `check_requirements`
- **Propósito:** Validar que el entorno cumple con los requisitos mínimos.
- **Acciones:**
    - Verifica que el script se ejecute con permisos de `root` (`sudo`).
    - Confirma la instalación de `docker` y `docker-compose`.
    - Si algo falta, el script se detiene con un error.

### `setup_directories`
- **Propósito:** Crear la estructura de directorios para la aplicación y sus datos.
- **Acciones:**
    - Crea `/opt/medic-scribe`: Directorio raíz para la aplicación en producción.
    - Crea `/opt/backups`: Directorio para futuras copias de seguridad.
    - Crea subdirectorios para logs y certificados SSL.

### `install_dependencies`
- **Propósito:** Instalar el software necesario a nivel de sistema operativo.
- **Acciones:**
    - Actualiza los paquetes del sistema (`apt update && apt upgrade`).
    - Instala `git`, `ufw` (firewall), `fail2ban` (seguridad), `certbot` (SSL).

### `configure_firewall`
- **Propósito:** Configurar un firewall básico para proteger el servidor.
- **Acciones:**
    - Utiliza `UFW` (Uncomplicated Firewall).
    - Bloquea todas las conexiones entrantes por defecto.
    - Permite explícitamente las conexiones `ssh` (puerto 22), `http` (80) y `https` (443).

### `configure_fail2ban`
- **Propósito:** Proteger el servidor de ataques de fuerza bruta, especialmente sobre SSH.
- **Acciones:**
    - Crea una configuración local para `fail2ban`.
    - Si detecta 3 intentos fallidos de conexión SSH desde una misma IP, la bloquea durante 1 hora.

### `setup_ssl_certificates`
- **Propósito:** Obtener un certificado SSL/TLS de Let's Encrypt.
- **Acciones:**
    - Utiliza `certbot` en modo `webroot`.
    - Solicita certificados para el dominio principal (`tudominio.com`) y el subdominio `www`.
    - **Requiere** que tu dominio ya esté apuntando a la IP del servidor.

### `deploy_application`
- **Propósito:** El corazón del despliegue: construir y ejecutar la aplicación.
- **Acciones:**
    - Copia todos los archivos de tu proyecto al directorio `/opt/medic-scribe`.
    - **Acción Crítica:** Usa el comando `sed` para buscar y reemplazar `yourdomain.com` y `your-email@domain.com` dentro del archivo `.env.production` con los valores que pasaste al script.
    - Ejecuta `docker-compose -f docker-compose.prod.yml build` para construir las imágenes de producción.
    - Ejecuta `docker-compose -f docker-compose.prod.yml up -d` para iniciar todos los servicios en segundo plano.

### `verify_deployment`
- **Propósito:** Realizar una comprobación rápida para ver si el despliegue funcionó.
- **Acciones:**
    - Espera 30 segundos para dar tiempo a que los servicios se inicien.
    - Comprueba que los contenedores de Docker estén en estado "Up".
    - Intenta hacer una solicitud `curl` a `https://tudominio.com` para verificar que el sitio es accesible.

## Flujo Principal (`main`)

La función `main` simplemente orquesta la ejecución de todas las funciones anteriores en el orden correcto para un despliegue seguro y completo.