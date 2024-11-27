// =======================================
// CONFIGURACIONES INICIALES Y MÓDULOS
// =======================================
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
import { hideBin } from 'yargs/helpers';
import { spawn } from 'child_process';
import syntaxerror from 'syntax-error';
import chalk from 'chalk';
import readline from 'readline';
import { format } from 'util';
import pino from 'pino';
import { tmpdir } from 'os';
import ws from 'ws';

import pkg from '@adiwajshing/baileys'; // Importar el paquete correcto
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
} = pkg;

import { Low, JSONFile } from 'lowdb';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

// Importación del plugin de bienvenida
import { handleWelcome } from './plugins/_welcome.js';

const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.__filename = function filename(
  pathURL = import.meta.url,
  rmPrefix = platform !== 'win32'
) {
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
                  global.APIKeys[
                    name in global.APIs ? global.APIs[name] : name
                  ],
              }
            : {}),
        })
      )
    : '');

global.timestamp = {
  start: new Date(),
};

const __dirname = global.__dirname(import.meta.url);

global.opts = yargs(hideBin(process.argv)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (global.opts['prefix'] || '\/\*\.\\\^').replace(
      /[|\\{}()[\]^$+*?.\-\^]/g,
      '\\$&'
    ) +
    ']'
);

global.db = new Low(
  /https?:\/\//.test(global.opts['db'] || '')
    ? new cloudDBAdapter(global.opts['db'])
    : /mongodb(\+srv)?:\/\//i.test(global.opts['db'])
    ? global.opts['mongodbv2']
      ? new mongoDBV2(global.opts['db'])
      : new mongoDB(global.opts['db'])
    : new JSONFile(`${global.opts._[0] ? global.opts._[0] + '_' : ''}database.json`)
);

global.DATABASE = global.db; // Compatibilidad con versiones anteriores

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
loadDatabase();

const usePairingCode = true; // Usar siempre el código de emparejamiento de 8 dígitos
const useMobile = process.argv.includes('--mobile');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = function (text) {
  return new Promise(function (resolve) {
    rl.question(text, resolve);
  });
};

const { version } = await fetchLatestBaileysVersion();
const { state, saveCreds } = await useMultiFileAuthState('./sessions');

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' }),
});
store.readFromFile('./baileys_store.json');
setInterval(() => {
  store.writeToFile('./baileys_store.json');
}, 10_000);

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  browser: ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      pino().child({
        level: 'silent',
        stream: 'store',
      })
    ),
  },
  getMessage: async (key) => {
    const messageData = await store.loadMessage(key.remoteJid, key.id);
    return messageData?.message || undefined;
  },
  connectTimeoutMs: 60000,
  defaultQueryTimeoutMs: 0,
  syncFullHistory: true,
  markOnlineOnConnect: true,
};

global.conn = makeWASocket(connectionOptions);
conn.isInit = false;

// Configurar bienvenida usando el plugin
conn.ev.on('group-participants.update', async (update) => {
  try {
    if (update.action === 'add') {
      const groupMetadata = await conn.groupMetadata(update.id);
      const chat = global.db.data.chats[update.id];

      if (chat?.bienvenida) {
        await handleWelcome(update, { conn, groupMetadata });
      } else {
        console.log(`Bienvenida desactivada para el grupo ${update.id}`);
      }
    }
  } catch (err) {
    console.error('Error en el evento de bienvenida:', err);
  }
});

// Mantén el resto del archivo intacto
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

process.on('uncaughtException', console.error);

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

// Código final intacto...
