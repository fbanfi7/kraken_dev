# Guía de Verificación del Droplet en DigitalOcean para Escriba Médico

Utilice esta guía para verificar que su droplet en DigitalOcean esté configurado correctamente antes de ejecutar el script de despliegue.

---

### 1. Verificación de Requisitos del Sistema

- [ ] **Sistema Operativo:** Ubuntu 22.04 LTS o superior.
- [ ] **Recursos del Droplet:**
    - Mínimo recomendado: 2 GB de RAM, 1 vCPU, 50 GB de SSD.
    - Para un rendimiento óptimo en producción: 4 GB de RAM, 2 vCPU, 80 GB de SSD.

### 2. Configuración de Seguridad Inicial

- [ ] **Usuario No-Root con `sudo`:** Confirme que ha creado un usuario con privilegios `sudo` y que no está operando como `root`.
    ```bash
    # Debería devolver el nombre de su usuario, no 'root'
    whoami
    ```
- [ ] **Firewall (UFW - Uncomplicated Firewall):** Verifique que el firewall esté activo y configurado para permitir el tráfico esencial.
    ```bash
    sudo ufw status
    ```
- [ ] **Reglas de Firewall Requeridas:** Asegúrese de que estas reglas estén habilitadas.
    - `OpenSSH`: Para permitir la conexión `ssh`.
    - `Nginx Full` (o puertos `80/tcp` y `443/tcp`): Para tráfico web HTTP y HTTPS.
    ```bash
    # Salida esperada (puede variar ligeramente):
    # To                         Action      From
    # --                         ------      ----
    # OpenSSH                    ALLOW       Anywhere
    # Nginx Full                 ALLOW       Anywhere
    # OpenSSH (v6)               ALLOW       Anywhere (v6)
    # Nginx Full (v6)            ALLOW       Anywhere (v6)
    ```

### 3. Software Requerido

- [ ] **Git:** Verifique que `git` esté instalado.
    ```bash
    git --version
    ```
- [ ] **Docker Engine:** Confirme que Docker está instalado y el servicio está activo.
    ```bash
    docker --version
    # Debería mostrar la versión de Docker.

    sudo systemctl status docker
    # Debería mostrar 'active (running)'.
    ```
- [ ] **Docker Compose:** Verifique que `docker-compose` (o `docker compose`) esté instalado.
    ```bash
    docker compose version
    # O para versiones más antiguas:
    docker-compose --version
    ```
- [ ] **Permisos de Docker:** Asegúrese de que su usuario `sudo` pueda ejecutar comandos de Docker sin `sudo`.
    ```bash
    # Este comando no debería dar un error de permisos
    docker ps
    ```
    *Si da error, ejecute `sudo usermod -aG docker ${USER}` y luego cierre sesión y vuelva a iniciarla.*

### 4. Configuración del Dominio (DNS)

- [ ] **Registro A:** En su proveedor de DNS (donde compró su dominio), verifique que tiene un **Registro A** (`@` o `yourdomain.com`) que apunta a la dirección IP pública de su droplet.
- [ ] **Registro CNAME (Opcional pero recomendado):** Un registro `CNAME` para `www` que apunte a `yourdomain.com` o `@{host}`.
- [ ] **Propagación de DNS:** Puede usar una herramienta como [DNS Checker](https://dnschecker.org/) para confirmar que su dominio se resuelve correctamente a la IP de su droplet desde diferentes partes del mundo.

### 5. Estructura de Archivos

- [ ] **Repositorio Clonado:** Confirme que ha clonado el repositorio del proyecto en el directorio `home` de su usuario.
    ```bash
    # Estando en /home/your_user
    ls
    # Debería ver el directorio del proyecto 'escriba-medico-dev'
    ```
- [ ] **Archivo `.env.production`:** Verifique que el archivo `.env.production` existe en la raíz del proyecto y que ha sido llenado con sus credenciales y configuraciones de producción. **¡No suba este archivo a Git!**

---

Una vez que haya marcado todas las casillas de esta lista, su droplet estará listo para el despliegue.