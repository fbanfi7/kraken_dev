# 🚀 GUÍA COMPLETA DE DESPLIEGUE EN DROPLET - MedScribe

## 📋 INFORMACIÓN DEL PROYECTO

- **Dominio**: `medscribe.krakenalalitics.com`
- **Email**: (usar tu email para Let's Encrypt)
- **Directorio del proyecto**: `/root/escriba-medico-dev`

## 🔧 PREPARACIÓN DEL DROPLET

### **Paso 1: Conectar al Droplet**
```bash
ssh root@tu-droplet-ip
```

### **Paso 2: Actualizar el Código**
```bash
cd /root/escriba-medico-dev
git pull origin main
```

### **Paso 3: Hacer Scripts Ejecutables**
```bash
# Hacer todos los scripts ejecutables
chmod +x scripts/deploy.sh
chmod +x scripts/validate_nginx.sh
chmod +x scripts/rollback_nginx.sh

# Verificar permisos
ls -la scripts/
```

## 🚀 PROCESO DE DESPLIEGUE

### **Opción A: Despliegue Directo (Recomendado)**

```bash
# Ejecutar el script de deploy con el dominio correcto
./scripts/deploy.sh medscribe.krakenalalitics.com tu-email@dominio.com
```

### **Opción B: Despliegue con Validación Previa**

```bash
# 1. Primero validar la configuración
./scripts/validate_nginx.sh medscribe.krakenalalitics.com

# 2. Si la validación pasa, ejecutar deploy
./scripts/deploy.sh medscribe.krakenalalitics.com tu-email@dominio.com
```

## 📊 MONITOREO DEL DESPLIEGUE

### **Durante el Despliegue, Verás:**

```
[2025-07-28 20:00:00] Starting Medic Scribe deployment...
[2025-07-28 20:00:01] Domain: medscribe.krakenalalitics.com
[2025-07-28 20:00:02] Email: tu-email@dominio.com
[2025-07-28 20:00:03] Checking requirements...
[2025-07-28 20:00:04] ✅ Requirements check passed
[2025-07-28 20:00:05] Verifying project directory and updating source code from Git...
[2025-07-28 20:00:10] ✅ Source code updated successfully
[2025-07-28 20:00:11] Installing system dependencies...
[2025-07-28 20:00:30] ✅ Dependencies installed
[2025-07-28 20:00:31] Configuring firewall...
[2025-07-28 20:00:35] ✅ Firewall configured
[2025-07-28 20:00:36] Configuring fail2ban...
[2025-07-28 20:00:40] ✅ Fail2ban configured
[2025-07-28 20:00:41] Stopping existing services...
[2025-07-28 20:00:45] ✅ Existing services stopped
[2025-07-28 20:00:46] Setting up SSL certificates...
[2025-07-28 20:00:47] Generating temporary Nginx configuration for SSL validation...
[2025-07-28 20:00:48] Building fresh production images...
[2025-07-28 20:02:00] Starting Nginx with temporary config for SSL validation...
[2025-07-28 20:02:10] Requesting SSL certificate from Let's Encrypt...
[2025-07-28 20:02:30] Stopping temporary Nginx...
[2025-07-28 20:02:35] Generating final Nginx configuration with SSL...
[2025-07-28 20:02:36] ✅ SSL certificates obtained and final Nginx config generated.
[2025-07-28 20:02:37] Deploying application...
[2025-07-28 20:02:40] Building and bringing all services up...
[2025-07-28 20:04:00] ✅ Application deployed
[2025-07-28 20:04:01] Verifying deployment...
[2025-07-28 20:04:31] ✅ All services are running
[2025-07-28 20:04:32] ✅ SSL configuration files found
[2025-07-28 20:04:33] ✅ Nginx configuration is valid
[2025-07-28 20:04:34] ✅ HTTPS endpoint is responding
[2025-07-28 20:04:35] ✅ Application is accessible at https://medscribe.krakenalalitics.com
[2025-07-28 20:04:36] 🎉 Deployment completed successfully!
[2025-07-28 20:04:37] Your Medic Scribe application is now running at: https://medscribe.krakenalalitics.com
```

## 🔍 VERIFICACIÓN POST-DESPLIEGUE

### **Verificar que Todo Funciona:**

```bash
# 1. Verificar contenedores corriendo
docker compose -f compose.prod.yml ps

# 2. Verificar logs de nginx
docker logs medical_scribe_nginx_prod

# 3. Probar endpoints
curl -I https://medscribe.krakenalalitics.com/health
curl -I https://medscribe.krakenalalitics.com/

# 4. Verificar certificado SSL
openssl s_client -connect medscribe.krakenalalitics.com:443 -servername medscribe.krakenalalitics.com < /dev/null
```

### **Salida Esperada (Sin Errores):**

```
# docker compose ps debería mostrar:
NAME                              COMMAND                  SERVICE    STATUS
medical_scribe_backend_prod       "uvicorn app.main:ap…"   backend    Up
medical_scribe_certbot_prod       "/bin/sh -c 'trap ex…"   certbot    Up
medical_scribe_db_prod            "docker-entrypoint.s…"   db         Up (healthy)
medical_scribe_frontend_build_prod "docker-entrypoint.s…"   frontend   Exited (0)
medical_scribe_nginx_prod         "/docker-entrypoint.…"   nginx      Up

# curl health debería devolver:
HTTP/2 200
content-type: text/plain
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Si el Despliegue Falla:**

#### **1. Error en Certificados SSL:**
```bash
# Ver logs detallados
docker logs medical_scribe_nginx_prod
docker logs medical_scribe_certbot_prod

# Ejecutar rollback
./scripts/rollback_nginx.sh
```

#### **2. Error en Nginx:**
```bash
# Verificar configuración nginx
docker compose -f compose.prod.yml exec nginx nginx -t

# Ver logs específicos
docker logs medical_scribe_nginx_prod --tail 50
```

#### **3. Error en Base de Datos:**
```bash
# Verificar estado de la DB
docker logs medical_scribe_db_prod
docker compose -f compose.prod.yml exec db pg_isready -U medic_scribe
```

### **Comandos de Diagnóstico:**

```bash
# Ver todos los logs
docker compose -f compose.prod.yml logs

# Ver logs en tiempo real
docker compose -f compose.prod.yml logs -f

# Reiniciar un servicio específico
docker compose -f compose.prod.yml restart nginx

# Ver uso de recursos
docker stats
```

## 🔄 ROLLBACK DE EMERGENCIA

### **Si Algo Sale Mal:**

```bash
# Ejecutar rollback automático
./scripts/rollback_nginx.sh
```

### **Rollback Manual:**

```bash
# 1. Parar todos los servicios
docker compose -f compose.prod.yml down

# 2. Ver backups disponibles
ls -la backups/

# 3. Restaurar configuración anterior
cp backups/nginx_YYYYMMDD_HHMMSS/nginx.conf.backup nginx/generated_nginx.conf

# 4. Reiniciar servicios
docker compose -f compose.prod.yml up -d
```

## 📝 MANTENIMIENTO

### **Renovación Automática de Certificados:**
Los certificados se renuevan automáticamente cada 12 horas gracias al contenedor `certbot`.

### **Verificar Renovación:**
```bash
# Ver logs de certbot
docker logs medical_scribe_certbot_prod

# Probar renovación manual
docker compose -f compose.prod.yml exec certbot certbot renew --dry-run
```

### **Actualizar la Aplicación:**
```bash
# 1. Hacer pull de cambios
git pull origin main

# 2. Reconstruir y reiniciar
docker compose -f compose.prod.yml build --no-cache
docker compose -f compose.prod.yml up -d
```

## ✅ CHECKLIST DE DESPLIEGUE

- [ ] Conectado al droplet como root
- [ ] Código actualizado con `git pull`
- [ ] Scripts hechos ejecutables con `chmod +x`
- [ ] Ejecutado `./scripts/deploy.sh medscribe.krakenalalitics.com tu-email@dominio.com`
- [ ] Verificado que todos los contenedores están corriendo
- [ ] Probado `https://medscribe.krakenalalitics.com/health`
- [ ] Probado `https://medscribe.krakenalalitics.com/`
- [ ] Verificado certificado SSL válido

## 🎯 ENDPOINTS FINALES

Una vez desplegado correctamente:

- **Aplicación Principal**: `https://medscribe.krakenalalitics.com`
- **Health Check**: `https://medscribe.krakenalalitics.com/health`
- **API Backend**: `https://medscribe.krakenalalitics.com/api`

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisar logs**: `docker compose -f compose.prod.yml logs`
2. **Ejecutar rollback**: `./scripts/rollback_nginx.sh`
3. **Verificar DNS**: Asegurar que `medscribe.krakenalalitics.com` apunta al droplet
4. **Verificar firewall**: Puertos 80 y 443 deben estar abiertos

**¡El despliegue debería funcionar sin problemas con esta nueva configuración!**