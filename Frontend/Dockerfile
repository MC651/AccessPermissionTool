# Usa la misma versión de Node que en tu máquina local
FROM node:20.17.0

# Crea y establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias de forma reproducible
RUN npm ci

# Copia el resto de la aplicación
COPY . .

# Expone el puerto de Vite
EXPOSE 5173

# Inicia la aplicación
CMD ["npm", "run", "dev", "--", "--host"]




