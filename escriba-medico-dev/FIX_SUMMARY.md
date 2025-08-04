# Deployment Issues Fixed

This document summarizes the issues that were identified and fixed in the deployment process.

## 1. Nginx Configuration Issues

### Problem
- The Nginx configuration was mounted as read-only (`:ro`), preventing the Nginx entrypoint scripts from modifying it.
- Error message: `can not modify /etc/nginx/conf.d/default.conf (read-only file system?)`

### Solution
- Removed the `:ro` flag from the volume mounts in `compose.prod.yml`:
  ```yaml
  volumes:
    - ./nginx/generated_nginx.conf:/etc/nginx/conf.d/default.conf
    - ./nginx/base_nginx.conf:/etc/nginx/nginx.conf
    - frontend_dist:/usr/share/nginx/html
  ```
- This allows the Nginx entrypoint scripts to modify the configuration files as needed.

## 2. Database Connection Issues

### Problem
- The backend was trying to connect to the database with incorrect connection parameters.
- Error message: `FATAL: role "medic_scribe_user" does not exist`
- The `.env.production` file had `localhost` as the database host, which is incorrect in a Docker Compose setup.

### Solution
1. Updated the database host in `.env.production`:
   ```
   POSTGRES_HOST=db
   DATABASE_URL=postgresql://medic_scribe_user:your_secure_password@db:5432/medic_scribe_prod
   ```

2. Created a database initialization script (`db/init.sql`) to ensure the PostgreSQL user is created:
   ```sql
   -- Create user if not exists
   DO
   $$
   BEGIN
      IF NOT EXISTS (
         SELECT FROM pg_catalog.pg_roles
         WHERE  rolname = 'medic_scribe_user') THEN
         CREATE ROLE medic_scribe_user WITH LOGIN PASSWORD 'your_secure_password';
      END IF;
   END
   $$;

   -- Grant privileges to the user
   ALTER ROLE medic_scribe_user WITH SUPERUSER;

   -- Create database if not exists
   CREATE DATABASE medic_scribe_prod WITH OWNER medic_scribe_user;

   -- Connect to the database
   \c medic_scribe_prod;

   -- Grant privileges on the database
   GRANT ALL PRIVILEGES ON DATABASE medic_scribe_prod TO medic_scribe_user;
   GRANT ALL PRIVILEGES ON SCHEMA public TO medic_scribe_user;
   ```

3. Updated `compose.prod.yml` to mount the initialization script:
   ```yaml
   volumes:
     - postgres_data:/var/lib/postgresql/data
     - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
   ```

## Next Steps

1. Run the deployment script again:
   ```bash
   ./scripts/deploy.sh yourdomain.com your-email@example.com
   ```

2. The script should now:
   - Generate the Nginx configurations correctly
   - Initialize the database with the correct user and permissions
   - Obtain SSL certificates
   - Deploy the application with HTTPS support

These changes provide a more robust and maintainable configuration that follows best practices and should prevent similar issues in the future.