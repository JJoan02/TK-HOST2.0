/* 
   =========================================================================================
   main.js - Flujo de Vinculación por Código 8 Dígitos Antes de Cualquier Mensaje Posterior
   =========================================================================================

   Pasos:
   1) Menú (opciones 1 o 2).
   2) Pide phoneNumber.
   3) Crea conexión, NO pide pairing code todavía.
   4) Cuando connection='open' => requestPairingCode => se muestra el code 8 díg.
   5) Esperamos que usuario vincule en WhatsApp => en "creds.update" si registered => postLinkFlow()
   6) postLinkFlow => restablece límites, arranca server, mensajes "Conectando..." etc.
   7) Si connection='close' => resetea TK-Session => espera 45s => initWhatsApp() de nuevo.
*/

////////////////////////////////////
// 1) Importar Config y Principales
////////////////////////////////////
import './config.js'; // Ajusta si tu config.js está en otro lugar
import chalk from 'chalk';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { spawn } from 'child_process';
import pino from 'pino';
import ws from 'ws';
import readline from 'readline';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  mkdirSync,
  rmSync
} from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { platform, argv } from 'process';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

////////////////////////////////////
// 2) Baileys (whiskeysockets)
////////////////////////////////////
import pkg from '@adiwajshing/baileys'; // Es la de npm:@whiskeysockets/baileys
const {
  makeInMemoryStore,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason
} = pkg;

////////////////////////////////////
// 3) LowDB y/o Mongo Adaptadores
////////////////////////////////////
import { Low, JSONFile } from 'lowdb';
import cloudDBAdapter from './lib/cloudDBAdapter.js'; // Comenta si NO lo usas
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'; // Comenta si NO lo usas

////////////////////////////////////
// 4) Baileys Personalizaciones
////////////////////////////////////
import { makeWASocket, protoType, serialize } from './lib/simple.js';
protoType();
serialize();

/*
   =====================================================================
   5) Variables Globales y Config
   =====================================================================
*/
let isInit = false; // Evitar ReferenceError
const { CONNECTING } = ws;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Definir __filename / __dirname
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

// createRequire
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

// APIs (opcional)
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
                  global.APIKeys[name in global.APIs ? global.APIs[name] : name]
              }
            : {})
        })
      )
    : '');

global.timestamp = { start: new Date() };
global.opts = yargs(hideBin(argv)).exitProcess(false).parse();
global.prefix = new RegExp(
  '^[' +
    (global.opts['prefix'] || '/\\!\\.\\^').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
    ']'
);

/*
   =====================================================================
   6) DB Setup (LowDB o Mongo)
   =====================================================================
*/
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
    ...(global.db.data || {})
  };
};
await global.loadDatabase();

// 7) Carpeta de Sesiones
const sessionsFolder = './TK-Session';
if (!existsSync(sessionsFolder)) {
  mkdirSync(sessionsFolder);
  console.log(chalk.green('Carpeta TK-Session creada.'));
}

// 8) Carpeta Plugins
const pluginsFolder = join(projectDir, 'plugins');
if (!existsSync(pluginsFolder)) {
  mkdirSync(pluginsFolder);
  console.log(chalk.magenta('✔ Carpeta "plugins" creada automáticamente (vacía).'));
}

/*
   ================================
   9) Menú Interactivo
   ================================
*/
import readline from 'readline';

