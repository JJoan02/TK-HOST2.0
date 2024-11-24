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

// Configuración global
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (pathURL.startsWith('file://') ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString();
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true));
global.__require = (dir = import.meta.url) => createRequire(dir);

const PORT = process.env.PORT || 3000;
const TMP_DIR = tmpdir();
const __dirname = global.__dirname(import.meta.url);

// Inicialización
protoType();
serialize();
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp(
  '^[' +
    (opts.prefix || '!$%&.-').replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
    ']'
);

// Base de datos
global.db = new Low(
  /https?:\/\//.test(opts.db || '')
    ? new cloudDBAdapter(opts.db)
    : /mongodb(\+srv)?:\/\//i.test(opts.db)
    ? opts.mongodbv2
      ? new mongoDBV2(opts.db)
      : new mongoDB(opts.db)
    : new JSONFile(`${opts._[0] ? `${opts._[0]}_` : ''}database.json`)
);

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

// Configuración de conexión
const { version } = await fetchLatestBaileysVersion();
const { state, saveCreds } = await useMultiFileAuthState('./sessions');

const connectionOptions = {
  version,
  logger: pino({ level: 'info' }),
  browser: ['Admin-TK', 'Chrome', '1.0.0'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'silent' })),
  },
  syncFullHistory: true,
  markOnlineOnConnect: true,
  connectTimeoutMs: 60000,
};

global.conn = makeWASocket(connectionOptions);

// Carga automática de plugins
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

// Eventos de conexión
conn.ev.on('connection.update', (update) => {
  const { connection } = update;
  if (connection === 'connecting') console.log(chalk.blue('🔄 Conectando...'));
  else if (connection === 'open') console.log(chalk.green('✅ Conexión establecida.'));
  else if (connection === 'close') console.log(chalk.red('❌ Conexión cerrada.'));
});

// Limpieza de temporales
const limpiarTemp = () => {
  const rutas = [TMP_DIR, join(__dirname, './tmp')];
  rutas.forEach((dir) => {
    readdirSync(dir).forEach((file) => {
      const ruta = join(dir, file);
      if (statSync(ruta).isFile() && Date.now() - statSync(ruta).mtimeMs >= 3 * 60 * 1000) {
        unlinkSync(ruta);
      }
    });
  });
};

// Pruebas rápidas de entorno
(async () => {
  const pruebas = await Promise.all(
    ['ffmpeg', 'ffprobe', 'convert', 'magick', 'gm', 'find'].map((cmd) =>
      new Promise((resolve) => {
        const proceso = spawn(cmd);
        proceso.on('close', () => resolve(true));
        proceso.on('error', () => resolve(false));
      })
    )
  );
  global.support = Object.freeze({
    ffmpeg: pruebas[0],
    ffprobe: pruebas[1],
    convert: pruebas[2],
    magick: pruebas[3],
    gm: pruebas[4],
    find: pruebas[5],
  });
  console.log('📊 Soporte verificado:', global.support);
})();
