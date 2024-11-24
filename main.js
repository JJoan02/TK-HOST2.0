// =======================================
// CONFIGURACIONES INICIALES Y MÓDULOS
// =======================================
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './plugins/_content.js';

import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import { createRequire } from 'module';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watchFile,
  unwatchFile,
} from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import readline from 'readline';
import { format } from 'util';
import pino from 'pino';
import { tmpdir } from 'os';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';
import { Boom } from '@hapi/boom';

import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js';
import pkg from '@whiskeysockets/baileys';
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC,
} = pkg;

// =======================================
// SUPRESIÓN DE MENSAJES ESPECÍFICOS DEL CONSOLE
// =======================================

// Suprimir ciertos mensajes de consola para limpiar la salida
const originalConsoleWarn = console.warn;
console.warn = function (...args) {
  const message = args[0];
  const decodedMessages = [
    Buffer.from("Q2xvc2luZyBzdGFsZSBvcGVu", 'base64').toString('utf-8'), // "Closing stale open"
    Buffer.from("Q2xvc2luZyBvcGVuIHNlc3Npb24=", 'base64').toString('utf-8'), // "Closing open session"
    Buffer.from("RXJyb3I6IEJhZCBNQUM=", 'base64').toString('utf-8'), // "Error: Bad MAC"
  ];
  if (typeof message === 'string' && decodedMessages.some((decMsg) => message.includes(decMsg))) {
    args[0] = "";
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = function (...args) {
  const message = args[0];
  const decodedMessages = [
    Buffer.from("RmFpbGVkIHRvIGRlY3J5cHQ=", 'base64').toString('utf-8'), // "Failed to decrypt"
    Buffer.from("U2Vzc2lvbiBlcnJvcg==", 'base64').toString('utf-8'), // "Session error"
    Buffer.from("RXJyb3I6IEJhZCBNQUM=", 'base64').toString('utf-8'), // "Error: Bad MAC"
  ];
  if (typeof message === 'string' && decodedMessages.some((decMsg) => message.includes(decMsg))) {
    args[0] = "";
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleLog = console.log;
console.log = function (...args) {
  const message = args[0];
  const decodedMessages = [
    Buffer.from("RXJyb3I6IEJhZCBNQUM=", 'base64').toString('utf-8'), // "Error: Bad MAC"
  ];
  if (typeof message === 'string' && decodedMessages.some((decMsg) => message.includes(decMsg))) {
    args[0] = "";
  }
  originalConsoleLog.apply(console, args);
};

// Suprimir console.info y console.debug
console.info = () => {};
console.debug = () => {};

// =======================================
// CONFIGURACIÓN GLOBAL Y FUNCIONES ÚTILES
// =======================================

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

protoType();
serialize();

// Parsear argumentos de línea de comandos
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

// Establecer prefijos de comandos
global.prefix = new RegExp(
  '^[' +
    (opts['prefix'] || '*/!#$%&?@.-').replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&') +
    ']'
);

// Configurar base de datos principal
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '')
    ? new cloudDBAdapter(opts['db'])
    : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
);

global.DATABASE = global.db; // Backwards Compatibility

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
  global.db.chain = lodash.chain(global.db.data);
};

loadDatabase();

// =======================================
// CONFIGURACIÓN DE CHATGPT
// =======================================
global.chatgpt = new Low(new JSONFile(path.join(__dirname, '/db/chatgpt.json')));
global.loadChatgptDB = async function loadChatgptDB() {
  if (global.chatgpt.READ)
    return new Promise((resolve) =>
      setInterval(async function () {
        if (!global.chatgpt.READ) {
          clearInterval(this);
          resolve(global.chatgpt.data === null ? global.loadChatgptDB() : global.chatgpt.data);
        }
      }, 1000)
    );
  if (global.chatgpt.data !== null) return;
  global.chatgpt.READ = true;
  await global.chatgpt.read().catch(console.error);
  global.chatgpt.READ = null;
  global.chatgpt.data = {
    users: {},
    ...(global.chatgpt.data || {}),
  };
  global.chatgpt.chain = lodash.chain(global.chatgpt.data);
};

loadChatgptDB();

// =======================================
// CONFIGURACIÓN DE CONEXIÓN Y VINCULACIÓN
// =======================================
global.authFile = 'BotSession';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();

let phoneNumber = global.botNumberCode;
const methodCodeQR = process.argv.includes('qr');
const methodCode = !!phoneNumber || process.argv.includes('code');
const MethodMobile = process.argv.includes('mobile');

// Interfaz para entrada del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

const question = (text) => {
  rl.prompt();
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Selección del método de vinculación
let opcion;
if (methodCodeQR) {
  opcion = '1';
}

if (!methodCodeQR && !methodCode && !existsSync(`./${authFile}/creds.json`)) {
  do {
    opcion = await question(
      `${chalk.blueBright('Seleccione el método de vinculación:')}
${chalk.green('1')}: Código QR
${chalk.green('2')}: Código de 8 dígitos

${chalk.bold.magentaBright('---> ')}`
    );
    if (!/^[1-2]$/.test(opcion)) {
      console.log(chalk.bold.redBright('⚠️ Por favor, ingrese 1 o 2.'));
    }
  } while (opcion !== '1' && opcion !== '2');
}

// Opciones de conexión
const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion === '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
  browser:
    opcion === '1'
      ? ['Bot', 'Edge', '2.0.0']
      : methodCodeQR
      ? ['Bot', 'Edge', '2.0.0']
      : ['Ubuntu', 'Edge', '110.0.1587.56'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  syncFullHistory: true,
  getMessage: async (key) => {
    const msg = await store.loadMessage(key.remoteJid, key.id);
    return msg?.message || undefined;
  },
  msgRetryCounterCache: new NodeCache(),
  defaultQueryTimeoutMs: undefined,
};

// Inicialización de la conexión
global.conn = makeWASocket(connectionOptions);

// Manejo de emparejamiento por código
if (!existsSync(`./${authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      let addNumber;
      if (phoneNumber) {
        addNumber = phoneNumber.replace(/[^0-9]/g, '');
      } else {
        do {
          phoneNumber = await question(
            chalk.bgBlack(
              chalk.bold.greenBright('📱 Por favor, ingrese su número de teléfono con el código de país: ')
            )
          );
          phoneNumber = phoneNumber.replace(/\D/g, '');
        } while (!Object.keys(PHONENUMBER_MCC).some((v) => phoneNumber.startsWith(v)));
        rl.close();
        addNumber = phoneNumber.replace(/\D/g, '');
      }
      setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(addNumber);
        codeBot = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot;
        console.log(
          chalk.bold.white(chalk.bgMagenta('🔑 Su código de emparejamiento es:')),
          chalk.bold.white(chalk.white(codeBot))
        );
      }, 2000);
    }
  }
}

conn.isInit = false;
conn.well = false;

// =======================================
// MANEJO DE EVENTOS Y CONEXIÓN
// =======================================
async function connectionUpdate(update) {
  const { connection, lastDisconnect, qr } = update;

  if (qr && (opcion === '1' || methodCodeQR)) {
    console.log(chalk.magenta('📸 Escanea este código QR para vincular el bot.'));
  }

  if (connection === 'connecting') {
    console.log(chalk.blue('🔄 Conectando al servidor de WhatsApp...'));
  } else if (connection === 'open') {
    console.log(chalk.green('✅ Conexión establecida con éxito.'));
  } else if (connection === 'close') {
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    console.log(
      chalk.red(`❌ Conexión cerrada: ${lastDisconnect?.error?.message || 'Desconocido'}. Reintentando: ${shouldReconnect ? 'Sí' : 'No'}`)
    );
    if (shouldReconnect) {
      await reloadHandler(true);
    } else {
      console.log(chalk.red('El bot fue desconectado permanentemente.'));
    }
  }

  if (lastDisconnect?.error?.output?.statusCode === 405) {
    await unlinkSync(`${authFile}/creds.json`);
    console.log(chalk.bold.redBright('❌ Sesión inválida. Reiniciando...'));
    process.send('reset');
  }

  if (connection === 'open') {
    console.log(chalk.bold.greenBright('✅ Conexión abierta.'));
  }

  if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    switch (reason) {
      case DisconnectReason.badSession:
        console.log(chalk.bold.cyanBright('❌ Sesión mala. Reiniciando...'));
        break;
      case DisconnectReason.connectionClosed:
        console.log(chalk.bold.magentaBright('🔒 Conexión cerrada. Reintentando...'));
        await reloadHandler(true);
        break;
      case DisconnectReason.connectionLost:
        console.log(chalk.bold.blueBright('🔍 Conexión perdida. Reintentando...'));
        await reloadHandler(true);
        break;
      case DisconnectReason.connectionReplaced:
        console.log(chalk.bold.yellowBright('🔄 Conexión reemplazada.'));
        break;
      case DisconnectReason.loggedOut:
        console.log(chalk.bold.redBright('❌ Cerrado. Sesión cerrada.'));
        await reloadHandler(true);
        break;
      case DisconnectReason.restartRequired:
        console.log(chalk.bold.cyanBright('🔁 Reinicio requerido. Reiniciando...'));
        await reloadHandler(true);
        break;
      case DisconnectReason.timedOut:
        console.log(chalk.bold.yellowBright('⏰ Tiempo de espera agotado. Reintentando...'));
        await reloadHandler(true);
        break;
      default:
        console.log(chalk.bold.redBright(`❌ Desconexión inesperada: ${reason}`));
    }
  }

  global.timestamp.connect = new Date();

  if (
    lastDisconnect &&
    lastDisconnect.error &&
    lastDisconnect.error.output &&
    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut &&
    conn.ws.readyState !== ws.CONNECTING
  ) {
    console.log(await reloadHandler(true));
  }

  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

// Asociar el manejador de eventos de conexión
conn.ev.on('connection.update', connectionUpdate);

// Manejo de credenciales
conn.ev.on('creds.update', saveCreds);

// =======================================
// CARGA Y RECARGA DE PLUGINS
// =======================================
const pluginFolderPath = join(__dirname, './plugins/index');
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

// Función para cargar plugins
async function loadPlugins() {
  try {
    if (!existsSync(pluginFolderPath)) {
      console.warn(chalk.yellow(`⚠️ Carpeta de plugins no encontrada: ${pluginFolderPath}`));
      return;
    }

    const pluginFiles = readdirSync(pluginFolderPath).filter(pluginFilter);

    if (pluginFiles.length === 0) {
      console.warn(chalk.yellow(`⚠️ No se encontraron plugins en: ${pluginFolderPath}`));
      return;
    }

    for (const file of pluginFiles) {
      try {
        const filePath = join(pluginFolderPath, file);
        const plugin = await import(filePath);
        global.plugins[file] = plugin.default || plugin;
        console.log(chalk.green(`📦 Plugin cargado: ${file}`));
      } catch (error) {
        console.error(chalk.red(`❌ Error al cargar plugin ${file}:`, error.message));
        delete global.plugins[file];
      }
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error al cargar plugins: ${error.message}`));
  }
}

