// =======================================
// CONFIGURACIONES INICIALES Y MÓDULOS
// =======================================
import './config.js';

import path, { join } from 'path';
import { platform } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { spawn } from 'child_process';
import syntaxerror from 'syntax-error';
import chalk from 'chalk';
import readline from 'readline';
import { format } from 'util';
import pino from 'pino';
import { tmpdir } from 'os';
import ws from 'ws';

const requireCJS = createRequire(import.meta.url);
const baileys = requireCJS('@whiskeysockets/baileys');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} = baileys;

import { Low, JSONFile } from 'lowdb';
import { makeWASocket as simpleSocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

// Helpers globales
global.__filename = (pathURL = import.meta.url, rm = platform !== 'win32') =>
  rm ? (pathURL.startsWith('file://') ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString();
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true));
global.__require = (dir = import.meta.url) => createRequire(dir);

global.API = (name, p = '/', q = {}, key) =>
  (name in global.APIs ? global.APIs[name] : name) +
  p +
  (q || key
    ? '?' + new URLSearchParams({
        ...q,
        ...(key ? { [key]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {})
      })
    : '');

// DB
global.timestamp = { start: new Date() };
const __dir = global.__dirname(import.meta.url);

global.opts = yargs(hideBin(process.argv)).exitProcess(false).parse();

const defaultPrefix = '/';
const rawPrefix = global.opts.prefix || defaultPrefix;
const safePrefix = Array.isArray(rawPrefix) ? rawPrefix.join('') : rawPrefix;
global.prefix = new RegExp(`^[${safePrefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}]`);

global.db = new Low(
  /https?:\/\//.test(global.opts.db)
    ? new cloudDBAdapter(global.opts.db)
    : /mongodb(\+srv)?:\/\//i.test(global.opts.db)
    ? global.opts.mongodbv2
      ? new mongoDBV2(global.opts.db)
      : new mongoDB(global.opts.db)
    : new JSONFile(`${global.opts._[0] ? global.opts._[0] + '_' : ''}database.json`)
);
global.DATABASE = global.db;

global.loadDatabase = async () => {
  if (global.db.READ) {
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(global.db.data ?? global.loadDatabase());
        }
      }, 1000)
    );
  }
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
    ...(global.db.data || {})
  };
};
loadDatabase();

// Pairing
const usePairingCode = true;
const useMobile = process.argv.includes('--mobile');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (t) => new Promise((r) => rl.question(t, r));

// Baileys auth & store
// Baileys auth & store
const { version } = await fetchLatestBaileysVersion();
const { state, saveCreds } = await useMultiFileAuthState('./sessions');

// Opciones de conexión
const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  browser: ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent' }))
  },
  getMessage: async (key) => {
    return null;
  },
  generateHighQualityLinkPreview: true,
  patchMessageBeforeSending: (m) =>
    m.buttonsMessage || m.templateMessage || m.listMessage
      ? { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} }, ...m } } }
      : m,
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 0,
  syncFullHistory: true,
  markOnlineOnConnect: true
};

// CORRECTO: NO USAR makeInMemoryStore
global.conn = simpleSocket(connectionOptions);
conn.isInit = false;

// Guarda las credenciales cada vez que cambien
conn.ev.on('creds.update', saveCreds);

// Ejemplo básico de “store” usando eventos nativos (mensaje recibido)
conn.ev.on('messages.upsert', async ({ messages }) => {
  for (const msg of messages) {
    if (!msg.message) continue;              // ignora mensajes vacíos
    const from = msg.key.remoteJid;          // quién envía
    console.log(`📩 Mensaje de ${from}:`, msg.message);
    // aquí va tu lógica de manejo / respuestas
  }
});
// ───────────────────────────────────────────────────────────────────────

// El resto de tu lógica queda igual...

if (usePairingCode && !conn.authState.creds.registered) {
  const phoneNumber = await question(
    chalk.blue(
      'Ingresa el número de WhatsApp en el cual estará el Bot (con código de país, sin +): '
    )
  );
  rl.close();

  if (conn.requestPairingCode) {
    let code = await conn.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join('-') || code;
    console.log(chalk.magenta(`Su código de emparejamiento es:`, code));
  } else {
    console.error('La función requestPairingCode no está disponible.');
  }
}

if (!global.opts['test']) {
  (await import('./server.js')).default(PORT);
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error);
    clearTmp();
  }, 60 * 1000);
}

async function resetLimit() {
  try {
    const users = global.db.data.users || {};
    const lim = 25; // Valor de límite predeterminado

    for (let user in users) {
      if (users[user].limit <= lim) {
        users[user].limit = lim;
      }
    }

    console.log(`✅ Límite de usuarios restablecido automáticamente.`);
  } finally {
    setTimeout(() => resetLimit(), 24 * 60 * 60 * 1000); // Cada 24 horas
  }
}
resetLimit();

