const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Verificando entorno de proyecto...');

const nodeModulesPath = './node_modules';

try {
  // Si la carpeta node_modules no existe, realiza la limpieza e instalación
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  La carpeta "node_modules" no existe. Preparando entorno automáticamente...');

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
  } else {
    console.log('✅ La carpeta "node_modules" existe. Todo está listo.');
  }
} catch (error) {
  console.error('❌ Error detectado durante la verificación o instalación:', error.message);

  // Intentar reparar automáticamente
  console.log('🔄 Intentando reparar el entorno desde cero...');
  try {
    console.log('🗑️  Eliminando carpeta node_modules...');
    execSync('rm -rf node_modules', { stdio: 'inherit' });

    console.log('🗑️  Eliminando archivo package-lock.json (si existe)...');
    if (fs.existsSync('./package-lock.json')) {
      fs.unlinkSync('./package-lock.json');
    }

    console.log('🧹 Limpiando caché de npm...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    console.log('📦 Reinstalando dependencias desde cero...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('✅ Reparación completada y dependencias instaladas correctamente.');
  } catch (repairError) {
    console.error('❌ Error crítico durante la reparación:', repairError.message);
    console.log('💡 Sugerencia: Verifica tu conexión a Internet o intenta reinstalar manualmente.');
    process.exit(1);
  }
}
