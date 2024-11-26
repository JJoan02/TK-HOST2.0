// plugins/__canjearcodigosb.js
import { openDb } from '../data/codigos.js';
import { generarCodigoVinculacion } from '../lib/jadibots.js';

let handler = async (m, { conn, args }) => {
  try {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw '❌ *Debes ingresar el código proporcionado.*\n\n💡 _Ejemplo:_ `.canjearcodigosb xxx-xxx`';

    let db = await openDb(); // Aquí se llama a la función openDb()

    // Limpiar códigos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    let codigoObj = await db.get('SELECT * FROM codigos WHERE codigo = ? AND usuario = ? AND expirado = 0', [codigoIngresado, m.sender]);

    if (!codigoObj) throw '❌ *El código ingresado no es válido o no está asociado a tu número.*';
    if (codigoObj.canjeado) throw '❌ *El código ya ha sido canjeado.*';
    if (new Date() > new Date(codigoObj.expiraEn)) {
      // Marcar el código como expirado
      await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
      throw '⏳ *El código ha expirado.* Por favor, solicita uno nuevo al administrador.';
    }

    // Generar código de vinculación
    let codigoVinculacion = generarCodigoVinculacion();
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

    // Llamar a la función handleRedemption
    await handleRedemption(conn, m.chat);
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: `❌ *Ha ocurrido un error:* ${error}`,
    });
  }
};

async function limpiarCodigosExpirados(db) {
    await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn < ?', [new Date().toISOString()]);
}

// Handle code redemption
// After successful redemption, provide the linking options
async function handleRedemption(conn, chat) {
  await conn.sendMessage(chat, {
    text: `✅ *¡Código de SubBot canjeado con éxito!* 🎉\n\n💬 *Por favor, elige una opción para continuar:*\n\n- _Escribe_ *.vincularqr* _para vincular con un código QR._\n- _Escribe_ *.vincularcode* _para vincular con un código de 8 dígitos._`,
  });
}

export default handler;
