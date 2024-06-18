// Este script configura un servidor Express para gestionar conexiones y generar códigos QR para escaneo.
// Asegúrate de tener las dependencias necesarias instaladas antes de ejecutar este script.

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Socket } from 'socket.io';
import { toBuffer } from 'qrcode';
import fetch from 'node-fetch';

/**
 * Conecta la aplicación Express, configura el servidor HTTP y gestiona el código QR.
 * @param {Object} conn - La conexión de WebSocket.
 * @param {number} PORT - El puerto en el que el servidor debe escuchar.
 */
function connect(conn, PORT) {
  const app = global.app = express();
  const server = global.server = createServer(app);
  let _qr = 'QR inválido, probablemente ya hayas escaneado el QR.';

  // Listener para actualizar el código QR cuando cambia la conexión
  conn.ev.on('connection.update', function appQR({ qr }) {
    if (qr) _qr = qr;
  });

  // Middleware para servir la imagen del código QR
  app.use(async (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.end(await toBuffer(_qr));
  });

  // Inicia el servidor en el puerto especificado
  server.listen(PORT, () => {
    console.log('🎉🔥 ¡App escuchando en el puerto', PORT, '! 🔥🎉');
    if (opts['keepalive']) keepAlive();
  });
}

/**
 * Redirecciona eventos de un objeto a otro, opcionalmente con un prefijo.
 * @param {EventEmitter} event - El objeto de evento original.
 * @param {EventEmitter} event2 - El objeto de evento destino.
 * @param {string} [prefix=''] - El prefijo para los eventos redirigidos.
 * @returns {Object} - Objeto con método para deshacer la redirección de eventos.
 */
function pipeEmit(event, event2, prefix = '') {
  const oldEmit = event.emit;
  event.emit = function(event, ...args) {
    oldEmit.call(event, event, ...args);
    event2.emit(prefix + event, ...args);
  };
  return {
    unpipeEmit() {
      event.emit = oldEmit;
    }
  };
}

/**
 * Mantiene viva la conexión haciendo solicitudes periódicas a la URL del servidor.
 */
function keepAlive() {
  const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  if (/(\/\/|\.)undefined\./.test(url)) return;
  setInterval(() => {
    fetch(url).catch(console.error);
  }, 5 * 1000 * 60);
}

export default connect;
