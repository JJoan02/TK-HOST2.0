let handler = async (m, { conn, args }) => {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw 'âŒ Debes ingresar el cÃ³digo proporcionado. Ejemplo: `.canjearcodigosb xxx-xxx`';

    let db = await openDb();

    // Limpiar cÃ³digos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    let codigoObj = await db.get('SELECT * FROM codigos WHERE codigo = ? AND usuario = ? AND expirado = 0', [codigoIngresado, m.sender]);

    if (!codigoObj) throw 'âŒ El cÃ³digo es invÃ¡lido o no estÃ¡ asociado a tu nÃºmero.';
    if (new Date() > new Date(codigoObj.expiraEn)) {
        // Marcar el cÃ³digo como expirado
        await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
        throw 'âŒ El cÃ³digo ha expirado. Por favor, solicita uno nuevo al owner.';
    }

    // Generar cÃ³digo de vinculaciÃ³n
    let codigoVinculacion = generarCodigoVinculacion();
    let expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Insertar el cÃ³digo de vinculaciÃ³n en la base de datos
    await db.run(
        'INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)',
        [codigoVinculacion, m.sender, new Date().toISOString(), expiracion.toISOString()]
    );

    // Enviar el cÃ³digo de vinculaciÃ³n al usuario
    await conn.sendMessage(m.chat, {
        text: `*ðŸ CÃ³digo de VinculaciÃ³n ðŸ*\n\nðŸ”‘ Tu cÃ³digo de vinculaciÃ³n es: *${codigoVinculacion}*\n\n*Instrucciones:*\n1ï¸âƒ£ Abre WhatsApp en tu telÃ©fono.\n2ï¸âƒ£ Ve a ConfiguraciÃ³n > Dispositivos vinculados.\n3ï¸âƒ£ Toca en "Vincular un dispositivo" y selecciona "Vincular con cÃ³digo".\n4ï¸âƒ£ Ingresa el cÃ³digo proporcionado.\n\nâ³ *Nota:* El cÃ³digo expira en 5 minutos.`,
    });

    // Marcar el cÃ³digo original como canjeado
    await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
};

// Handle code redemption
// After successful redemption, provide the linking options
async function handleRedemption(conn, chat) {
    await conn.sendMessage(chat, {
        text: `You have redeemed your SubBot code successfully! Please respond with:
- .vincularqr to link using a QR code
- .vincularcode to link using an 8-digit code`
    });
}
