#!/bin/bash

# Definir colores para mensajes en la consola
GREEN='\033[0;32m'
RESET='\033[0m'

# Mensaje de inicio de la instalación y ejecución
echo -e "${GREEN}Instalando dependencias con yarn...${RESET}"
yarn install

# Verificar si la instalación fue exitosa
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Dependencias instaladas correctamente.${RESET}"
else
  echo -e "${RED}Error al instalar dependencias.${RESET}"
  exit 1
fi

# Mensaje de inicio de la aplicación
echo -e "${GREEN}Iniciando la aplicación con npm start...${RESET}"
npm start

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Aplicación iniciada correctamente.${RESET}"
else
  echo -e "${RED}Error al iniciar la aplicación.${RESET}"
  exit 1
fi
