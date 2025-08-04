
#Contenido del archivo: Dockerfile
# Usa una imagen base oficial de Python
FROM python:3.10-slim-buster

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de requerimientos e instálalos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación
COPY app/ ./app/
COPY .env .env 
# Copia el archivo .env

# Expone el puerto en el que Uvicorn se ejecutará
EXPOSE 8000

# Comando para ejecutar la aplicación con Uvicorn
# --host 0.0.0.0 permite que la aplicación sea accesible desde fuera del contenedor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
