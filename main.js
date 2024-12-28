/* main.js - Esperar 'open' para requestPairingCode */

import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import readline from 'readline';

import pkg from '@adiwajshing/baileys';
const {
  makeInMemoryStore,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = pkg;

import { makeWASocket } from './lib/simple.js';
// o la ruta que uses

// ... (tu loadDatabase, etc.)

// Asegurar carpeta de sesión
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
  console.log(chalk.green('Creada carpeta TK-Session'));
}

// ===================
// Pedir menú
// ===================
async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const menuText = `
[1] Vincular con código de 8 dígitos
[2] Creado por Joan TK (igualmente 8 dígitos)

Elige (1 o 2): `;

  function askMenu() {
    return new Promise((resolve) => {
      rl.question(menuText, (answer) => resolve(answer.trim()));
    });
  }

  while (true) {
    const choice = await askMenu();
    if (choice === '1' || choice === '2') {
      rl.close();
      return choice;
    } else {
      console.log(chalk.red('Opción inválida. Intenta 1 o 2.'));
    }
  }
}

// ===================
// Pedir número
// ===================
async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const text = 'Escribe el número de WhatsApp (sin +), ej: 5191052145:\n> ';
  return new Promise((resolve) => {
    rl.question(text, (num) => {
      rl.close();
      resolve(num.trim());
    });
  });
}

// ===================
// initWhatsApp
// ===================
async function initWhatsApp() {
  const choice = await showMenu();
  console.log(chalk.blueBright(`Opción elegida: ${choice}`));
  const phoneNumber = await askPhoneNumber();
  console.log(chalk.green(`[✅ RECIBIDO] ${phoneNumber}`));

  // Preparamos Baileys
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent' }) });
  store.readFromFile('./baileys_store.json');
  setInterval(() => store.writeToFile('./baileys_store.json'), 10_000);

  const connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({ level: 'silent' })
      ),
    },
    connectTimeoutMs: 120000,      // 2 min
    defaultQueryTimeoutMs: 120000, // 2 min
    syncFullHistory: true,
    markOnlineOnConnect: true,
  };

  // Crear socket
  const conn = makeWASocket(connectionOptions);
  global.conn = conn; // si quieres usarlo global

  // Escuchamos 'connection.update'
  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, isOnline } = update;

    if (connection === 'connecting') {
      console.log(chalk.yellow('⏳ Conectando a WhatsApp...'));
    } else if (connection === 'open') {
      console.log(chalk.greenBright('✅ Conexión establecida.'));

      // Ahora que está open, si no está registrado => requestPairingCode
      if (!conn.authState.creds.registered && conn.requestPairingCode) {
        try {
          let code = await conn.requestPairingCode(phoneNumber);
          if (code) {
            code = code.match(/.{1,4}/g)?.join('-') || code;
            console.log(chalk.magenta(`\n🔑 Tu código de emparejamiento es: ${code}`));
            console.log(chalk.gray('Ingresa este código en WhatsApp para vincular.\n'));
          } else {
            console.log(chalk.red('No se pudo generar el código.'));
          }
        } catch (err) {
          console.error(chalk.red('Error al solicitar pairing code:'), err);
        }
      }
    }

    if (connection === 'close') {
      console.log(chalk.red('❌ Conexión cerrada.'));
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut &&
        conn.ws.readyState !== 1 // => si no está reconectado
      ) {
        // Reconectar
        console.log(chalk.cyan('Reintentando conexión...'));
        initWhatsApp();
      }
    }
  });

  // Guardar creds
  conn.ev.on('creds.update', saveCreds);

  // ... (el resto de tu lógica: resetLimit, etc.)
}

// Arrancamos
initWhatsApp().catch((e) => console.error(e));

