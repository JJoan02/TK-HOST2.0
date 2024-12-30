const fs = require('fs');
const { execSync } = require('child_process');

const nodeModulesPath = './node_modules';

if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  La carpeta "node_modules" no existe. Reinstalando dependencias...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas correctamente.');
  } catch (error) {
    console.error('❌ Error al instalar dependencias:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ La carpeta "node_modules" existe. Continuando con la ejecución...');
}
