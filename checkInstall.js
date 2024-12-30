const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Verificando entorno de proyecto...');

const nodeModulesPath = './node_modules';

// Si la carpeta node_modules no existe, realiza la limpieza e instalación
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  La carpeta "node_modules" no existe. Preparando entorno automáticamente...');

  try {
    console.log('🧹 Limpiando caché de npm...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    console.log('🗑️  Eliminando archivo package-lock.json (si existe)...');
    if (fs.existsSync('./package-lock.json')) {
      fs.unlinkSync('./package-lock.json');
      console.log('✅ Archivo package-lock.json eliminado.');
    }

    console.log('📦 Instalando dependencias...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('✅ Dependencias instaladas correctamente.');
  } catch (error) {
    console.error('❌ Error durante la instalación automática:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ La carpeta "node_modules" existe. Todo está listo.');
}
