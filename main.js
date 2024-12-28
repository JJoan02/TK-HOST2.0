/*
   =======================================
   main.js - Reseteo Completo tras "close"
   =======================================
*/

import './config.js'; // Importar tu config.js
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import { createRequire } from 'module';
import { join } from 'path';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  mkdirSync,
  rmSync,
} from 'fs';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import pino from 'pino';
import ws from 'ws';

import pkg from '@adiwajshing/baileys';
const {
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  DisconnectReason,
} = pkg;

import { Low, JSONFile } from 'lowdb';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

protoType();
serialize();

let isInit = false; // Para evitar ReferenceError

const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// __filename / __dirname
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

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

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
// Base de datos (LowDB / Mongo)
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

// Carpeta de sesiones
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
  console.log(chalk.green('Se creó carpeta TK-Session'));
}

// Carpeta plugins
const pluginsFolder = join(projectDir, 'plugins');
if (!existsSync(pluginsFolder)) {
  mkdirSync(pluginsFolder);
  console.log(chalk.magenta('✔ Carpeta "plugins" creada automáticamente (vacía).'));
}

// resetSession => borra TK-Session
function resetSession() {
  try {
    if (existsSync(sessionsFolder)) {
      const files = readdirSync(sessionsFolder);
      for (let file of files) {
        const filePath = join(sessionsFolder, file);
        const stats = statSync(filePath);
        if (stats.isFile()) {
          unlinkSync(filePath);
        } else {
          rmSync(filePath, { recursive: true, force: true });
        }
      }
      console.log(chalk.magenta('Se ha reseteado la carpeta TK-Session.'));
    } else {
      mkdirSync(sessionsFolder);
    }
    return true;
  } catch (err) {
    console.error(chalk.red('Error al resetear TK-Session:'), err);
    return false;
  }
}

// Menú Interactivo
import readline from 'readline';
async function showMenu() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const menuText = `
${chalk.hex('#FF69B4').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.hex('#FF69B4').bold('┃')}  ${chalk.bold.bgMagenta('  MENÚ DE VINCULACIÓN  ')}  ${chalk.hex('#FF69B4').bold('┃')}
${chalk.hex('#FF69B4').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}

${chalk.cyanBright('[1]')} Vincular con código de 8 dígitos ${chalk.yellow('🔑')}
${chalk.cyanBright('[2]')} Creado por Joan TK (También genera el code) ${chalk.greenBright('✅')}

Elige una opción ${chalk.magenta('1')} o ${chalk.magenta('2')}: `;

  function askMenu() {
    return new Promise((resolve) => {
      rl.question(menuText, (answer) => resolve(answer.trim()));
    });
  }

  while (true) {
    const choice = await askMenu();
    // Ambas opciones generarán el code
    if (choice === '1' || choice === '2') {
      rl.close();
      return choice;
    } else {
      console.log(chalk.redBright('❌ Debes elegir "1" o "2". Intenta de nuevo.\n'));
    }
  }
}

async function askPhoneNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const askText = chalk.blueBright('\n📲 Escribe el número de WhatsApp (sin +), ej: 5191052145:\n> ');
  return new Promise((resolve) => {
    rl.question(askText, (num) => {
      rl.close();
      console.log(chalk.greenBright(`[✅ RECEIVED] ${num}`));
      resolve(num.trim());
    });
  });
}

// Limpia sesiones
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
    setTimeout(() => clearSessions(folder), 3600000);
  }
}

// Limpieza de Temporales
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

// Función principal de vinculación
async function initWhatsApp() {
  const choice = await showMenu();
  console.log(chalk.blueBright(`Elegiste la opción ${choice}. Generaremos el código de 8 dígitos...`));
  const phoneNumber = await askPhoneNumber();

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  global.saveCredsFunction = saveCreds;

  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
  store.readFromFile('./baileys_store.json');
  setInterval(() => store.writeToFile('./baileys_store.json'), 10000);

  // Ajustamos tiempos de espera:
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
    connectTimeoutMs: 120000,      // 2 min para conectar
    defaultQueryTimeoutMs: 120000, // 2 min para queries
    syncFullHistory: true,
    markOnlineOnConnect: true,
    getMessage: async (key) => {
      const msgData = await store.loadMessage(key.remoteJid, key.id);
      return msgData?.message || undefined;
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
  };

  global.conn = makeWASocket(global.connectionOptions);
  global.conn.isInit = false;

  if (global.conn.requestPairingCode && !global.conn.authState.creds.registered) {
    try {
      let code = await global.conn.requestPairingCode(phoneNumber);
      if (code) {
        code = code.match(/.{1,4}/g)?.join('-') || code;
        console.log(chalk.magentaBright(`\n🔑 Tu código de emparejamiento es: `) + chalk.yellow.bold(code));
        console.log(chalk.gray('   Ingresa este código en WhatsApp para vincular.\n'));
      } else {
        console.log(chalk.redBright('⚠️ No se generó el código de emparejamiento.'));
      }
    } catch (err) {
      console.error(chalk.redBright('❌ Error al solicitar el pairing code:'), err);
      // En caso "Connection Closed"
      if (err?.output?.payload?.message === 'Connection Closed') {
        console.log(chalk.redBright('❌ Se cerró la conexión antes de vincular... Reseteando.'));
        resetSession();
        console.log(chalk.cyan('Esperaremos 45s y volveremos a iniciar la vinculación.'));
        setTimeout(async () => {
          await initWhatsApp();
        }, 45000);
        return;
      }
    }
  }

  global.conn.ev.on('connection.update', connectionUpdate);
  global.conn.ev.on('creds.update', saveCreds);

  global.reloadHandler = async function (restartConn) {
    return reloadHandler(restartConn);
  };
  await global.reloadHandler();

  clearSessions();
  resetLimit();
  if (!global.opts['test']) {
    console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));
    setInterval(async () => {
      if (global.db.data) await global.db.write().catch(console.error);
      clearTmp();
    }, 60000);
  }

  await _quickTest();
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, isNewLogin, receivedPendingNotifications } = update;
  if (isNewLogin) {
    global.conn.isInit = true;
  }
  if (connection === 'connecting') {
    console.log(chalk.yellow('⏳ Conectando a WhatsApp... Por favor espera.'));
  } else if (connection === 'open') {
    console.log(chalk.greenBright('✅ Conexión establecida correctamente!'));
  }
  if (isOnline === true) console.log(chalk.greenBright('🔵 Estado online'));
  else if (isOnline === false) console.log(chalk.redBright('🔴 Estado offline'));
  if (receivedPendingNotifications) console.log(chalk.yellow('✉️ Esperando mensajes entrantes...'));

  if (connection === 'close') {
    console.log(chalk.red('❌ Se perdió la conexión... Reseteando.'));
    // Borramos la sesión
    resetSession();
    console.log(chalk.cyan('Esperaremos 45s y luego reiniciamos la vinculación...'));
    setTimeout(async () => {
      await initWhatsApp();
    }, 45000);
  }

  global.timestamp.connect = new Date();
  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

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

// Ejecutar la función principal
initWhatsApp().catch(console.error);
