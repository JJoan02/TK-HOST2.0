// plugins/__listjadibots.js
import { openDb } from '../data/codigos.js';

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) throw '*[❗] Solo el owner puede usar este comando.*';

    let db = await openDb();
    let sesiones = await db.all(`SELECT * FROM sesiones WHERE fin IS NULL`);

    if (sesiones.length === 0) {
        return conn.sendMessage(m.chat, { text: 'No hay sub-bots activos actualmente.' }, { quoted: m });
    }

    let mensaje = '*🔹 Sub-Bots Activos 🔹*\n\n';
    sesiones.forEach((sesion, index) => {
        mensaje += `${index + 1}. *@${sesion.usuario.split('@')[0]}*\n   Inicio: ${new Date(sesion.inicio).toLocaleString()}\n\n`;
    });

    conn.sendMessage(m.chat, { text: mensaje, mentions: sesiones.map(s => s.usuario) }, { quoted: m });
};

handler.help = ['listjadibots'];
handler.tags = ['owner'];
handler.command = /^listjadibots$/i;

export default handler;
