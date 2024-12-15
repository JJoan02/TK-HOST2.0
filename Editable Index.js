const path = require('path');
const { execFileSync } = require('child_process');

// Define la ruta al archivo /system/index.js
const systemIndexPath = path.join(__dirname, 'system', 'index.js');

try {
    // Ejecuta el archivo system/index.js
    console.log(`Iniciando: ${systemIndexPath}`);
    require(systemIndexPath);
} catch (error) {
    console.error(`Error al intentar iniciar ${systemIndexPath}:`, error.message);
    process.exit(1);
}
