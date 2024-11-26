/**
 * Abre una conexión a la base de datos SQLite.
 * 
 * @returns {Promise<sqlite3.Database>} La conexión a la base de datos.
 */
export async function openDb() {
  // Crear el directorio `data` si no existe
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
  }

  let db;
  try {
    // Verificar si la base de datos ya existe
    if (!fs.existsSync('./data/bot.db')) {
      // Crear la base de datos si no existe
      db = await open({
        filename: './data/bot.db',
        driver: sqlite3.Database,
        mode: 'create', // Crear la base de datos si no existe
      });
    } else {
      // Abrir la conexión a la base de datos
      db = await open({
        filename: './data/bot.db',
        driver: sqlite3.Database,
      });
    }
    return db;
  } catch (error) {
    // Reportar el error al usuario
    throw new Error(`Error al abrir la base de datos: ${error.message}`);
  }
}