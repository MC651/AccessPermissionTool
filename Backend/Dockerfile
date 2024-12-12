# Select base image 
#FROM python:3.12
# Set environment variables
#ENV PYTHONDONTWRITEBYTECODE=1
#ENV PYTHONUNBUFFERED=1
# Select the directory where the app is located
#WORKDIR /app
# Install dependencies from requirements.txt 
#COPY requirements.txt /app/requirements.txt
# Update pip and install dependencies from requirements.txt
#RUN pip install --no-cache-dir --upgrade pip \
#    && pip install --no-cache-dir -r /app/requirements.txt
# Create a directory for uploads
#RUN mkdir -p /app/uploads
# Copy the app to the container
#COPY app/ /app/
#COPY .env /app/.env
# Expose port 8000 where the app is running
#EXPOSE 8000
# Execute the app when the container is started
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Seleccionar la imagen base
FROM python:3.12

# Configurar variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Configurar el directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY requirements.txt /app/requirements.txt

# Instalar dependencias
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

# Crear directorios necesarios
RUN mkdir -p /app/uploads

# Copiar la aplicación y el archivo .env
COPY app/ /app/app/
COPY .env /app/.env

# Exponer el puerto
EXPOSE 8000

# Ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
