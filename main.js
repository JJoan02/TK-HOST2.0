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
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = pkg;

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

protoType();
serialize();

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts.prefix || '!$%&.-').replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') + ']');

// ===============================
// CONFIGURACIÓN DE BASE DE DATOS
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
};

global.conn = makeWASocket(connectionOptions);

async function initializeConnection() {
  return new Promise((resolve, reject) => {
    conn.ev.once('connection.update', async (update) => {
      const { connection, qr } = update;

      if (connection === 'connecting') {
        console.log(chalk.blue('🔄 Conectando...'));
      }

      if (qr) {
        console.log(chalk.yellow('📸 Escanea este código QR para vincular el bot.'));
      }

      if (connection === 'open') {
        console.log(chalk.green('✅ Vinculación completa. Conexión establecida.'));
        resolve(true);
      }

      if (connection === 'close') {
        console.log(chalk.red('❌ La conexión falló. Reintentando...'));
        reject(new Error('Conexión cerrada antes de vincular.'));
      }
    });
  });
}

// ===============================
// CONFIGURACIÓN DE PLUGINS
// ===============================
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  try {
    if (!existsSync(pluginFolder)) {
      console.warn(chalk.yellow(`⚠️ Carpeta de plugins no encontrada: ${pluginFolder}`));
      return;
    }

    const pluginFiles = readdirSync(pluginFolder).filter(pluginFilter);

    if (pluginFiles.length === 0) {
      console.warn(chalk.yellow(`⚠️ No se encontraron plugins en: ${pluginFolder}`));
      return;
    }

    for (const filename of pluginFiles) {
      const filePath = global.__filename(join(pluginFolder, filename));
      try {
        const module = await import(filePath);
        global.plugins[filename] = module.default || module;
        console.log(chalk.green(`✅ Plugin cargado: ${filename}`));
      } catch (error) {
        console.error(chalk.red(`❌ Error cargando plugin ${filename}: ${error.message}`));
        delete global.plugins[filename];
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error al inicializar plugins: ${error.message}`));
  }
}

// Recarga dinámica de plugins
global.reload = async (_event, filename) => {
  if (pluginFilter(filename)) {
    const filePath = global.__filename(join(pluginFolder, filename), true);

    if (filename in global.plugins) {
      if (existsSync(filePath)) {
        console.info(chalk.blue(`♻️ Recargando plugin: ${filename}`));
      } else {
        console.warn(chalk.yellow(`⚠️ Plugin eliminado: ${filename}`));
        delete global.plugins[filename];
        return;
      }
    } else {
      console.info(chalk.green(`➕ Cargando nuevo plugin: ${filename}`));
    }

    const err = syntaxerror(readFileSync(filePath), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });

    if (err) {
      console.error(chalk.red(`❌ Error de sintaxis en plugin '${filename}':\n${format(err)}`));
    } else {
      try {
        const module = await import(`${filePath}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
        console.info(chalk.green(`✅ Plugin actualizado: ${filename}`));
      } catch (error) {
        console.error(chalk.red(`❌ Error recargando plugin '${filename}': ${error.message}`));
      } finally {
        global.plugins = Object.fromEntries(
          Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );
      }
    }
  }
};

Object.freeze(global.reload);

// ===============================
// EJECUCIÓN PRINCIPAL
// ===============================
(async () => {
  try {
    console.log(chalk.blue('⚡ Inicializando bot...'));
    await initializeConnection();
    console.log(chalk.green('🚀 Conexión establecida. Cargando plugins...'));
    await filesInit();
    watch(pluginFolder, global.reload);
    console.log(chalk.green('✅ Plugins cargados correctamente.'));
  } catch (error) {
    console.error(chalk.red(`❌ Error durante la inicialización: ${error.message}`));
  }
})();