// Cargar plugins inicialmente
await loadPlugins();

// Recarga dinámica de plugins
global.reload = async (_event, filename) => {
  if (pluginFilter(filename)) {
    const filePath = join(pluginFolderPath, filename);
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
      return;
    }

    try {
      const plugin = await import(`${filePath}?update=${Date.now()}`);
      global.plugins[filename] = plugin.default || plugin;
      console.log(chalk.green(`✅ Plugin actualizado: ${filename}`));
    } catch (error) {
      console.error(chalk.red(`❌ Error recargando plugin '${filename}':\n${format(error)}`));
    } finally {
      // Ordenar plugins alfabéticamente
      global.plugins = Object.fromEntries(
        Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
      );
    }
  }
};

// Bloquear la función de recarga para evitar modificaciones accidentales
Object.freeze(global.reload);

// Observar cambios en la carpeta de plugins
watch(pluginFolderPath, global.reload);

// Función de recarga de handler
let handler = await import('./handler.js');
global.reloadHandler = async function (restartConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
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
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  // Información para Grupos con emojis
  conn.welcome = `🎉❖━━━━━━[ BIENVENIDO ]━━━━━━❖🎉
  
┏------━━━━━━━━•
│☘︎ @subject
┣━━━━━━━━┅┅┅
│( 👋 Hola @user)
├[ ¡Soy *Admin-TK* ]
├ tu administrador en este grupo! —
│\n
│ Por favor, regístrate con el comando:
│ \`.reg nombre.edad\`
┗------━━┅┅┅

------┅┅ Descripción ┅┅––––––

@desc`;
  conn.bye = `❖━━━━━━[ BYEBYE ]━━━━━━❖

👋😃 Sayonara @user`;
  conn.spromote = `*✧ @user ahora es admin!*`;
  conn.sdemote = `*✧ @user ya no es admin!*`;
  conn.sDesc = `*✧ La descripción se actualizó a* 
@desc`;
  conn.sSubject = `*✧ El nombre del grupo fue alterado a* 
@subject`;
  conn.sIcon = `*✧ Se actualizó el nombre del grupo!*`;
  conn.sRevoke = `*✧ El link del grupo se actualizó a* 
@revoke`;
  conn.sAnnounceOn = `*✧ Grupo cerrado!*\n> Ahora solo los admins pueden enviar mensajes.`;
  conn.sAnnounceOff = `*✧ El grupo fue abierto!*\n> Ahora todos pueden enviar mensajes.`;
  conn.sRestrictOn = `*✧ Ahora solo los admin podran editar la información del grupo!*`;
  conn.sRestrictOff = `*✧ Ahora todos pueden editar la información del grupo!*`;

  // Asignar funciones manejadoras
  conn.handler = handler.handler.bind(global.conn);
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn);

  // Registrar eventos
  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

