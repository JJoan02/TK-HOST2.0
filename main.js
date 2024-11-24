// ===============================
// IMPORTACIONES Y CONFIGURACIONES INICIALES
// ===============================
import './config.js';
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
} from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import syntaxerror from 'syntax-error';
import chalk from 'chalk';
import { tmpdir } from 'os';
import readline from 'readline';
import { format } from 'util';
import pino from 'pino';
import ws from 'ws';
import pkg from '@adiwajshing/baileys';
import { Low, JSONFile } from 'lowdb';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import { makeWASocket, protoType, serialize } from './lib/simple.js';

const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = pkg;

// ===============================
// CONFIGURACIONES GLOBALES
// ===============================
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (pathURL.startsWith('file://') ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString();
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true));
global.__require = (dir = import.meta.url) => createRequire(dir);

const PORT = process.env.PORT || 3000;
const TMP_DIR = tmpdir();
const __dirname = global.__dirname(import.meta.url);

// Inicialización de prototipos y utilidades
protoType();
serialize();
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts.prefix || '!$%&.-').replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
    ']'
);

// ===============================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ===============================
global.db = new Low(
  /https?:\/\//.test(opts.db || '')
    ? new cloudDBAdapter(opts.db)
    : /mongodb(\+srv)?:\/\//i.test(opts.db)
    ? opts.mongodbv2
      ? new mongoDBV2(opts.db)
      : new mongoDB(opts.db)
    : new JSONFile(`${opts._[0] ? `${opts._[0]}_` : ''}database.json`)
);
global.DATABASE = global.db;

global.loadDatabase = async function () {
  if (db.READ) {
    return new Promise((resolve) =>
      setInterval(async () => {
        if (!db.READ) {
          clearInterval(this);
          resolve(db.data == null ? global.loadDatabase() : db.data);
        }
      }, 1000)
    );
  }
  if (db.data !== null) return;
  db.READ = true;
  await db.read().catch(console.error);
  db.READ = null;
  db.data = {
    usuarios: {},
    chats: {},
    estadísticas: {},
    mensajes: {},
    stickers: {},
    configuraciones: {},
    ...(db.data || {}),
  };
  global.db.chain = lodash.chain(db.data);
};
await global.loadDatabase();

// ===============================
// CONFIGURACIÓN DE CONEXIÓN DE WhatsApp
// ===============================
const { version } = await fetchLatestBaileysVersion();
const { state, saveCreds } = await useMultiFileAuthState('./sessions');

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  browser: ['Admin-TK', 'Chrome', '1.0.0'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent' })),
  },
  syncFullHistory: true,
  markOnlineOnConnect: true,
  connectTimeoutMs: 60000,
  getMessage: async (key) => {
    const messageData = await store.loadMessage(key.remoteJid, key.id);
    return messageData?.message || undefined;
  },
};

global.conn = makeWASocket(connectionOptions);

// ===============================
// MANEJO DE CONEXIÓN Y EVENTOS
// ===============================
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, receivedPendingNotifications } = update;

  if (connection === 'connecting') console.log(chalk.blue('🔄 Conectando...'));
  else if (connection === 'open') console.log(chalk.green('✅ Conexión establecida.'));
  else if (connection === 'close') {
    console.log(chalk.red('❌ Conexión cerrada. Intentando reconectar...'));
    if (
      lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut &&
      conn.ws.readyState !== ws.CONNECTING
    ) {
      await global.reloadHandler(true);
    }
  }

  if (isOnline) console.log(chalk.green('📶 Bot en línea.'));
  if (receivedPendingNotifications) console.log(chalk.yellow('🔔 Recibiendo notificaciones pendientes.'));
}

conn.ev.on('connection.update', connectionUpdate);

