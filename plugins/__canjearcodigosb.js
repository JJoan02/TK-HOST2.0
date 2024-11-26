let handler = async (m, { conn, args }) => {
  try {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw '❌ *Debes ingresar el código proporcionado.*\n\n💡 _Ejemplo:_ `.canjearcodigosb xxx-xxx`';

    // Verificar si el usuario ya está verificado
    let verificacion = fs.readFileSync('./data/codigos.json');
    if (verificacion) {
      verificacion = JSON.parse(verificacion);
      if (verificacion[m.sender]) {
        throw '❌ *Ya estás verificado.*';
      }
    } else {
      verificacion = {};
    }

    // Proceder con la verificación
    let db = await openDb(); 

    if (!db) {
      throw '❌ *Error al abrir la base de datos.*';
    }

    // Crear la tabla `codigos` si no existe
    await db.run(`CREATE TABLE IF NOT EXISTS codigos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        usuario TEXT NOT NULL,
        creadoEn TEXT NOT NULL,
        expiraEn TEXT NOT NULL,
        expirado INTEGER DEFAULT 0,
        canjeado INTEGER DEFAULT 0
    )`);

    // Limpiar códigos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    // Reemplaza esto
    // let codigoObj = await db.get('SELECT * FROM codigos WHERE codigo = ? AND usuario = ? AND expirado = 0', [codigoIngresado, m.sender]);
    // Con esto
    let codigoObj = await db.get(`SELECT * FROM codigos WHERE codigo = '${codigoIngresado}' AND usuario = '${m.sender}' AND expirado = 0`);

    if (!codigoObj) throw '❌ *El código ingresado no es válido o no está asociado a tu número.*';
    // Resto del código...