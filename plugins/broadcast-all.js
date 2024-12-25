import { randomBytes } from 'crypto';

let handler = async (m, { conn, text }) => {
  // Obtiene todos los contactos registrados en el WhatsApp del bot
  let allContacts = Object.keys(conn.contacts);

  // Serializa el mensaje
  let cc = conn.serializeM(text ? m : m.quoted ? await m.getQuotedObj() : false || m);
  let teks = text ? text : cc.text;

  // Mensaje de confirmación inicial
  conn.reply(m.chat, `_Enviando mensaje a todos los contactos registrados (${allContacts.length})..._`, m);

  // Enviar el mensaje a cada contacto
  for (let id of allContacts) {
    try {
      await conn.sendMessage(
        id,
        { text: `*📢 BROADCAST 📢*\n${teks}` },
        { quoted: m }
      );
    } catch (e) {
      console.error(`Error enviando mensaje al contacto ${id}:`, e);
    }
  }

  // Mensaje final de confirmación
  m.reply('✅ Broadcast a todos los contactos finalizado.');
};

handler.help = ['sendall', 'broadcastall' 'bcall'].map(v => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(sendall|broadcastall|bcall)$/i;

handler.owner = true;

export default handler;

const randomID = (length) =>
  randomBytes(Math.ceil(length * 0.5)).toString('hex').slice(0, length);
