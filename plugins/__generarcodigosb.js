// plugins/__generarcodigosb.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '*[❌] Este comando solo puede ser usado por el owner.*';

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(
            m.chat,
            {
                text: '🔔 *Por favor menciona al usuario para el que deseas generar el código de vinculación.*\n\n💡 _Ejemplo:_ `.generarcodigosb @usuario`',
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

        // Insertar el nuevo código en la base de datos
        await db.run(
            `INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado, canjeado) VALUES (?, ?, ?, ?, ?, ?)`,
            [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0, 0]
        );

        // Notificar al owner
        conn.sendMessage(m.chat, { 
            text: `📬 *Código Generado*\n\n🔑 *Código:* ${codigo}\n🕒 *Este código expira en 30 días.*` 
        }, { quoted: m });

        // Enviar notificación al usuario
        await conn.sendMessage(usuario, {
            text: `🔑 *Has recibido un código para vincularte como Sub-Bot.*\n\n📜 *Código:* ${codigo}\n\n✅ _Usa este código con el comando_ *.canjearcodigosb ${codigo}* _para obtener tu código de vinculación._`,
        });
    } catch (error) {
        console.error('❌ Error al generar el código:', error);
        conn.sendMessage(m.chat, { 
            text: '❌ *Hubo un error al generar el código. Por favor, intenta nuevamente.*' 
        }, { quoted: m });
    } finally {
        // Cerrar la base de datos si fue abierta
        if (db) {
            await db.close();
        }
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

handler.help = ['generarcodigosb @usuario'];
handler.tags = ['owner'];
handler.command = /^generarcodigosb$/i;

export default handler;
