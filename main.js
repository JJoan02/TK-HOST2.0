/*
   =======================================
   main.js - Esperar "open" para pairing code
   =======================================
*/

// Importa tu config.js (para global.owner, etc.)
import './config.js';

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
  mkdirSync,
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { platform, argv } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

import pkg from '@adiwajshing/baileys';
const {
  makeInMemoryStore,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason
} = pkg;

// Si tienes lib/simple.js, etc.
import { makeWASocket, protoType, serialize } from './lib/simple.js';

// Si tienes otras DB adaptaciones
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

// Inicializa prototipos de Baileys
protoType();
serialize();

// ============= GLOBALS =============
const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Para no tener ReferenceError
let isInit = false;

// Definiciones de __filename y __dirname
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

// Requerir
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
global.opts = yargs(hideBin(argv)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (global.opts['prefix'] || '/\\!\\.\\^').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

// ============ DB Setup (LowDB / Mongo) =============
import { Low, JSONFile } from 'lowdb';
import cloudDBAdapter from './lib/cloudDBAdapter.js'; // Ajusta si lo usas
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'; // Ajusta si lo usas

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

// =========== Carpeta "TK-Session" ===========
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
  console.log(chalk.green('Carpeta TK-Session creada.'));
}

// =========== Plugins Folder =============
const pluginsFolder = join(projectDir, 'plugins');
if (!existsSync(pluginsFolder)) {
  mkdirSync(pluginsFolder);
  console.log(chalk.magenta('✔ Carpeta "plugins" creada automáticamente (vacía).'));
}

// =========== FUNCIONES PARA MENÚ Y NÚMERO ===========
import readline from 'readline';

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
${chalk.cyanBright('[2]')} Creado por Joan TK (también genera code) ${chalk.greenBright('✅')}

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

async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const questionText = chalk.blueBright('\n📲 Escribe el número de WhatsApp (sin +), ej: 5191052145:\n> ');

  return new Promise((resolve) => {
    rl.question(questionText, (num) => {
      rl.close();
      resolve(num.trim());
    });
  });
}

// ======================
// FUNCIONES de LIMPIEZA
// ======================
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

