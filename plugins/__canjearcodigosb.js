import { openDb } from '../data/codigos.js';
import fs from 'fs';

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

    console.log(`Código ingresado: ${codigoIngresado}`);

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

    let codigoObj = await db.get(`SELECT * FROM codigos WHERE codigo = '${codigoIngresado}' AND usuario = '${m.sender}' AND expirado = 0`);

    console.log(`Verificación: ${!!verificacion[m.sender]}`);
    console.log(`Código Obj: ${JSON.stringify(codigoObj)}`);

    if (!codigoObj) throw '❌ *El código ingresado no es válido o no está asociado a tu número.*';
    if (codigoObj.canjeado) throw '❌ *El código ya ha sido canjeado.*';
    if (new Date() > new Date(codigoObj.expiraEn)) {
      // Marcar el código como expirado
      await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
      throw '⏳ *El código ha expirado.* Por favor, solicita uno nuevo al administrador.';
    }

    // Crear la tabla `vinculaciones` si no existe
    await db.run(`CREATE TABLE IF NOT EXISTS vinculaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigoVinculacion TEXT NOT NULL,
        usuario TEXT NOT NULL,
        creadoEn TEXT NOT NULL,
        expiraEn TEXT NOT NULL,
        expirado INTEGER DEFAULT 0
    )`);

    // Generar código de vinculación
    let codigoVinculacion = generarCodigoUnico();
    let expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Verificar si el usuario ya tiene un código de vinculación activo
    let vinculacionObj = await db.get('SELECT * FROM vinculaciones WHERE usuario = ? AND expirado = 0', [m.sender]);
    if (vinculacionObj) throw '⚠️ *Ya tienes un código de vinculación activo.*';

    // Insertar el código de vinculación en la base de datos
    await db.run(
      'INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)',
      [codigoVinculacion, m.sender, new Date().toISOString(), expiracion.toISOString()]
    );

    // Enviar el código de vinculación al usuario
    await conn.sendMessage(m.chat, {
      text: `*🔑 CÓDIGO DE VINCULACIÓN 🔑*\n\n🔒 *Tu código de vinculación es:* *${codigoVinculacion}*\n\n*📋 Instrucciones:*\n\n1️⃣ _Abre WhatsApp en tu teléfono._\n2️⃣ _Ve a Configuración > Dispositivos vinculados._\n3️⃣ _Toca en "Vincular un dispositivo" y selecciona "Vincular con código"._\n4️⃣ _Ingresa el código proporcionado._\n\n⏱️ *Nota:* El código expira en 5 minutos.`,
    });

    // Marcar el código original como canjeado
    await db.run('UPDATE codigos SET canjeado = 1 WHERE codigo = ?', [codigoIngresado]);

    // Confirmación de canje exitoso
    await conn.sendMessage(m.chat, {
      text: `✅ *¡Código de SubBot canjeado con éxito!* 🎉\n\nPuedes continuar usando las funcionalidades del SubBot.`,
    });

    // Grabar la verificación en el archivo /data/codigos.json
    verificacion[m.sender] = {
      codigo: codigoIngresado,
      expiracion: expiracion.toISOString(),
    };
    fs.writeFileSync('./data/codigos.json', JSON.stringify(verificacion, null, 2));
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `❌ *Ha ocurrido un error:* ${error}`,
    });
  }
};

async function limpiarCodigosExpirados(db) {
    await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn < ?', [new Date().toISOString()]);
}

export default handler;