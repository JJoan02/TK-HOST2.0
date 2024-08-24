# Utilizar Fedora 37 como base
FROM fedora:37

# Actualizar el sistema y instalar dependencias
RUN dnf -y update && \
    dnf -y install \
      https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
      https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm && \
    dnf -y install \
      git \
      ffmpeg \
      ImageMagick \
      nodejs \
      yarn \
      libwebp && \
    dnf clean all

# Clonar el repositorio
RUN git clone https://github.com/JJoan02/Admin-TK.git /root/Admin-TK

# Establecer el directorio de trabajo
WORKDIR /root/Admin-TK

# Copiar archivos locales al contenedor
COPY ./root/Admin-TK /root/Admin-TK

# Instalar las dependencias del proyecto
RUN yarn install

# Definir el comando por defecto para ejecutar el contenedor
CMD ["node", "index.js"]
