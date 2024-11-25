let handler = async (m, { conn, args }) => {
    let codigoIngresado = args[0];
    if (!codigoIngresado) throw '❌ Debes ingresar el código proporcionado. Ejemplo: `.canjearcodigosb xxx-xxx`';

    let db = await openDb();

    // Limpiar códigos expirados antes de proceder
    await limpiarCodigosExpirados(db);

    let codigoObj = await db.get('SELECT * FROM codigos WHERE codigo = ? AND usuario = ? AND expirado = 0', [codigoIngresado, m.sender]);

    if (!codigoObj) throw '❌ El código es inválido o no está asociado a tu número.';
    if (new Date() > new Date(codigoObj.expiraEn)) {
        // Marcar el código como expirado
        await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
        throw '❌ El código ha expirado. Por favor, solicita uno nuevo al owner.';
    }

    // Generar código de vinculación
    let codigoVinculacion = generarCodigoVinculacion();
    let expiracion = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Insertar el código de vinculación en la base de datos
    await db.run(
        'INSERT INTO vinculaciones (codigoVinculacion, usuario, creadoEn, expiraEn) VALUES (?, ?, ?, ?)',
        [codigoVinculacion, m.sender, new Date().toISOString(), expiracion.toISOString()]
    );

    // Enviar el código de vinculación al usuario
    await conn.sendMessage(m.chat, {
        text: `*🍁 Código de Vinculación 🍁*\n\n🔑 Tu código de vinculación es: *${codigoVinculacion}*\n\n*Instrucciones:*\n1️⃣ Abre WhatsApp en tu teléfono.\n2️⃣ Ve a Configuración > Dispositivos vinculados.\n3️⃣ Toca en "Vincular un dispositivo" y selecciona "Vincular con código".\n4️⃣ Ingresa el código proporcionado.\n\n⏳ *Nota:* El código expira en 5 minutos.`,
    });

    // Marcar el código original como canjeado
    await db.run('UPDATE codigos SET expirado = 1 WHERE codigo = ?', [codigoIngresado]);
};
