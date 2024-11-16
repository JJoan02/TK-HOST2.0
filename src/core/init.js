import pkg from 'cfonts';
import { join } from 'path';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import { createInterface } from 'readline';
import yargs from 'yargs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { say } = pkg;
const rl = createInterface(process.stdin, process.stdout);

export function displayHeader() {
  say('Admin-TK', {
    font: 'block',
    align: 'center',
    colors: ['cyan'],
  });
  say('TK-HOST', {
    font: 'chrome',
    align: 'center',
    colors: ['red'],
  });
  say('Creado por • JoanTK', {
    font: 'console',
    align: 'center',
    colors: ['magenta'],
  });
}

let isRunning = false;

export function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  say([process.argv[0], ...args].join(' '), {
    font: 'console',
    align: 'center',
    colors: ['green'],
  });

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  });

  const p = fork();

  p.on('message', (data) => {
    switch (data) {
      case 'reset':
        p.process.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  p.on('exit', (_, code) => {
    isRunning = false;
    console.error('🚩 Error:\n', code);
    process.exit();
    if (code === 0) return;
    watchFile(args[0], () => {
      unwatchFile(args[0]);
      start(file);
    });
  });

  const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());

  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', (line) => {
        p.emit('message', line.trim());
      });
    }
  }
}

process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('🚩 Se excedió el límite de Listeners en:');
    console.warn(warning.stack);
  }
});