import fs from 'fs';
import path, { dirname } from 'path';
import assert from 'assert';
import syntaxError from 'syntax-error';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Obtener el nombre y directorio del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(__dirname);

// Leer la configuración de directorios del archivo package.json
const packageJsonPath = path.join(__dirname, './package.json');
const directories = require(packageJsonPath).directories || {};

// Crear una lista de carpetas para revisar
const folders = ['.', ...Object.keys(directories)];

// Inicializar una lista para los archivos .js
let files = [];

// Recopilar todos los archivos .js de las carpetas especificadas
for (const folder of folders) {
  const folderPath = path.resolve(__dirname, folder);
  const jsFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of jsFiles) {
    files.push(path.resolve(folderPath, file));
  }
}

// Revisar cada archivo .js
for (const file of files) {
  if (file === __filename) continue; // Ignorar el archivo actual

  console.error('Checking', file);

  // Comprobar errores de sintaxis
  const code = fs.readFileSync(file, 'utf8');
  const error = syntaxError(code, file, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true
  });

  // Asegurarse de que no haya errores de sintaxis
  if (error) {
    assert.ok(error.length < 1, `${file}\n\n${error}`);
  }

  // Confirmar que el archivo está presente en la lista
  assert.ok(file);

  console.log('Done', file);
}

