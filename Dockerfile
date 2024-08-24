# Utilizar la imagen base de Node.js LTS con Debian Buster
FROM node:lts-buster

# Actualizar el sistema e instalar dependencias necesarias
RUN apt-get update && \
    apt-get install -y \
      ffmpeg \
      imagemagick \
      webp && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copiar el archivo package.json e instalar dependencias de Node.js
COPY package.json package-lock.json* ./
RUN npm install

# Copiar el código fuente de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación escuchará
EXPOSE 5000

# Definir el comando por defecto para ejecutar la aplicación
CMD ["node", "index.js"]