// ===============================
// MENSAJES PERSONALIZADOS
// ===============================
conn.welcome = '🎉 Bienvenido @user al grupo: @subject\n\n¡Usa el comando `.reg nombre.edad` para registrarte!';
conn.bye = '👋 Adiós @user, esperamos verte de nuevo.';
conn.spromote = '🎖️ @user ahora es administrador.';
conn.sdemote = '⚠️ @user ya no es administrador.';
conn.sSubject = '📛 El nombre del grupo se cambió a: @subject';
conn.sDesc = '📝 La descripción del grupo se actualizó a: @desc';
conn.sAnnounceOn = '🔒 El grupo ahora está cerrado. Solo los administradores pueden enviar mensajes.';
conn.sAnnounceOff = '🔓 El grupo se ha abierto. Todos pueden enviar mensajes.';
conn.sRevoke = '🔗 El enlace del grupo se actualizó a: @revoke';

// ===============================
// CARGA Y RECARGA AUTOMÁTICA DE PLUGINS
// ===============================
const pluginFolder = join(__dirname, './plugins');
const pluginFilter = (filename) => /\.js$/.test(filename);

global.plugins = {};

async function cargarPlugins() {
  try {
    if (!existsSync(pluginFolder)) {
      console.warn(`⚠️ Carpeta de plugins no encontrada: ${pluginFolder}.`);
      return;
    }

    const archivos = readdirSync(pluginFolder).filter(pluginFilter);
    if (archivos.length === 0) {
      console.warn(`⚠️ No se encontraron plugins en la carpeta: ${pluginFolder}.`);
      return;
    }

    for (const filename of archivos) {
      const filePath = join(pluginFolder, filename);
      try {
        const module = await import(filePath);
        global.plugins[filename] = module.default || module;
        console.log(`✅ Plugin cargado: ${filename}`);
      } catch (err) {
        console.error(`❌ Error cargando plugin ${filename}:`, err.message);
      }
    }
  } catch (err) {
    console.error(`❌ Error general al cargar plugins: ${err.message}`);
  }
}

await cargarPlugins();

watch(pluginFolder, async (eventType, filename) => {
  if (pluginFilter(filename)) {
    const filePath = join(pluginFolder, filename);
    try {
      delete require.cache[require.resolve(filePath)];
      const module = await import(`${filePath}?update=${Date.now()}`);
      global.plugins[filename] = module.default || module;
      console.log(`♻️ Plugin recargado: ${filename}`);
    } catch (err) {
      console.error(`❌ Error recargando plugin ${filename}:`, err.message);
    }
  }
});

// ===============================
// FUNCIONES ADICIONALES
// ===============================
function clearTmp() {
  const tmpDirs = [TMP_DIR, join(__dirname, './tmp')];
  tmpDirs.forEach((dir) => {
    readdirSync(dir).forEach((file) => {
      const filePath = join(dir, file);
      const stats = statSync(filePath);
      if (stats.isFile() && Date.now() - stats.mtimeMs >= 3 * 60 * 1000) {
        unlinkSync(filePath);
        console.log(`🧹 Archivo temporal eliminado: ${filePath}`);
      }
    });
  });
}

async function resetLimit() {
  const users = Object.entries(global.db.data.usuarios || {});
  users.forEach(([id, data]) => {
    data.limit = 25;
  });
  console.log('✅ Límite diario reiniciado.');
}

setInterval(() => {
  clearTmp();
  resetLimit();
}, 24 * 60 * 60 * 1000); // Ejecutar cada 24 horas

// ===============================
// PRUEBAS RÁPIDAS
// ===============================
async function _quickTest() {
  const tests = await Promise.all(
    ['ffmpeg', 'ffprobe', 'convert', 'magick', 'gm', 'find'].map((cmd) =>
      new Promise((resolve) => {
        const proceso = spawn(cmd);
        proceso.on('close', () => resolve(true));
        proceso.on('error', () => resolve(false));
      })
    )
  );
  global.support = {
    ffmpeg: tests[0],
    ffprobe: tests[1],
    convert: tests[2],
    magick: tests[3],
    gm: tests[4],
    find: tests[5],
  };
  console.log('📊 Soporte de herramientas:', global.support);
}

_quickTest();
