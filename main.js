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
  mkdirSync,
  rmSync, // Importar rmSync para eliminar carpetas
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
import { Boom } from '@hapi/boom'; // Importar Boom para manejar errores

import pkg from '@adiwajshing/baileys'; // Importar el paquete correcto
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  makeWASocket,
} = pkg;

import { Low, JSONFile } from 'lowdb';
import { protoType, serialize } from './lib/simple.js';
import cloudDBAdapter from './lib/cloudDBAdapter.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';

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
    (global.opts['prefix'] || '/\\*\\.#\\$').replace(
      /[|\\{}()[\]^$+*?.\\-]/g,
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
    : new JSONFile(
        `${global.opts._[0] ? global.opts._[0] + '_' : ''}database.json`
      )
);

global.DATABASE = global.db; // Compatibilidad con versiones anteriores

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.db.READ) {
          clearInterval(this);
          resolve(
            global.db.data == null ? global.loadDatabase() : global.db.data
          );
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

// Variables globales para conn y handler
global.conn = null;
global.handler = null;

// Función para iniciar la conexión
async function startConnection() {
  // Crear la interfaz readline dentro de la función
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

  // Definir connectionOptions como global para poder modificarlo en reloadHandler
  global.connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // No imprimir QR
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

  // Inicializar la conexión
  global.conn = makeWASocket(global.connectionOptions);
  conn.isInit = false;

  if (!conn.authState.creds.registered) {
    // Vinculación mediante código de 8 dígitos
    console.log(chalk.green('Vinculación mediante código de 8 dígitos'));
    const phoneNumber = await question(
      chalk.blue(
        'Ingresa el número de WhatsApp en el cual estará el Bot (con código de país, sin +): '
      )
    );
    rl.close();

    if (conn.requestPairingCode) {
      let code = await conn.requestPairingCode(phoneNumber);
      code = code?.match(/.{1,4}/g)?.join('-') || code;
      console.log(chalk.magenta(`Su código de emparejamiento es: ${code}`));
      console.log(
        chalk.yellow(
          'Por favor, ingrese este código en su dispositivo WhatsApp para vincular.'
        )
      );
      console.log(chalk.green('\nEjemplo de número ingresado: 521234567890'));
    } else {
      console.error('La función requestPairingCode no está disponible.');
    }
  }

  // Configurar eventos
  conn.ev.on('connection.update', connectionUpdate);
  // ... otros eventos

  // Configurar las funciones de manejo
  await setupHandlers();

  // Esperar a que se cargue el handler antes de continuar
}

// Llamar a startConnection para iniciar el proceso
startConnection();

// Función para configurar los handlers
async function setupHandlers() {
  // Importar el handler
  let handlerModule = await import('./handler.js');
  global.handler = handlerModule;

  conn.handler = handler.handler.bind(conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(conn);
  conn.onDelete = handler.deleteUpdate.bind(conn);
  conn.connectionUpdate = connectionUpdate.bind(conn);
  conn.credsUpdate = conn.authState.saveCreds.bind(conn);

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);

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
}

// Continuar con el resto de la configuración y eventos...

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
    if (!existsSync(dirname)) {
      // Crear el directorio si no existe
      mkdirSync(dirname);
      console.log(`Directorio creado: ${dirname}`);
    }
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

    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

    if (reason === DisconnectReason.loggedOut) {
      console.log(
        'La sesión ha cerrado. Eliminando datos de sesión y reiniciando...'
      );
      // Eliminar la carpeta de sesiones
      rmSync('./sessions', { recursive: true, force: true });
      // Llamar a startConnection nuevamente
      await startConnection();
    } else {
      console.log('Intentando reconectar...');
      // Llamar a reloadHandler para reconectar
      console.log(await global.reloadHandler(true));
    }
  }

  global.timestamp.connect = new Date();

  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

process.on('uncaughtException', console.error);

global.reloadHandler = async function (restartConn) {
  try {
    await setupHandlers(); // Reconfigurar los handlers
  } catch (e) {
    console.error(e);
  }
  if (restartConn) {
    const oldChats = conn.chats;
    try {
      conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(global.connectionOptions, { chats: oldChats });
    conn = global.conn; // Actualizar la referencia de conn
    conn.isInit = true;
    await setupHandlers(); // Configurar los handlers nuevamente
  }
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
      if (existsSync(dir))
        conn.logger.info(`Re - require plugin '${filename}'`);
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
          Object.entries(global.plugins).sort(([a], [b]) =>
            a.localeCompare(b)
          )
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
                      
