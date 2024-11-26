// plugins/__listjadibots.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) throw '*[❗] Lo siento, este comando es exclusivo para el owner.* 🙇‍♂️';

    let db = await openDb();
    let sesiones = await db.all(`SELECT * FROM sesiones WHERE fin IS NULL`);

    if (sesiones.length === 0) {
        return conn.sendMessage(m.chat, { 
            text: '✨ *¡Todo en orden!* ✨\n\nActualmente no hay sub-bots activos. 🚀', 
        }, { quoted: m });
    }

    let mensaje = '🌟 *Lista de Sub-Bots Activos* 🌟\n\n';
    sesiones.forEach((sesion, index) => {
        mensaje += `🔹 *${index + 1}. @${sesion.usuario.split('@')[0]}*\n   📅 *Inicio:* ${new Date(sesion.inicio).toLocaleString()}\n\n`;
    });

    mensaje += '🔔 *Recuerda cuidar tus sub-bots y mantenerlos activos si los necesitas.* 😊';

    conn.sendMessage(m.chat, { 
        text: mensaje, 
        mentions: sesiones.map(s => s.usuario) 
    }, { quoted: m });
};

handler.help = ['listjadibots'];
handler.tags = ['owner'];
handler.command = /^listjadibots$/i;

export default handler;
