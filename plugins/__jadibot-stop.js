// plugins/__jadibot-stop.js
import { conns } from "../lib/jadibots.js";
import { isOwner } from '../lib/permissions.js';

let handler = async (m, { conn }) => {
    const userId = m.sender.split('@')[0];

    if (!conns.has(userId)) throw 'No tienes un bot activo.';
    if (!isOwner(m.sender) && m.sender !== conns.get(userId).user.jid) throw 'No tienes permiso para detener este bot.';

    await conns.get(userId).end();
    conns.delete(userId);

    await conn.sendMessage(m.chat, { text: 'Sub-Bot detenido exitosamente.' }, { quoted: m });
};

handler.help = ['stopjadibot'];
handler.tags = ['jadibot'];
handler.command = /^stopjadibot$/i;

export default handler;
