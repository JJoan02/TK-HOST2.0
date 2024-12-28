/*
  =======================================
  CÓDIGO PRINCIPAL CORREGIDO
  =======================================
*/

import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import path, { join } from 'path';
import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch,
  mkdirSync,
} from 'fs';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import { format } from 'util';
import readline from 'readline';
import pino from 'pino';
import ws from 'ws';

import pkg from '@adiwajshing/baileys';
const {
  fetchLatestBaileysVersion,
  DisconnectReason,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} = pkg;

import { Low, JSONFile } from 'lowdb';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

// ======== Inicializa prototipos de Baileys ========
protoType();
serialize();

// =======================
// Variables Globales
// =======================
const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

let isInit = false; // Para controlar la recarga del handler
let store; // Para almacenar
let connectionOptions; // Para reuso en reload
let saveCredsFunction; // Guardar credenciales

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix
    ? pathURL.startsWith('file://')
      ? fileURLToPath(pathURL)
      : pathURL
    : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
};

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

global.timestamp = {
  start: new Date(),
};

// Parseo con Yargs
global.opts = yargs(hideBin(process.argv)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (global.opts['prefix'] || '\/\\!\\.\\^').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

// ================================
// Base de datos con LowDB o Mongo
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

global.DATABASE = global.db; // compat con versiones anteriores

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

// ==================================
// Carreta de sesiones: "TK-Session"
// ==================================
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
}

