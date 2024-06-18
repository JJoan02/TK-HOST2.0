#!/bin/bash

# Este script se utiliza para instalar las dependencias necesarias y arrancar el bot de WhatsApp.
# Asegúrate de tener `yarn` y `npm` instalados antes de ejecutar este script.

# Instalación de dependencias utilizando yarn.
echo "🔧✨ ¡Agarra tus herramientas, es hora de instalar dependencias! 🚀🔧"
yarn install

# Verifica si la instalación de dependencias fue exitosa.
if [ $? -ne 0 ]; then
  echo "❌😱 ¡Oh no! Algo salió mal durante la instalación de dependencias. Revisa los errores y vuelve a intentarlo. ❌😱"
  exit 1
fi

# Inicia el bot de WhatsApp utilizando npm.
echo "🎉🔥 ¡Todo listo! Es hora de arrancar el bot. ¡Allá vamos! 🔥🎉"
npm start

# Verifica si el bot se inició correctamente.
if [ $? -ne 0 ]; then
  echo "❌😢 ¡Ups! El bot no se pudo iniciar. Revisa los logs para más detalles. ❌😢"
  exit 1
fi

# Mensaje final si todo se ejecuta correctamente.
echo "🎉🚀 ¡El bot está en marcha y listo para conquistar el mundo! 🚀🎉"
