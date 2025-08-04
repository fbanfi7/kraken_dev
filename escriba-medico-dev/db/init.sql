-- PostgreSQL initialization script
-- This script will be executed when the PostgreSQL container starts
-- It creates the user and database if they don't exist

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