async function showMenu() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const menuText = `
${chalk.hex('#FF69B4').bold('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓')}
${chalk.hex('#FF69B4').bold('┃')}  ${chalk.bold.bgMagenta('  MENÚ DE VINCULACIÓN  ')}  ${chalk.hex('#FF69B4').bold('┃')}
${chalk.hex('#FF69B4').bold('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛')}

${chalk.cyanBright('[1]')} Vincular por código de 8 dígitos ${chalk.yellow('🔑')}
${chalk.cyanBright('[2]')} Creado por Joan TK (igual genera code) ${chalk.greenBright('✅')}

Elige (1 o 2): `;

  function askMenu() {
    return new Promise((resolve) => {
      rl.question(menuText, (answer) => resolve(answer.trim()));
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

// Pedir phoneNumber sin +
async function askPhoneNumber() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const askText = chalk.blueBright('\n📲 Escribe tu número de WhatsApp (sin +), Ej: 5191052145:\n> ');

  return new Promise((resolve) => {
    rl.question(askText, (num) => {
      rl.close();
      resolve(num.trim());
    });
  });
}

/*
   ===========================================
   10) Limpieza de Sesiones, Temp, Reset Límits
   ===========================================
*/
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
    setTimeout(() => clearSessions(folder), 60 * 60 * 1000); // 1h
  }
}

function clearTmp() {
  const tmpDirs = [tmpdir(), join(global.__dirname(import.meta.url), 'tmp')];
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

// Reset total de la carpeta TK-Session
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
      console.log(chalk.magenta('Se ha reseteado la carpeta TK-Session (Sesiones).'));
    } else {
      mkdirSync(sessionsFolder);
    }
    return true;
  } catch (err) {
    console.error(chalk.red('Error al resetear TK-Session:'), err);
    return false;
  }
}

/*
   ==========================================
   11) reloadHandler - Carga 'handler.js'
   ==========================================
*/
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

  // Mensajes personal
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

/*
   ======================================
   12) postLinkFlow - Mensajes Posteriores
   ======================================
   => Se llamará cuando ya esté "registered" con code 8 díg
   => Aquí van "Límite restablecido", "Servidor listo => 4021",
      "Dependencias checadas", etc.
*/
let postLinkExecuted = false;
async function postLinkFlow() {
  if (postLinkExecuted) return;
  postLinkExecuted = true;

  // Mensaje "Conectando a WhatsApp..."
  console.log(chalk.yellow('Conectando a WhatsApp... (Ya registrado)'));

  // 1) Reset Límite
  resetLimit(); // "✅ Límite de usuarios restablecido automáticamente."

  // 2) Arrancar server / mostrar “Servidor listo en puerto => 4021”
  console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));

  // 3) Dependencias checadas
  await _quickTest(); // “Dependencias checadas: [...] - Prueba rápida realizada...”
}

/*
   ======================================
   13) initWhatsApp
   ======================================
   => Menú => askPhone => crea socket
   => Espera "open" => code => user vincula => "registered"
   => "creds.update" => si registered => postLinkFlow
*/
async function initWhatsApp() {
  // Menú
  const choice = await showMenu();
  console.log(chalk.blueBright(`Elegiste la opción ${choice} => Generar code 8 díg.`));

  // Teléfono
  const phoneNumber = await askPhoneNumber();
  console.log(chalk.greenBright(`[✅ RECIBIDO PHONE] ${phoneNumber}`));

  // Versión Baileys
  const { version } = await fetchLatestBaileysVersion();
  // Auth multiFile
  const { state, saveCreds } = await useMultiFileAuthState(sessionsFolder);
  global.saveCredsFunction = saveCreds;

  // Store
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
  store.readFromFile('./baileys_store.json');
  setInterval(() => store.writeToFile('./baileys_store.json'), 10000);

  // Config
  global.connectionOptions = {
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false, // No necesitamos QR, tenemos code 8 díg
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(
        state.keys,
        pino().child({ level: 'silent' })
      )
    },
    connectTimeoutMs: 120000,
    defaultQueryTimeoutMs: 120000,
    syncFullHistory: true,
    markOnlineOnConnect: true
  };

  // Creamos conn
  global.conn = makeWASocket(global.connectionOptions);
  global.conn.isInit = false;

  // Guardamos phoneNumber
  global.phoneNumberForPairing = phoneNumber;
  postLinkExecuted = false; // Para permitir postLinkFlow una sola vez

  // Listeners
  global.conn.ev.on('connection.update', connectionUpdate);
  global.conn.ev.on('creds.update', saveCreds);

  // reloadHandler
  global.reloadHandler = async function (restartConn) {
    return reloadHandler(restartConn);
  };
  await global.reloadHandler();

  // Limpieza
  clearSessions();
  if (!postLinkExecuted) {
    // No mostramos "Limite restablecido" ni nada todavía
  }
  if (!global.opts['test']) {
    // Aún no anunciamos "Servidor => 4021" ni "Dependencias"
    // Hasta que postLinkFlow se ejecute
  }
}

