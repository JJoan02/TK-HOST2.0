// Este script verifica la sintaxis de todos los archivos JavaScript en el directorio actual y en los subdirectorios especificados.
// Asegúrate de tener las dependencias necesarias instaladas antes de ejecutar este script.

import fs from 'fs';
import path, { dirname } from 'path';
import assert from 'assert';
import { spawn } from 'child_process';
import syntaxError from 'syntax-error';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Obtiene el nombre y el directorio del archivo actual.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(__dirname);

// Define los directorios a verificar, incluyendo el directorio actual.
let folders = ['.'];
try {
  const packageJson = require(path.join(__dirname, './package.json'));
  if (packageJson.directories) {
    folders.push(...Object.keys(packageJson.directories));
  }
} catch (error) {
  console.warn("⚠️ No se pudo leer el package.json o no tiene directorios definidos. Continuando con el directorio actual.");
}

// Array para almacenar los archivos JavaScript encontrados.
let files = [];

// Busca archivos JavaScript en los directorios especificados.
for (let folder of folders) {
  try {
    for (let file of fs.readdirSync(folder).filter(v => v.endsWith('.js'))) {
      files.push(path.resolve(path.join(folder, file)));
    }
  } catch (error) {
    console.warn(`⚠️ No se pudo leer el directorio ${folder}. Continuando con los demás.`);
  }
}

// Verifica la sintaxis de cada archivo JavaScript encontrado.
for (let file of files) {
  if (file === __filename) continue;  // Omite el archivo actual.
  console.error('🔍 Verificando', file);
  
  const sourceCode = fs.readFileSync(file, 'utf8');
  const error = syntaxError(sourceCode, file, {
    sourceType: 'module',
    allowReturnOutsideFunction: true,
    allowAwaitOutsideFunction: true
  });

  if (error) {
    console.error('❌ Error de sintaxis en', file, '\n', error);
    assert.ok(error.length < 1, `${file}\n\n${error}`);
  }

  assert.ok(file);
  console.log('✅ Listo', file);
}
