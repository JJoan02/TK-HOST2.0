// plugins/__generarcodigosb.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) throw '*[❗] Solo el owner puede usar este comando.*';

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(m.chat, { text: 'Por favor, menciona al usuario para el que deseas generar el código. Ejemplo: `.generarcodigosb @usuario`' }, { quoted: m });
    }

    let usuario = m.mentionedJid[0];
    let codigo = generarCodigoUnico();

    let db = await openDb();

    try {
        await db.run(`INSERT INTO codigos (codigo, usuario, creadoEn, expiraEn, expirado) VALUES (?, ?, ?, ?, ?)`, 
                     [codigo, usuario, new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 0]);

        conn.sendMessage(m.chat, { text: `📜 *Código Generado*\n\nCódigo: *${codigo}*\nEste código expira en 30 días.` }, { quoted: m });
        
        // Enviar mensaje al usuario
        await conn.sendMessage(usuario, { text: `🔑 Has recibido un código para vincularte como Sub-Bot.\n\nCódigo: *${codigo}*\n\nUsa este código con el comando *.canjearcodigosb ${codigo}* para obtener tu código de vinculación.` });
    } catch (error) {
        console.error('Error al generar el código:', error);
        conn.sendMessage(m.chat, { text: 'Hubo un error al generar el código. Por favor, intenta nuevamente.' }, { quoted: m });
    }
};

// Función para generar un código único de formato xxxx-xxxx
function generarCodigoUnico() {
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Letras A-Z
    }
    codigo += '-';
    for (let i = 0; i < 4; i++) {
        codigo += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    return codigo;
}

handler.help = ['generarcodigosb @usuario'];
handler.tags = ['owner'];
handler.command = /^generarcodigosb$/i;

export default handler;
