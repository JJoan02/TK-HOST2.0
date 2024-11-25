let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '*[❗] Este comando solo puede ser usado por el owner.*';

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(
            m.chat,
            {
                text: '🔔 *Por favor menciona al usuario para el que deseas generar el código de vinculación.*\nEjemplo: `.generarcodigosb @usuario`',
            },
            { quoted: m }
        );
    }

    let usuario = m.mentionedJid[0];
    let codigo = generarCodigoUnico();

    let db = await openDb();

    try {
        await db.run(
            `INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, ?)`,
            [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0]
        );

        conn.sendMessage(m.chat, { text: `📜 *Código Generado*\n\n🔑 Código: *${codigo}*\nEste código expira en 30 días.` }, { quoted: m });

        // Notificar al usuario
        await conn.sendMessage(usuario, {
            text: `🔑 *Has recibido un código para vincularte como Sub-Bot.*\n\n📝 Código: *${codigo}*\n\nUsa este código con el comando *.canjearcodigosb ${codigo}* para obtener tu código de vinculación.`,
        });
    } catch (error) {
        console.error('Error al generar el código:', error);
        conn.sendMessage(m.chat, { text: '❌ Hubo un error al generar el código. Por favor, intenta nuevamente.' }, { quoted: m });
    }
};

// Generar un código único en formato alfanumérico (xxx-xxx)
function generarCodigoUnico() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';

    for (let i = 0; i < 3; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    codigo += '-';
    for (let i = 0; i < 3; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return codigo;
}