function clearTmp() {
  const tmpDirs = [tmpdir(), join(__dirname, './tmp')];
  const files = [];

  tmpDirs.forEach((dirname) => {
    readdirSync(dirname).forEach((file) => {
      files.push(join(dirname, file));
    });
  });

  files.forEach((file) => {
    const stats = statSync(file);
    if (
      stats.isFile() &&
      Date.now() - stats.mtimeMs >= 1000 * 60 * 3
    ) {
      unlinkSync(file);
    }
  });
}

async function clearSessions(folder = './sessions') {
  try {
    const filenames = readdirSync(folder);
    filenames.forEach((file) => {
      const filePath = path.join(folder, file);
      const stats = statSync(filePath);
      if (stats.isFile() && file !== 'creds.json') {
        unlinkSync(filePath);
        console.log('Sesión eliminada:', filePath);
      }
    });
  } catch (err) {
    console.error(`Error en Clear Sessions: ${err.message}`);
  } finally {
    setTimeout(() => clearSessions(folder), 1 * 3600000); // Cada 1 hora
  }
}
clearSessions();

async function connectionUpdate(update) {
  const {
    receivedPendingNotifications,
    connection,
    lastDisconnect,
    isOnline,
    isNewLogin,
  } = update;

  if (isNewLogin) {
    conn.isInit = true;
  }

  if (connection === 'connecting') {
    console.log(
      chalk.redBright('✦ Activando el bot, por favor espere un momento...')
    );
  } else if (connection === 'open') {
    console.log(chalk.green('✅ Conectado'));
  }

  if (isOnline === true) {
    console.log(chalk.green('✦ Estado online'));
  } else if (isOnline === false) {
    console.log(chalk.red('✦ Estado offline'));
  }

  if (receivedPendingNotifications) {
    console.log(chalk.yellow('✧ Esperando mensajes'));
  }

  if (connection === 'close') {
    console.log(
      chalk.red('✦ Desconectado e intentando volver a conectarse...')
    );
  }

  global.timestamp.connect = new Date();

  if (
    lastDisconnect &&
    lastDisconnect.error &&
    lastDisconnect.error.output &&
    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut &&
    conn.ws.readyState !== CONNECTING
  ) {
    console.log(await global.reloadHandler(true));
  }

  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restartConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  // Mensajes personalizados
  conn.welcome = `❖━━━━━━[ BIENVENIDO ]━━━━━━❖

┏------━━━━━━━━•
│☘︎ @subject
┣━━━━━━━━┅┅┅
│( 👋 Hola @user)
├[ ¡Soy *Admin-TK* ]
├ tu administrador en este grupo! —

│ Por favor, regístrate con el comando:
│ \`.reg nombre.edad\`
┗------━━┅┅┅

------┅┅ Descripción ┅┅––––––

@desc`;
  conn.bye = '❖━━━━━━[ BYEBYE ]━━━━━━❖\n\nSayonara @user 👋😃';
  conn.spromote = '*✧ @user ahora es admin!*';
  conn.sdemote = '*✧ @user ya no es admin!*';
  conn.sDesc = '*✧ La descripción se actualizó a* \n@desc';
  conn.sSubject = '*✧ El nombre del grupo fue alterado a* \n@subject';
  conn.sIcon = '*✧ Se actualizó el nombre del grupo!*';
  conn.sRevoke = '*✧ El link del grupo se actualizó a* \n@revoke';
  conn.sAnnounceOn =
    '*✧ Grupo cerrado!*\n> Ahora solo los admins pueden enviar mensajes.';
  conn.sAnnounceOff =
    '*✧ El grupo fue abierto!*\n> Ahora todos pueden enviar mensajes.';
  conn.sRestrictOn =
    '*✧ Ahora solo los admin podrán editar la información del grupo!*';
  conn.sRestrictOff =
    '*✧ Ahora todos pueden editar la información del grupo!*';

  conn.handler = handler.handler.bind(global.conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
  for (let filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      let file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      delete global.plugins[filename];
    }
  }
}
filesInit().then(() => Object.keys(global.plugins));

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    let dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(`Re - require plugin '${filename}'`);
      else {
        conn.logger.warn(`Plugin eliminado '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`Requiriendo nuevo plugin '${filename}'`);
    let err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err)
      conn.logger.error(
        `Error de sintaxis al cargar '${filename}'\n${format(err)}`
      );
    else
      try {
        const module = await import(
          `${global.__filename(dir)}?update=${Date.now()}`
        );
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(
          `Error al requerir plugin '${filename}'\n${format(e)}`
        );
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );
      }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

// Prueba rápida

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
    ].map((p) => {
      return Promise.race([
        new Promise((resolve) => {
          p.on('close', (code) => {
            resolve(code !== 127);
          });
        }),
        new Promise((resolve) => {
          p.on('error', (_) => resolve(false));
        }),
      ]);
    })
  );
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  console.log(test);
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
}
_quickTest().then(() =>
  conn.logger.info(
    '☑️ Prueba rápida realizada, nombre de la sesión ~> creds.json'
  )
);
