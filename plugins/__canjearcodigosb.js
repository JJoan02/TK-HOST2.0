// plugins/__canjearcodigosb.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args }) => {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw '❌ Debes ingresar el código proporcionado. Ejemplo: .canjearcodigosb xxxx-xxxx';

    let db = await openDb();

    // Limpiar códigos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    let codigoObj = await db.get('SELECT * FROM codigos WHERE codigo = ? AND usuario = ? AND expirado = 0', [codigoIngresado, m.sender]);

    if (!codigoObj) throw '❌ Código inválido o no está asociado a tu número.';
    if (new Date() > new Date(codigoObj.expiraEn)) {
        // Marcar el código como expirado
        await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
        throw '❌ El código ha expirado.';
    }

    // Generar código de vinculación de 8 dígitos
    let codigoVinculacion = generarCodigoVinculacion();
    let expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Insertar el código de vinculación en la base de datos
    await db.run('INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)', [
        codigoVinculacion,
        m.sender,
        new Date().toISOString(),
        expiracion.toISOString()
    ]);

    // Enviar el código de vinculación al usuario
    await conn.sendMessage(m.chat, {
        text: `*🍁 Código de Vinculación 🍁*\n\nTu código de vinculación es: *${codigoVinculacion}*\n\nIngresa este código en tu WhatsApp siguiendo las instrucciones.\n\n*Nota:* El código expira en 5 minutos.`
    });

    // Marcar el código como canjeado
    await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
};

function generarCodigoVinculacion() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function limpiarCodigosExpirados(db) {
    const ahora = new Date().toISOString();

    // Marcar códigos expirados
    await db.run('UPDATE codigos SET expirado = 1 WHERE expiraEn <= ?', [ahora]);

    // Eliminar vinculaciones expiradas
    await db.run('DELETE FROM vinculaciones WHERE expiraEn <= ?', [ahora]);
}

handler.command = /^canjearcodigosb$/i;
export default handler;

