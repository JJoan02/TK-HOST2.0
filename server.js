import express from 'express';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { toBuffer } from 'qrcode';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import { watchFile, unwatchFile } from 'fs';

// Configuración global
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'config.js');

// Función principal para conectar el servidor
function connect(conn, PORT) {
  const app = global.app = express();
  const server = global.server = createServer(app);
  let _qr = 'QR invalido, probablemente ya hayas escaneado el QR.';

  // Actualización del código QR
  conn.ev.on('connection.update', function appQR({ qr }) {
    if (qr) {
      _qr = qr;
      if (global.keepAliveRender === 1 && process.env.RENDER_EXTERNAL_URL) {
        console.log(`Para obtener el código QR ingresa a ${process.env.RENDER_EXTERNAL_URL}/get-qr-code`);
      }
    }
  });

  // Ruta para obtener el código QR
  app.get('/get-qr-code', async (req, res) => {
    res.setHeader('content-type', 'image/png');
    res.end(await toBuffer(_qr));
  });

  // Ruta por defecto
  app.get('*', async (req, res) => {
    res.json("Admin-TK en ejecución");
  });

  // Iniciar el servidor
  server.listen(PORT, async () => {
    console.log('App escuchando en el puerto', PORT);
    if (global.keepAliveRender === 1) await keepAliveHostRender();
    if (opts['keepalive']) keepAlive();
  });
}

// Función para emitir eventos y replicar en otro objeto
function pipeEmit(event, event2, prefix = '') {
  const oldEmit = event.emit;
  event.emit = function(eventName, ...args) {
    oldEmit.call(event, eventName, ...args);
    event2.emit(prefix + eventName, ...args);
  };
  return {
    unpipeEmit() {
      event.emit = oldEmit;
    }
  };
}

// Función para mantener la conexión activa
function keepAlive() {
  const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  if (/(\/\/|\.)undefined\./.test(url)) return;
  setInterval(() => {
    fetch(url).catch(console.error);
  }, 5 * 1000 * 60);
}

// Función para mantener el host en ejecución en Render.com
const keepAliveHostRender = async () => {
  let configContent = await fs.readFile(configPath, 'utf8');
  try {
    setInterval(async () => {
      if (process.env.RENDER_EXTERNAL_URL) {
        const urlRender = process.env.RENDER_EXTERNAL_URL;
        const res = await fetch(urlRender);
        if (res.status === 200) {
          const result = await res.text();
          console.log(`Resultado desde keepAliveHostRender() ->`, result);
        }
      } else {
        const isInitialConfig = configContent.includes('global.obtenerQrWeb = 1;') && 
                                configContent.includes('global.keepAliveRender = 1;');
        if (isInitialConfig) {
          console.log(`No está usando un Host de Render.com\nCambiando valores de "obtenerQrWeb" y "keepAliveRender" a 0 en 'config.js'`);
          try {
            configContent = configContent.replace('global.obtenerQrWeb = 1;', 'global.obtenerQrWeb = 0;');
            configContent = configContent.replace('global.keepAliveRender = 1;', 'global.keepAliveRender = 0;');
            await fs.writeFile(configPath, configContent, 'utf8');
            console.log('Archivo de configuración actualizado con éxito.');
          } catch (writeError) {
            console.error(`Error al escribir el archivo de 'config.js': `, writeError);
          }
        }
      }
    }, 5 * 1000 * 60);
  } catch (error) {
    console.log(`Error manejado en server.js keepAliveHostRender() detalles: ${error}`);
  }
};

// Exportar la función de conexión
export default connect;

// Función para observar cambios en el archivo actual
let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log("Actualización en 'server.js'");
  import(`${file}?update=${Date.now()}`);
});
