// index.js
import yargs from 'yargs';
import cfonts from 'cfonts';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import { openDb } from './data/codigos.js'; // Importamos la función openDb
import cron from 'node-cron'; // Importamos node-cron para tareas programadas

// Configuración global
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname); // Permite usar `require` en ES Modules
const { name, author } = require(join(__dirname, './package.json')); // Carga la información desde el package.json
const rl = createInterface(process.stdin, process.stdout);
let procesoEjecutandose = false; // Indicador para saber si el proceso está corriendo

// Función para mostrar los banners de inicio
function mostrarBanner() {
  const banners = [
    { texto: 'Admin-TK', fuente: 'block', alineación: 'center', colores: ['cyan'] },             // Escala 3 (grande)
    { texto: 'TK-HOST', fuente: 'console', alineación: 'center', colores: ['red'] },             // Escala 2 (mediano)
    { texto: 'Creado por • JoanTK', fuente: 'tiny', alineación: 'center', colores: ['magenta'] } // Escala 1 (pequeño)
  ];

  banners.forEach((banner) =>
    cfonts.say(banner.texto, {
      font: banner.fuente,
      align: banner.alineación,
      colors: banner.colores,
    })
  );

  console.log('✦ Iniciando Admin TK...');
}

// Función para inicializar la base de datos y crear tablas
async function inicializarBaseDeDatos() {
  try {
    let db = await openDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS codigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE,
        usuario TEXT,
        creadoEn TEXT,
        expiraEn TEXT,
        expirado INTEGER
      );

      CREATE TABLE IF NOT EXISTS vinculaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigoVinculacion TEXT UNIQUE,
        usuario TEXT,
        creadoEn TEXT,
        expiraEn TEXT,
        utilizado INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sesiones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE,
        inicio TEXT,
        fin TEXT
      );
    `);
    console.log('Base de datos inicializada y tablas creadas.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
}

// Función para configurar tareas programadas
function configurarTareasProgramadas() {
  // Tarea programada para limpiar códigos expirados diariamente a medianoche
  cron.schedule('0 0 * * *', async () => {
    try {
      let db = await openDb();
      const ahora = new Date().toISOString();

      // Marcar códigos expirados
      await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn <= ?', [ahora]);

      // Marcar vinculaciones expiradas como utilizadas
      await db.run('UPDATE vinculaciones SET utilizado = 1 WHERE expiraEn <= ?', [ahora]);

      console.log('Tarea programada ejecutada: Limpieza de códigos expirados.');
    } catch (error) {
      console.error('Error en la tarea programada:', error);
    }
  });

  console.log('Tareas programadas configuradas.');
}

// Función para iniciar un archivo principal
function iniciar(file) {
  if (procesoEjecutandose) return; // Evitar múltiples instancias
  procesoEjecutandose = true;

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  cfonts.say(args.join(' '), { font: 'console', align: 'center', gradient: ['red', 'magenta'] });

  // Configurar proceso maestro y forkear el proceso hijo
  setupMaster({ exec: args[0], args: args.slice(1) });
  const procesoHijo = fork();

  // Escuchar mensajes del proceso hijo
  procesoHijo.on('message', (data) => {
    console.log('[✅RECIBIDO]', data);

    switch (data) {
      case 'reset': // Reiniciar el proceso
        procesoHijo.kill();
        procesoEjecutandose = false;
        iniciar(file);
        break;

      case 'uptime': // Enviar tiempo de actividad
        procesoHijo.send(process.uptime());
        break;

      default:
        console.log('Mensaje desconocido recibido:', data);
        break;
    }
  });

  // Manejo de salida del proceso hijo
  procesoHijo.on('exit', (code) => {
    procesoEjecutandose = false;
    console.error('[✦] El proceso finalizó con el código:', code);

    if (code !== 0) {
      iniciar(file); // Reinicia automáticamente si falla
    } else {
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        iniciar(file); // Reinicia si el archivo principal cambia
      });
    }
  });

  // Configurar entrada interactiva desde la línea de comandos
  const opciones = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  if (!rl.listenerCount('line')) {
    rl.on('line', (linea) => {
      procesoHijo.emit('message', linea.trim());
    });
  }
}

// Mostrar el banner y arrancar el proceso principal
mostrarBanner();

(async () => {
  await inicializarBaseDeDatos(); // Inicializamos la base de datos antes de iniciar el bot
  configurarTareasProgramadas(); // Configuramos las tareas programadas
  iniciar('main.js'); // Iniciamos el bot
})();