/*
   ======================================
   14) connectionUpdate
   ======================================
   => open => requestPairingCode
   => close => reset + reintento
   => creds.update => if registered => postLinkFlow
*/
async function connectionUpdate(update) {
  const { connection, lastDisconnect, isOnline, isNewLogin, receivedPendingNotifications } = update;

  if (connection === 'connecting') {
    console.log(chalk.yellow('⏳ Conectando a WhatsApp...'));
  } else if (connection === 'open') {
    console.log(chalk.greenBright('✅ Conexión establecida (no code yet).'));
    // Pedir code
    if (!global.conn.authState.creds.registered && global.conn.requestPairingCode) {
      try {
        const phoneNumber = global.phoneNumberForPairing || '51999999999';
        let code = await global.conn.requestPairingCode(phoneNumber);
        if (code) {
          code = code.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.magentaBright(`\n🔑 Tu código de emparejamiento es: `) + chalk.yellow.bold(code));
          console.log(chalk.gray('   Ingresa este código en WhatsApp para vincular.\n'));
        } else {
          console.log(chalk.redBright('⚠️ No se pudo generar el código de emparejamiento.'));
        }
      } catch (err) {
        console.error(chalk.redBright('❌ Error al solicitar pairing code:'), err);
      }
    }
  }

  // Si se desconecta
  if (connection === 'close') {
    console.log(chalk.red('❌ Se perdió la conexión... Reseteando.'));
    resetSession();
    console.log(chalk.cyan('Esperaremos 45s y re-iniciaremos la vinculación...'));
    setTimeout(async () => {
      await initWhatsApp();
    }, 45000);
  }
  global.timestamp.connect = new Date();
  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

// Escuchar "creds.update" => si registered => postLinkFlow
global.postLinkExecuted = false; // p/ no duplicar
function watchCredsRegistered() {
  global.conn.ev.on('creds.update', async () => {
    if (global.conn?.authState?.creds?.registered && !postLinkExecuted) {
      // => Se completó la vinculación
      await postLinkFlow();
    }
  });
}

// postLinkFlow: Se ejecuta una sola vez cuando registered
let postLinkOnce = false;
async function postLinkFlow() {
  if (postLinkOnce) return;
  postLinkOnce = true;

  console.log(chalk.yellow('Conexión y registro completados. Ahora sí:'));
  // 1) Restablecer límites
  resetLimit();

  // 2) Anunciamos "Servidor listo en => 4021"
  console.log(chalk.green(`\n🌐 Servidor listo en puerto => ${PORT}`));

  // 3) Checamos dependencias
  await _quickTest();
}

// ============================
// 15) _quickTest
// ============================
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
        '-'
      ]),
      spawn('convert'),
      spawn('magick'),
      spawn('gm'),
      spawn('find', ['--version'])
    ].map((p) =>
      Promise.race([
        new Promise((resolve) => {
          p.on('close', (code) => {
            resolve(code !== 127);
          });
        }),
        new Promise((resolve) => {
          p.on('error', (_) => resolve(false));
        })
      ])
    )
  );
  console.log(chalk.blueBright('🔍 Dependencias checadas:'), test);
  console.log(chalk.greenBright('☑️ Prueba rápida realizada, sesión => creds.json'));
}

// ==============================
// 16) INICIAR
// ==============================
async function main() {
  // Iniciamos "initWhatsApp"
  await initWhatsApp();
}

// Llamamos
main().catch(console.error);