// ================================
// MENÚ INTERACTIVO DE VINCULACIÓN
// ================================
async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const menuText = `\n${chalk.hex('#FF69B4').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.hex('#FF69B4').bold('┃')}  ${chalk.bold.bgMagenta('  MENÚ DE VINCULACIÓN  ')}  ${chalk.hex('#FF69B4').bold('┃')}
${chalk.hex('#FF69B4').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}

${chalk.cyanBright('[1]')} Vincular por código de 8 dígitos ${chalk.yellow('🔑')}
${chalk.cyanBright('[2]')} Creado por Joan TK ${chalk.greenBright('✅')}

Elige una opción ${chalk.magenta('1')} o ${chalk.magenta('2')}: `;

  async function askMenu() {
    return new Promise((resolve) => {
      rl.question(menuText, (answer) => {
        resolve(answer.trim());
      });
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

  const askText = chalk.blueBright(
    '\n📲 Por favor escribe el número de WhatsApp (sin el +), ej: 5191052145:\n> '
  );

  return new Promise((resolve) => {
    rl.question(askText, (num) => {
      rl.close();
      resolve(num.trim());
    });
  });
}

// ========================
// Limpieza de Sesiones
// ========================
function clearSessions(folder = sessionsFolder) {
  try {
    const filenames = readdirSync(folder);
    filenames.forEach((file) => {
      const filePath = join(folder, file);
      const stats = statSync(filePath);
      if (stats.isFile() && file !== 'creds.json') {
        unlinkSync(filePath);
        console.log(chalk.gray('Sesión eliminada:', filePath));
      }
    });
  } catch (err) {
    console.error(chalk.redBright(`Error en Clear Sessions: ${err.message}`));
  } finally {
    // Se reprograma cada 1 hora
    setTimeout(() => clearSessions(folder), 1 * 3600000);
  }
}

// ========================
// Limpieza de Temporales
// ========================
function clearTmp(global) {
  const tmpDirs = [tmpdir(), join(global.__dirname, './tmp')];
  const files = [];
  tmpDirs.forEach((dirname) => {
    if (existsSync(dirname)) {
      readdirSync(dirname).forEach((file) => {
        files.push(join(dirname, file));
      });
    }
  });
  files.forEach((file) => {
    const stats = statSync(file);
    if (stats.isFile() && Date.now() - stats.mtimeMs >= 1000 * 60 * 3) {
      unlinkSync(file);
    }
  });
}

// ====================
// Reset de límites
// ====================
async function resetLimit() {
  try {
    const users = global.db.data.users || {};
    const lim = 25; // Límite por defecto
    for (let user in users) {
      if (users[user].limit <= lim) {
        users[user].limit = lim;
      }
    }
    console.log(chalk.yellowBright('✅ Límite de usuarios restablecido automáticamente.'));
  } finally {
    setTimeout(() => resetLimit(), 24 * 60 * 60 * 1000); // cada 24 horas
  }
}

// ==========================
// Vinculación / Conexión
// ==========================
(async function initWhatsApp() {
  // Mostrar menú
  const choice = await showMenu();
  if (choice === '1') {
    console.log(chalk.bgMagentaBright('\n🔐 Has elegido la vinculación por código de 8 dígitos.\n'));
  } else {
    console.log(chalk.bgGreenBright('\n🤖 Creado por Joan TK.\n'));
  }

  // Obtenemos la versión más reciente de Baileys
  const { version } = await fetchLatestBaileysVersion();
  // Autenticación multi-sesión
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  saveCredsFunction = saveCreds;

  // Creación de la store en memoria
  store = makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' }),
  });
  store.readFromFile('./baileys_store.json');
  setInterval(() => {
    store.writeToFile('./baileys_store.json');
  }, 10_000);

  // Opciones de conexión
  connectionOptions = {
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
    getMessage: async (key) => {
      const messageData = await store.loadMessage(key.remoteJid, key.id);
      return messageData?.message || undefined;
    },
    generateHighQualityLinkPreview: true,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadataVersion: 2,
                deviceListMetadata: {},
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    syncFullHistory: true,
    markOnlineOnConnect: true,
  };

  // Creamos la conexión
  global.conn = makeWASocket(connectionOptions);
  global.conn.isInit = false;

  // En caso de que elijas la opción 1, pedimos el número y generamos pairing code
  if (choice === '1') {
    const phoneNumber = await askPhoneNumber();
    // Lógica de pairing code
    if (global.conn.requestPairingCode && !global.conn.authState.creds.registered) {
      try {
        let code = await global.conn.requestPairingCode(phoneNumber);
        if (code) {
          // En vez de chalk.bgYellow.black(code), usamos chalk.yellow.bold(code)
          code = code.match(/.{1,4}/g)?.join('-') || code;
          console.log(
            chalk.magentaBright(`\n🔑 Tu código de emparejamiento es: ${chalk.yellow.bold(code)}`)
          );
          console.log(chalk.gray('   Ingresa este código en la app de WhatsApp para vincular.\n'));
        } else {
          console.log(chalk.redBright('⚠️ No se pudo generar el código de emparejamiento.'));
        }
      } catch (err) {
        console.error(chalk.redBright('❌ Error al solicitar el pairing code:'), err);
      }
    }
  }

  // Registramos eventos
  global.conn.ev.on('connection.update', (update) => connectionUpdate(update));
  global.conn.ev.on('creds.update', saveCreds);

  // Cargamos el handler
  global.reloadHandler = async function (restartConn) {
    return reloadHandler(restartConn);
  };
  await global.reloadHandler();

  // =============================
  // Iniciamos TAREAS PERIÓDICAS
  // =============================
  clearSessions(); // Limpieza de sesiones
  resetLimit();    // Reset de límites

  if (!global.opts['test']) {
    // (Opcional) Arranca tu server, si quieres
    console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));
    setInterval(async () => {
      if (global.db.data) await global.db.write().catch(console.error);
      clearTmp(global);
    }, 60 * 1000);
  }

  // Chequeo rápido de dependencias
  await _quickTest();
})();

// ========================================
// Manejo de eventos de conexión
// ========================================
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, isNewLogin, receivedPendingNotifications } = update;

  if (isNewLogin) {
    global.conn.isInit = true;
  }
  if (connection === 'connecting') {
    console.log(chalk.yellow('⏳ Conectando al servidor de WhatsApp... Por favor espera.'));
  } else if (connection === 'open') {
    console.log(chalk.greenBright('✅ Conexión establecida correctamente!'));
  }

  if (isOnline === true) {
    console.log(chalk.greenBright('🔵 Estado en línea (online)'));
  } else if (isOnline === false) {
    console.log(chalk.redBright('🔴 Estado fuera de línea (offline)'));
  }

  if (receivedPendingNotifications) {
    console.log(chalk.yellow('✉️ Esperando mensajes entrantes...'));
  }

  if (connection === 'close') {
    console.log(chalk.red('❌ Se perdió la conexión con WhatsApp... Reintentando.'));
    if (
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output &&
      lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut &&
      global.conn.ws.readyState !== CONNECTING
    ) {
      // Forzamos la reconexión
      console.log(chalk.cyan('Intentando reconectar...'));
      await global.reloadHandler(true);
    } else if (
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output &&
      lastDisconnect.error.output.statusCode === DisconnectReason.loggedOut
    ) {
      console.log(chalk.redBright('💥 Se cerró la sesión. Necesitarás volver a iniciar.'));
    }
  }
  global.timestamp.connect = new Date();

  // Si la DB no está cargada, la cargamos
  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