// =======================================
// PRUEBAS RÁPIDAS
// =======================================
async function _quickTest() {
  const tools = [
    { name: 'ffmpeg', args: [] },
    { name: 'ffprobe', args: [] },
    { name: 'ffmpegWebp', args: ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-'] },
    { name: 'convert', args: [] },
    { name: 'magick', args: [] },
    { name: 'gm', args: [] },
    { name: 'find', args: ['--version'] },
  ];

  const results = await Promise.all(
    tools.map(({ name, args }) =>
      new Promise((resolve) => {
        const proc = spawn(name, args);
        proc.on('close', (code) => resolve(code !== 127));
        proc.on('error', () => resolve(false));
      })
    )
  );

  const support = tools.reduce((acc, tool, index) => {
    acc[tool.name] = results[index];
    return acc;
  }, {});

  global.support = support;
  console.log(chalk.blue('📊 Soporte de herramientas:'), support);
  Object.freeze(global.support);
}

_quickTest()
  .then(() => console.info(chalk.bold.green('☑️ Prueba rápida completada.')))
  .catch(console.error);

// =======================================
// LIMPIEZA Y MANTENIMIENTO AUTOMÁTICO
// =======================================

function clearTmp() {
  const tmpDirs = [tmpdir(), join(__dirname, 'tmp')];
  tmpDirs.forEach((dir) => {
    if (existsSync(dir)) {
      readdirSync(dir).forEach((file) => {
        const filePath = join(dir, file);
        try {
          const stats = statSync(filePath);
          if (stats.isFile() && Date.now() - stats.mtimeMs > 60000) { // 1 minuto
            unlinkSync(filePath);
            console.log(chalk.blue(`🧹 Archivo temporal eliminado: ${filePath}`));
          }
        } catch (error) {
          console.error(chalk.red(`❌ Error al eliminar archivo temporal ${filePath}: ${error.message}`));
        }
      });
    }
  });
}

// =======================================
// CONFIGURACIÓN DE CONEXIÓN Y VINCULACIÓN
// =======================================
global.authFile = 'BotSession';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  browser: ['Admin-TK', 'Chrome', '3.0.0'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
  },
  syncFullHistory: true,
  markOnlineOnConnect: true,
};

// Inicialización de la conexión
global.conn = makeWASocket(connectionOptions);

conn.ev.on('connection.update', async (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'open') {
    console.log(chalk.green('✅ Bot conectado correctamente.'));
  } else if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    console.error(chalk.red(`❌ Conexión cerrada, razón: ${reason || 'Desconocida'}`));
  }
});

conn.ev.on('creds.update', saveCreds);

// =======================================
// LIMPIEZA Y CICLO AUTOMÁTICO
// =======================================
setInterval(() => {
  clearTmp();
  console.log(chalk.green('✅ Limpieza automática completada.'));
}, 60000); // Cada 1 minuto

// =======================================
// PROCESO PRINCIPAL
// =======================================
(async () => {
  try {
    console.log(chalk.blue('⚡ Iniciando Admin-TK...'));
    await conn;
  } catch (error) {
    console.error(chalk.red(`❌ Error al iniciar el bot: ${error.message}`));
    process.exit(1);
  }
})();