function clearTmp() {
  const tmpDirs = [tmpdir(), join(projectDir, 'tmp')];
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
export async function reloadHandler(restartConn = false) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`);
    if (Handler && Object.keys(Handler).length) {
      global.handler = Handler;
    }
  } catch (e) {
    console.error(chalk.redBright('❌ Error al cargar handler:'), e);
  }

  if (restartConn) {
    const oldChats = global.conn?.chats || {};
    try {
      global.conn?.ws?.close();
    } catch {}
    global.conn?.ev?.removeAllListeners();
    global.conn = makeWASocket(global.connectionOptions, { chats: oldChats });
    isInit = true;
  }

  if (!isInit) {
    // Remover listeners viejos
    if (typeof global.conn?.handler?.handler === 'function') {
      global.conn.ev.off('messages.upsert', global.conn.handler.handler);
    }
    if (typeof global.conn?.handler?.participantsUpdate === 'function') {
      global.conn.ev.off('group-participants.update', global.conn.handler.participantsUpdate);
    }
    if (typeof global.conn?.handler?.groupsUpdate === 'function') {
      global.conn.ev.off('groups.update', global.conn.handler.groupsUpdate);
    }
    if (typeof global.conn?.handler?.deleteUpdate === 'function') {
      global.conn.ev.off('message.delete', global.conn.handler.deleteUpdate);
    }
    global.conn.ev.off('connection.update', connectionUpdate);
    if (typeof global.saveCredsFunction === 'function') {
      global.conn.ev.off('creds.update', global.saveCredsFunction);
    }
  }

  // Mensajes "bienvenida", etc.
  global.conn.welcome = `🌟 ¡Bienvenido! 🌟
👋 Hola @user, disfruta tu estadía en:
@subject

Por favor, regístrate usando:
.reg nombre.edad

Descripción del grupo:
@desc
`;
  global.conn.spromote = '🦾 @user ahora es administrador!';
  global.conn.sdemote = '🪓 @user ya no es administrador!';
  global.conn.sDesc = '📝 La descripción se actualizó a:\n@desc';
  global.conn.sSubject = '🏷️ El nombre del grupo cambió a:\n@subject';
  global.conn.sIcon = '🖼️ Cambió la foto del grupo!';
  global.conn.sRevoke = '🔗 El link del grupo se actualizó:\n@revoke';
  global.conn.sAnnounceOn =
    '🚧 Grupo cerrado!\nSólo los admins pueden enviar mensajes.';
  global.conn.sAnnounceOff =
    '🚪 El grupo fue abierto!\nAhora todos pueden enviar mensajes.';
  global.conn.sRestrictOn =
    '⚙️ Sólo los administradores pueden editar la información del grupo.';
  global.conn.sRestrictOff =
    '🌐 Todos pueden editar la información del grupo.';

  if (global.handler) {
    global.conn.handler = global.handler.handler?.bind(global.conn);
    global.conn.participantsUpdate = global.handler.participantsUpdate?.bind(global.conn);
    global.conn.groupsUpdate = global.handler.groupsUpdate?.bind(global.conn);
    global.conn.deleteUpdate = global.handler.deleteUpdate?.bind(global.conn);

    if (global.conn.handler) {
      global.conn.ev.on('messages.upsert', global.conn.handler);
    }
    if (global.conn.participantsUpdate) {
      global.conn.ev.on('group-participants.update', global.conn.participantsUpdate);
    }
    if (global.conn.groupsUpdate) {
      global.conn.ev.on('groups.update', global.conn.groupsUpdate);
    }
    if (global.conn.deleteUpdate) {
      global.conn.ev.on('message.delete', global.conn.deleteUpdate);
    }
  }

  global.conn.ev.on('connection.update', connectionUpdate);
  if (typeof global.saveCredsFunction === 'function') {
    global.conn.ev.on('creds.update', global.saveCredsFunction);
  }

  isInit = false;
  return true;
}

// ===========================
// INIT: Donde NO pedimos code
// ===========================
async function initWhatsApp() {
  // Menú
  const choice = await showMenu();
  console.log(chalk.blue(`Elegiste la opción: ${choice}`));

  // Teléfono
  const phoneNumber = await askPhoneNumber();
  console.log(chalk.green(`[✅ RECIBIDO] ${phoneNumber}`));

  // Baileys version
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  global.saveCredsFunction = saveCreds;

  // Creación de store
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
  store.readFromFile('./baileys_store.json');
  setInterval(() => store.writeToFile('./baileys_store.json'), 10_000);

  // Opciones de conexión, con +tiempo
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
    connectTimeoutMs: 120000,       // 2 min
    defaultQueryTimeoutMs: 120000,  // 2 min
    syncFullHistory: true,
    markOnlineOnConnect: true,

    // getMessage / patchMessageBeforeSending (si lo usas)
  };

  // Creamos la conexión
  global.conn = makeWASocket(global.connectionOptions);
  global.conn.isInit = false;

  // GUARDAMOS phoneNumber a global (para poder usarlo en 'connection.update')
  global.phoneNumberForPairing = phoneNumber;

  // Listeners
  global.conn.ev.on('connection.update', connectionUpdate);
  global.conn.ev.on('creds.update', saveCreds);

  // Vinculamos reloadHandler
  global.reloadHandler = async function (restartConn) {
    return reloadHandler(restartConn);
  };
  await global.reloadHandler();

  // Tareas: clearSessions, resetLimit, etc.
  clearSessions();
  resetLimit();
  if (!global.opts['test']) {
    console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));
    setInterval(async () => {
      if (global.db.data) await global.db.write().catch(console.error);
      clearTmp();
    }, 60_000);
  }

  // Chequeo rápido de ffmpeg, etc.
  await _quickTest();
}

// ==============
// connectionUpdate
// ==============
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, isNewLogin } = update;
  
  if (connection === 'connecting') {
    console.log(chalk.yellow('⏳ Conectando a WhatsApp...'));
  } else if (connection === 'open') {
    console.log(chalk.greenBright('✅ Conexión establecida.'));

    // AHORA solicitamos pairing code si no se ha registrado
    if (!global.conn.authState.creds.registered && global.conn.requestPairingCode) {
      try {
        // Tomamos phoneNumber guardado
        const phoneNumber = global.phoneNumberForPairing || '519XXXXXX';
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
    console.log(chalk.red('❌ Se perdió la conexión...'));
    if (
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output &&
      lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut &&
      global.conn.ws.readyState !== 1 // No reconectado
    ) {
      console.log(chalk.cyan('Reintentando la conexión...'));
      await initWhatsApp();
    } else {
      console.log(chalk.redBright('💥 Se cerró la sesión (loggedOut). Necesitarás reiniciar.'));
    }
  }
}

// =============
// _quickTest
// =============
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

// Finalmente, arrancamos
initWhatsApp().catch(console.error);
