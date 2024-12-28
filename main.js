/*
   =======================================
   main.js - Esperar "open" para pairing code
   =======================================
*/

// 1) Importar config.js
import './config.js'; // Ajusta la ruta si es necesario

import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { spawn } from 'child_process';
import pino from 'pino';
import ws from 'ws';
import readline from 'readline';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  mkdirSync
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

// 2) Importar librerías de Baileys
import pkg from '@adiwajshing/baileys';
const {
  makeInMemoryStore,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason
} = pkg;

// 3) Importar LowDB / adaptadores
import { Low, JSONFile } from 'lowdb';
// Si lo usas:
import cloudDBAdapter from './lib/cloudDBAdapter.js'; 
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

// 4) Importar funciones de Baileys personalizadas (si las tienes):
import { makeWASocket, protoType, serialize } from './lib/simple.js';

// Inicializa prototipos
protoType();
serialize();

// =================================
// Variables Globales
// =================================
let isInit = false; // Evitar ReferenceError
const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Definir __filename / __dirname
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix
    ? pathURL.startsWith('file://')
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
  return new URL('.', pathURL).pathname;
};
const projectDir = global.__dirname(import.meta.url);

// createRequire
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

// (Opcional) Definiciones de API
global.API = (name, path = '/', query = {}, apikeyqueryname) =>
  (name in global.APIs ? global.APIs[name] : name) +
  path +
  (query || apikeyqueryname
    ? '?' +
      new URLSearchParams(
        Object.entries({
          ...query,
          ...(apikeyqueryname
            ? {
                [apikeyqueryname]:
                  global.APIKeys[name in global.APIs ? global.APIs[name] : name],
              }
            : {}),
        })
      )
    : '');

global.timestamp = { start: new Date() };
global.opts = yargs(hideBin(process.argv)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (global.opts['prefix'] || '/\\!\\.\\^').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

// ================================
// Base de datos LowDB / Mongo
// ================================
global.db = new Low(
  /https?:\/\//.test(global.opts['db'] || '')
    ? new cloudDBAdapter(global.opts['db'])
    : /mongodb(\+srv)?:\/\//i.test(global.opts['db'])
    ? global.opts['mongodbv2']
      ? new mongoDBV2(global.opts['db'])
      : new mongoDB(global.opts['db'])
    : new JSONFile(`${global.opts._[0] ? global.opts._[0] + '_' : ''}database.json`)
);
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
        }
      }, 1000)
    );
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
};
await global.loadDatabase();

// =====================================
// Carpeta para la sesión: "TK-Session"
// =====================================
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
  console.log(chalk.green('Se creó carpeta TK-Session'));
}

// ==================================
// Carpeta plugins
// ==================================
const pluginsFolder = join(projectDir, 'plugins');
if (!existsSync(pluginsFolder)) {
  mkdirSync(pluginsFolder);
  console.log(chalk.magenta('✔ Carpeta "plugins" creada automáticamente (vacía).'));
}

