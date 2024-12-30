const fs = require('fs');
const { execSync } = require('child_process');

// Ruta a la carpeta node_modules
const nodeModulesPath = './node_modules';

console.log('🔍 Verificando entorno de proyecto...');

// Si no existe la carpeta node_modules, iniciar el proceso de reinstalación
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  La carpeta "node_modules" no existe. Iniciando limpieza y reinstalación...');

  try {
    // Limpieza opcional
    console.log('🧹 Eliminando caché de npm...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    console.log('🗑️  Eliminando archivo package-lock.json (si existe)...');
    if (fs.existsSync('./package-lock.json')) {
      fs.unlinkSync('./package-lock.json');
      console.log('✅ Archivo package-lock.json eliminado.');
    }

    // Instalación de dependencias
    console.log('📦 Reinstalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('✅ Dependencias instaladas correctamente.');
  } catch (error) {
    console.error('❌ Error durante la limpieza o instalación de dependencias:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ La carpeta "node_modules" existe. Continuando con la ejecución...');
}
