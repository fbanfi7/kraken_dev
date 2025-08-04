# Escriba Médico 🩺🧠

Proyecto de backend para la gestión y asistencia inteligente de registros médicos.

## 🚀 Tecnologías principales

- [Python 3.12](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Docker + Docker Compose](https://www.docker.com/)
- [Supabase](https://supabase.io/)
- [PostgreSQL](https://www.postgresql.org/)

## 📦 Instalación

```bash
# Clonar el repositorio
git clone git@github.com:javrx/escriba-medico.git
cd escriba-medico

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Construir y correr los servicios
docker compose up --build

DATABASE_URL=postgresql://usuario:password@host:puerto/base
SUPABASE_URL=https://tu_proyecto.supabase.co
SUPABASE_KEY=clave_api
