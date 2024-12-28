//     ████████╗██╗  ██╗     ██╗  ██╗ ██████╗ ███████╗████████╗
//     ╚══██╔══╝██║ ██╔╝     ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝
//        ██║   █████╔╝█████╗███████║██║   ██║███████╗   ██║   
//        ██║   ██╔═██╗╚════╝██╔══██║██║   ██║╚════██║   ██║   
//        ██║   ██║  ██╗     ██║  ██║╚██████╔╝███████║   ██║   
//        ╚═╝   ╚═╝  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   

//       ____ ____  _____    _    ____   ___    ____   ___  ____  
//      / ___|  _ \| ____|  / \  |  _ \ / _ \  |  _ \ / _ \|  _ \ 
//     | |   | |_) |  _|   / _ \ | | | | | | | | |_) | | | | |_) |
//     | |___|  _ <| |___ / ___ \| |_| | |_| | |  __/| |_| |  _ < 
//      \____|_| \_\_____/_/   \_\____/ \___/  |_|    \___/|_| \_\


//          ██╗ ██████╗  █████╗ ███╗   ██╗    ████████╗██╗  ██╗
//          ██║██╔═══██╗██╔══██╗████╗  ██║    ╚══██╔══╝██║ ██╔╝
//          ██║██║   ██║███████║██╔██╗ ██║       ██║   █████╔╝ 
//     ██   ██║██║   ██║██╔══██║██║╚██╗██║       ██║   ██╔═██╗ 
//     ╚█████╔╝╚██████╔╝██║  ██║██║ ╚████║       ██║   ██║  ██╗
//      ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝       ╚═╝   ╚═╝  ╚═╝
                                                        
/*
        📝 𝗣𝗿𝗼𝗷𝗲𝗰𝘁 𝗡𝗮𝗺𝗲: TK-HOST
        🐙 𝗚𝗶𝘁𝗵𝘂𝗯 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝘆: [JJoan02/TK-HOST](https://github.com/JJoan02/TK-HOST)
        👤 𝗢𝘄𝗻𝗲𝗿/𝗖𝗿𝗲𝗮𝘁𝗼𝗿: @JJoan02
        📌 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:
        TK-HOST es un bot avanzado y multifuncional para WhatsApp que ofrece una amplia gama de complementos, 
        incluyendo automatización de tareas, juegos interactivos, y herramientas útiles. 
        Con un diseño centrado en la eficiencia y el entretenimiento, TK-HOST transforma la forma en que interactúas 
        en WhatsApp, brindándote una experiencia intuitiva y poderosa.

        
        📅 𝗖𝗿𝗲𝗮𝘁𝗶𝗼𝗻: 15/11/2024 at 08:25:10
        📜 𝗟𝗶𝗰𝗲𝗻𝗰𝗲: GPL-3.0 License
        ⚠️ 𝗥𝗶𝗴𝗵𝘁𝘀 𝗡𝗼𝘁𝗶𝗰𝗲:
        2024 All external and internal rights are reserved to @JJoan02.
*/                                                            

//         ██╗     ██╗ ██████╗  █████╗ ███╗   ██╗ ██████╗ ██████╗ 
//         ██║     ██║██╔═══██╗██╔══██╗████╗  ██║██╔═████╗╚════██╗
//         ██║     ██║██║   ██║███████║██╔██╗ ██║██║██╔██║ █████╔╝
//    ██   ██║██   ██║██║   ██║██╔══██║██║╚██╗██║████╔╝██║██╔═══╝ 
//    ╚█████╔╝╚█████╔╝╚██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████╗
//     ╚════╝  ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝


import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import cfonts from 'cfonts';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import { openDb } from './data/codigos.js';
import cron from 'node-cron';

// Paths and Module Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const { name, author } = require(join(__dirname, './package.json'));

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

let isProcessRunning = false;

// Display Application Banner
function displayBanner() {
  const banners = [
    { text: 'TK-HOST', font: 'block', align: 'center', colors: ['cyan'] },
    { text: 'TK-HOST', font: 'console', align: 'center', colors: ['red'] },
    { text: 'Created by • JoanTK', font: 'tiny', align: 'center', colors: ['magenta'] }
  ];

  banners.forEach(banner => {
    cfonts.say(banner.text, {
      font: banner.font,
      align: banner.align,
      colors: banner.colors
    });
  });

  console.log('✦ Starting TK-HOST...');
}

// Initialize Database
async function initializeDatabase() {
  try {
    const db = await openDb();
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
    console.log('Database initialized and tables created.');
  } catch (error) {
    console.error('Error initializing the database:', error);
  }
}

// Configure Scheduled Tasks
function configureScheduledTasks() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const db = await openDb();
      const currentDateTime = new Date().toISOString();

      await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn <= ?', [currentDateTime]);
      await db.run('UPDATE vinculaciones SET utilizado = 1 WHERE expiraEn <= ?', [currentDateTime]);

      console.log('Scheduled task executed: Expired codes cleaned.');
    } catch (error) {
      console.error('Error executing scheduled task:', error);
    }
  });

  console.log('Scheduled tasks configured.');
}

// Start Application
function startApp(entryFile) {
  if (isProcessRunning) return;
  isProcessRunning = true;

  const args = [join(__dirname, entryFile), ...process.argv.slice(2)];
  console.log('Starting main file:', entryFile);

  setupMaster({
    exec: args[0],
    args: args.slice(1)
  });

  const worker = fork();

  worker.on('message', message => {
    console.log('[✅ RECEIVED]', message);
    switch (message) {
      case 'reset':
        worker.kill();
        isProcessRunning = false;
        startApp(entryFile);
        break;
      case 'uptime':
        worker.send(process.uptime());
        break;
      default:
        console.log('Unknown message received:', message);
    }
  });

  worker.on('exit', code => {
    isProcessRunning = false;
    console.error('[✦] Process exited with code:', code);

    if (code !== 0) {
      startApp(entryFile);
    } else {
      watchFile(args[0], () => {
        unwatchFile(args[0]);
        startApp(entryFile);
      });
    }
  });

  if (!rl.listenerCount('line')) {
    rl.on('line', input => {
      worker.emit('message', input.trim());
    });
  }
}

// Main Execution
(async () => {
  displayBanner();
  await initializeDatabase();
  configureScheduledTasks();
  startApp('main.js');
  console.log('Escribe el número de WhatsApp a vincular:');
})();
