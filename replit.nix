{ pkgs }:

let
  # Definición de paquetes necesarios
  packages = [
    pkgs.nodejs
    pkgs.nodePackages.typescript
    pkgs.ffmpeg
    pkgs.imagemagick
    pkgs.git
    pkgs.neofetch
    pkgs.libwebp
    pkgs.speedtest-cli
    pkgs.wget
    pkgs.yarn
    pkgs.libuuid
  ];

  # Definición de variables de entorno
  envVars = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [ pkgs.libuuid ];
  };
  
in
{
  # Dependencias
  deps = packages;
  
  # Variables de entorno
  env = envVars;
}

