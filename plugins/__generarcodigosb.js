// plugins/__generarcodigosb.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '❌ Solo el owner puede usar este comando.';
    
    let user = m.mentionedJid && m.mentionedJid[0];
    if (!user) throw '❌ Debes mencionar a un usuario. Ejemplo: .generarcodigosb @usuario';

    let codigo = generarCodigoInicial();
    let db = await openDb();

    // Verificar si el usuario ya tiene un código activo
    let existingCode = await db.get('SELECT * FROM codigos WHERE usuario = ? AND expirado = 0', [user]);
    if (existingCode) {
        throw '⚠️ Este usuario ya tiene un código activo. Debe canjearlo antes de generar uno nuevo.';
    }

    let expiracion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 mes

    // Insertar el nuevo código en la base de datos
    await db.run('INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, 0)', [
        codigo,
        user,
        new Date().toISOString(),
        expiracion.toISOString()
    ]);

    // Enviar el código al usuario
    await conn.sendMessage(user, {
        text: `*🍁 Código de Sub-Bot 🍁*\n\nTu código es: *${codigo}*\n\nPuedes canjearlo usando el comando:\n*.canjearcodigosb ${codigo}*\n\n*Nota:* El código expira en 1 mes.`
    });

    // Confirmar al owner
    m.reply('✅ Código generado y enviado al usuario.');
};

function generarCodigoInicial() {
    return `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

handler.command = /^generarcodigosb$/i;
export default handler;
