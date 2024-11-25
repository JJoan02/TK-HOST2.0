// plugins/__jadibot-list.js
import { conns } from "../lib/jadibots.js";

let handler = async (m, { conn }) => {
    const users = [...conns.values()].map(v => v.user);
    if (!users.length) return m.reply('✦ No hay subbots por ahora.');

    let text = '*Lista de Sub-Bots Activos:*\n\n';
    text += users.map((user, i) => `${i + 1}. @${user.jid.split('@')[0]} (${user.name})`).join('\n');

    await conn.sendMessage(m.chat, { text, mentions: users.map(u => u.jid) }, { quoted: m });
};

handler.help = ['listjadibot'];
handler.tags = ['jadibot'];
handler.command = /^(listjadibot|jadibotlist)$/i;

export default handler;
