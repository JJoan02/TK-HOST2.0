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
import chalk from 'chalk';
import { tmpdir } from 'os';
import readline from 'readline';
import pino from 'pino';
import pkg from '@adiwajshing/baileys';
import { Low, JSONFile } from 'lowdb';
import dotenv from 'dotenv';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

dotenv.config(); // Carga variables de entorno desde un archivo .env

// Definición de utilidades globales
global.__filename = (pathURL = import.meta.url, rmPrefix = platform !== 'win32') =>
  rmPrefix ? (pathURL.startsWith('file://') ? fileURLToPath(pathURL) : pathURL) : pathToFileURL(pathURL).toString();
global.__dirname = (pathURL) => path.dirname(global.__filename(pathURL, true));
global.__require = (dir = import.meta.url) => createRequire(dir);

const PORT = process.env.PORT || 3000;
const TMP_DIR = tmpdir();
const __dirname = global.__dirname(import.meta.url);

// Inicialización de utilidades
protoType();
serialize();
global.opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (opts.prefix || '!$%&.-').replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
    ']'
);

// Base de datos: configuración modular y segura
const dbPath = process.env.DB_PATH || `${opts._[0] ? `${opts._[0]}_` : ''}database.json`;
global.db = new Low(
  /https?:\/\//.test(opts.db || '')
    ? new cloudDBAdapter(opts.db)
    : /mongodb(\+srv)?:\/\//i.test(opts.db)
    ? opts.mongodbv2
      ? new mongoDBV2(opts.db)
      : new mongoDB(opts.db)
    : new JSONFile(dbPath)
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
const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = pkg;
const { version } = await fetchLatestBaileysVersion();
const { state, saveCreds } = await useMultiFileAuthState('./sessions');

const connectionOptions = {
  version,
  logger: pino({ level: process.env.LOG_LEVEL || 'info' }),
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

// Utilidades para manejo de archivos temporales y sesiones
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

const limpiarSesiones = async (directorio = './sessions') => {
  try {
    const archivos = readdirSync(directorio);
    archivos.forEach((archivo) => {
      const ruta = join(directorio, archivo);
      if (statSync(ruta).isFile() && archivo !== 'creds.json') unlinkSync(ruta);
    });
  } catch (err) {
    console.error(`Error limpiando sesiones: ${err.message}`);
  }
};

// Configuración de mensajes personalizados y internacionalización
const mensajes = {
  bienvenida: `✨ Bienvenido, @user! Soy *Admin-TK*, tu administrador. Usa el comando \`.reg nombre.edad\` para registrarte.`,
  despedida: `👋 ¡Hasta pronto, @user!`,
  adminPromovido: `✅ @user ha sido promovido a administrador.`,
  adminDegradado: `❌ @user ya no es administrador.`,
};

global.mensajes = mensajes;

// Recarga dinámica de plugins
const carpetaPlugins = join(__dirname, './plugins/index');
const filtroPlugins = (archivo) => /\.js$/.test(archivo);

global.plugins = {};
const cargarPlugins = async () => {
  readdirSync(carpetaPlugins)
    .filter(filtroPlugins)
    .forEach(async (archivo) => {
      try {
        const ruta = global.__filename(join(carpetaPlugins, archivo));
        global.plugins[archivo] = (await import(ruta)).default || {};
      } catch (err) {
        console.error(`Error cargando plugin ${archivo}:`, err);
        delete global.plugins[archivo];
      }
    });
};
await cargarPlugins();
watch(carpetaPlugins, cargarPlugins);

// Manejo de eventos
const manejarConexión = (actualización) => {
  const { connection } = actualización;
  if (connection === 'connecting') console.log(chalk.blue('🔄 Conectando...'));
  else if (connection === 'open') console.log(chalk.green('✅ Conexión establecida.'));
  else if (connection === 'close') console.log(chalk.red('❌ Conexión cerrada.'));
};
conn.ev.on('connection.update', manejarConexión);

// Pruebas de soporte
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
