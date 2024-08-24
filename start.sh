#!/bin/bash

# Definir el color verde para mensajes en la consola
GREEN='\033[0;32m'

# Bucle infinito para reiniciar la aplicación en caso de fallo
while true; do
  echo -e "${GREEN}Iniciando npm start...${RESET}"
  
  # Ejecutar el comando npm start
  npm start
  
  # Esperar 1 segundo antes de reiniciar el bucle
  sleep 1
done