// ======================
// MENÚ INTERACTIVO
// ======================
async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const menuText = `
${chalk.hex('#FF69B4').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.hex('#FF69B4').bold('┃')}  ${chalk.bold.bgMagenta('  MENÚ DE VINCULACIÓN  ')}  ${chalk.hex('#FF69B4').bold('┃')}
${chalk.hex('#FF69B4').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}

${chalk.cyanBright('[1]')} Vincular por código de 8 dígitos ${chalk.yellow('🔑')}
${chalk.cyanBright('[2]')} Creado por Joan TK (igual genera code) ${chalk.greenBright('✅')}

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
      console.log(chalk.redBright('❌ Debes elegir "1" o "2". Intenta de nuevo.\n'));
    }
  }
}

// Pedir número de teléfono
async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const askText = chalk.blueBright('\n📲 Escribe el número de WhatsApp (sin +), ej: 5191052145:\n> ');

  return new Promise((resolve) => {
    rl.question(askText, (num) => {
      rl.close();
      resolve(num.trim());
    });
  });
}

// =====================
// Limpieza de sesiones
// =====================
function clearSessions(folder = sessionsFolder) {
  try {
    const filenames = readdirSync(folder);
    for (let file of filenames) {
      const filePath = join(folder, file);
      const stats = statSync(filePath);
      if (stats.isFile() && file !== 'creds.json') {
        unlinkSync(filePath);
        console.log(chalk.gray('Sesión eliminada:', filePath));
      }
    }
  } catch (err) {
    console.error(chalk.redBright(`Error en Clear Sessions: ${err.message}`));
  } finally {
    setTimeout(() => clearSessions(folder), 60 * 60 * 1000); // Cada hora
  }
}

// Limpieza de temporales
function clearTmp() {
  const tmpDirs = [tmpdir(), join(global.__dirname(import.meta.url), 'tmp')];
  const files = [];
  for (let dirname of tmpDirs) {
    if (existsSync(dirname)) {
      for (let file of readdirSync(dirname)) {
        files.push(join(dirname, file));
      }
    }
  }
  for (let file of files) {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) {
      unlinkSync(file);
    }
  }
}

// Reset de límites
async function resetLimit() {
  try {
    const users = global.db.data.users || {};
    const lim = 25;
    for (let user in users) {
      if (users[user].limit <= lim) {
        users[user].limit = lim;
      }
    }
    console.log(chalk.yellowBright('✅ Límite de usuarios restablecido automáticamente.'));
  } finally {
    setTimeout(() => resetLimit(), 24 * 60 * 60 * 1000);
  }
}

// ===============================
// reloadHandler (handler.js)
// ===============================
// (Lo declaramos un poquito más arriba, y la usaremos en initWhatsApp.)

// =====================
// Iniciar Vinculación
// =====================
async function initWhatsApp() {
  // 1) Menú
  const choice = await showMenu();
  console.log(chalk.blueBright(`Elegiste la opción ${choice} => Generar code 8 dígitos.`));

  // 2) Teléfono
  const phoneNumber = await askPhoneNumber();
  console.log(chalk.greenBright(`[✅ RECEIVED PHONE] ${phoneNumber}`));

  // 3) Baileys version
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  global.saveCredsFunction = saveCreds;

  // 4) InMemoryStore
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
  store.readFromFile('./baileys_store.json');
  setInterval(() => store.writeToFile('./baileys_store.json'), 10_000);

  // 5) Definir la config de conexión (con más tiempo)
  global.connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({ level: 'silent', stream: 'store' })
      ),
    },
    connectTimeoutMs: 120000,       // 2 minutos para conectar
    defaultQueryTimeoutMs: 120000,  // 2 minutos para queries
    syncFullHistory: true,
    markOnlineOnConnect: true,
  };

  // 6) Crear socket
  global.conn = makeWASocket(global.connectionOptions);
  global.conn.isInit = false;

  // **Guardar** phoneNumber para usarlo al abrir
  global.phoneNumberForPairing = phoneNumber;

  // 7) Escuchamos "connection.update"
  global.conn.ev.on('connection.update', connectionUpdate);

  // 8) Guardar creds
  global.conn.ev.on('creds.update', saveCreds);

  // 9) Vinculamos reloadHandler (handler.js)
  global.reloadHandler = async function (restartConn) {
    return reloadHandler(restartConn);
  };
  await global.reloadHandler();

  // 10) Tareas
  clearSessions();
  resetLimit();
  if (!global.opts['test']) {
    console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));
    setInterval(async () => {
      if (global.db.data) await global.db.write().catch(console.error);
      clearTmp();
    }, 60_000);
  }

  // 11) Chequeo rápido
  await _quickTest();
}

// ===========================
// Manejo connection.update
// ===========================
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, isNewLogin } = update;

  if (connection === 'connecting') {
    console.log(chalk.yellow('⏳ Conectando a WhatsApp...'));
  } else if (connection === 'open') {
    console.log(chalk.greenBright('✅ Conexión establecida.'));

    // Recién aquí pedimos el code
    if (!global.conn.authState.creds.registered && global.conn.requestPairingCode) {
      try {
        const phoneNumber = global.phoneNumberForPairing || '51999999999';
        let code = await global.conn.requestPairingCode(phoneNumber);
        if (code) {
          code = code.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.magentaBright(`\n🔑 Tu código de emparejamiento es: `) + chalk.yellow.bold(code));
          console.log(chalk.gray('   Ingresa este código en WhatsApp para vincular.\n'));
        } else {
          console.log(chalk.redBright('⚠️ No se pudo generar el código de emparejamiento.'));
        }
      } catch (err) {
        console.error(chalk.redBright('❌ Error al solicitar pairing code:'), err);
      }
    }
  }

  if (connection === 'close') {
    console.log(chalk.red('❌ Se perdió la conexión.'));
    // Aquí podrías resetear la carpeta y reintentar
    // o simplemente reconectar
    if (
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output &&
      lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut &&
      global.conn.ws.readyState !== 1 
    ) {
      console.log(chalk.cyan('Reintentando la conexión...'));
      initWhatsApp(); // reconectar
    } else {
      console.log(chalk.redBright('💥 Se cerró la sesión (loggedOut). Deberás iniciar manualmente.'));
    }
  }
}

// =====================
// _quickTest
// =====================
async function _quickTest() {
  let test = await Promise.all(
    [
      spawn('ffmpeg'),
      spawn('ffprobe'),
      spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel',
        'error',
        '-filter_complex',
        'color',
        '-frames:v',
        '1',
        '-f',
        'webp',
        '-',
      ]),
      spawn('convert'),
      spawn('magick'),
      spawn('gm'),
      spawn('find', ['--version']),
    ].map((p) =>
      Promise.race([
        new Promise((resolve) => {
          p.on('close', (code) => {
            resolve(code !== 127);
          });
        }),
        new Promise((resolve) => {
          p.on('error', (_) => resolve(false));
        }),
      ])
    )
  );
  console.log(chalk.blueBright('🔍 Dependencias checadas:'), test);
  console.log(chalk.greenBright('☑️ Prueba rápida realizada, sesión => creds.json'));
}

// =====================
// Por último, iniciar
// =====================
initWhatsApp().catch(console.error);
