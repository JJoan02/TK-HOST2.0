import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '*[â—] Este comando solo puede ser usado por el owner.*';

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(
            m.chat,
            {
                text: 'ðŸ”” *Por favor menciona al usuario para el que deseas generar el cÃ³digo de vinculaciÃ³n.*\nEjemplo: `.generarcodigosb @usuario`',
            },
            { quoted: m }
        );
    }

    let usuario = m.mentionedJid[0];
    let codigo = generarCodigoUnico();

    let db;
    try {
        // Abrir la base de datos
        db = await openDb();

        // Insertar el nuevo cÃ³digo en la base de datos
        await db.run(
            `INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, ?)`,
            [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0]
        );

        // Notificar al owner
        conn.sendMessage(m.chat, { text: `ðŸ“œ *CÃ³digo Generado*\n\nðŸ”‘ CÃ³digo: *${codigo}*\nEste cÃ³digo expira en 30 dÃ­as.` }, { quoted: m });

        // Enviar notificaciÃ³n al usuario
        await conn.sendMessage(usuario, {
            text: `ðŸ”‘ *Has recibido un cÃ³digo para vincularte como Sub-Bot.*\n\nðŸ“ CÃ³digo: *${codigo}*\n\nUsa este cÃ³digo con el comando *.canjearcodigosb ${codigo}* para obtener tu cÃ³digo de vinculaciÃ³n.`,
        });
    } catch (error) {
        console.error('âŒ Error al generar el cÃ³digo:', error);
        conn.sendMessage(m.chat, { text: 'âŒ Hubo un error al generar el cÃ³digo. Por favor, intenta nuevamente.' }, { quoted: m });
    } finally {
        // Cerrar la base de datos si fue abierta
        if (db) {
            await db.close();
        }
    }
};

// Generar un cÃ³digo Ãºnico en formato alfanumÃ©rico (xxx-xxx)
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

handler.help = ['generarcodigosb @usuario'];
handler.tags = ['owner'];
handler.command = /^generarcodigosb$/i;

export default handler;

// Generate unique SubBot codes
// Additional logic for code management can be added here