// ============================================
// FUNCIÓN DE RECARGA DE HANDLER
// ============================================
async function reloadHandler(restartConn = false) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`);
    if (Object.keys(Handler || {}).length) {
      global.handler = Handler;
    }
  } catch (e) {
    console.error(chalk.redBright('❌ Error al cargar handler:'), e);
  }

  // Si hay que reiniciar conexión
  if (restartConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch {}
    global.conn.ev.removeAllListeners();
    // Reconstruimos la conexión
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    isInit = true;
  }

  // Removemos listeners viejos con chequeo (para evitar "listener is undefined")
  if (!isInit) {
    if (typeof global.conn.handler === 'function') {
      global.conn.ev.off('messages.upsert', global.conn.handler);
    }
    if (typeof global.conn.participantsUpdate === 'function') {
      global.conn.ev.off('group-participants.update', global.conn.participantsUpdate);
    }
    if (typeof global.conn.groupsUpdate === 'function') {
      global.conn.ev.off('groups.update', global.conn.groupsUpdate);
    }
    if (typeof global.conn.onDelete === 'function') {
      global.conn.ev.off('message.delete', global.conn.onDelete);
    }
    if (typeof connectionUpdate === 'function') {
      global.conn.ev.off('connection.update', connectionUpdate);
    }
    if (typeof saveCredsFunction === 'function') {
      global.conn.ev.off('creds.update', saveCredsFunction);
    }
  }

  // Mensajes personalizados
  global.conn.welcome = `🌟 ¡Bienvenido! 🌟
🎉 Disfruta tu estadía en:
@subject
(👋 Hola @user)

Por favor, regístrate usando:
.reg nombre.edad

Descripción del grupo:
@desc
`;
  global.conn.spromote = '🦾 @user ahora es administrador!';
  global.conn.sdemote = '🪓 @user ya no es administrador!';
  global.conn.sDesc = '📝 La descripción se actualizó: \n@desc';
  global.conn.sSubject = '🏷️ El nombre del grupo cambió a: \n@subject';
  global.conn.sIcon = '🖼️ Cambió la foto del grupo!';
  global.conn.sRevoke = '🔗 El link del grupo se actualizó: \n@revoke';
  global.conn.sAnnounceOn =
    '🚧 Grupo cerrado!\nSólo los admins pueden enviar mensajes.';
  global.conn.sAnnounceOff =
    '🚪 El grupo fue abierto!\nAhora todos pueden enviar mensajes.';
  global.conn.sRestrictOn =
    '⚙️ Sólo los administradores pueden editar la información del grupo.';
  global.conn.sRestrictOff =
    '🌐 Todos pueden editar la información del grupo.';

  // Enlazamos de nuevo
  if (global.handler) {
    // Aseguramos que el handler exista
    global.conn.handler = global.handler.handler?.bind(global.conn);
    global.conn.participantsUpdate = global.handler.participantsUpdate?.bind(global.conn);
    global.conn.groupsUpdate = global.handler.groupsUpdate?.bind(global.conn);
    global.conn.onDelete = global.handler.deleteUpdate?.bind(global.conn);

    // Registramos los listeners
    if (global.conn.handler) {
      global.conn.ev.on('messages.upsert', global.conn.handler);
    }
    if (global.conn.participantsUpdate) {
      global.conn.ev.on('group-participants.update', global.conn.participantsUpdate);
    }
    if (global.conn.groupsUpdate) {
      global.conn.ev.on('groups.update', global.conn.groupsUpdate);
    }
    if (global.conn.onDelete) {
      global.conn.ev.on('message.delete', global.conn.onDelete);
    }
  }

  global.conn.ev.on('connection.update', connectionUpdate);
  if (typeof saveCredsFunction === 'function') {
    global.conn.ev.on('creds.update', saveCredsFunction);
  }

  isInit = false;
  return true;
}

// =========================
// Prueba Rápida
// =========================
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
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  console.log(chalk.blueBright('🔍 Dependencias checadas:'), test);
  let s = (global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find,
  });
  Object.freeze(global.support);
  console.log(chalk.greenBright('☑️ Prueba rápida realizada, sesión => creds.json'));
}

