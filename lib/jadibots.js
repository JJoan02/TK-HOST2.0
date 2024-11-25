export async function generarCodigoVinculacion(usuario) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigoVinculacion = '';

    for (let i = 0; i < 3; i++) {
        codigoVinculacion += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    codigoVinculacion += '-';
    for (let i = 0; i < 3; i++) {
        codigoVinculacion += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    let db = await openDb();

    // Guardar el cĆ³digo de vinculaciĆ³n en la base de datos
    await db.run(
        `INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)`,
        [codigoVinculacion, usuario, new Date().toISOString(), new Date(Date.now() + 5 * 60 * 1000).toISOString()]
    );

    return codigoVinculacion;
}

// Add functions for QR and 8-digit code linking
const qrcode = require('qrcode');

async function generateLink(conn, chat, type) {
    if (type === 'qr') {
        const qrCode = await conn.requestPairingCode();
        const qrImage = await qrcode.toBuffer(qrCode, { scale: 8 });
        await conn.sendMessage(chat, { image: qrImage, caption: 'Scan this QR code to link as a SubBot!' });
    } else if (type === 'code') {
        const pairingCode = await conn.requestPairingCode();
        await conn.sendMessage(chat, { text: `Your 8-digit pairing code is: ${pairingCode}` });
    }
}

module.exports = { generateLink };
