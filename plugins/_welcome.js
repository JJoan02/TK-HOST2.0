import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  // Solo eventos "user join" => stub 27
  if (m.messageStubType == 27) {
    // Intentar obtener la foto de perfil
    let ppUrl = await conn.profilePictureUrl(m.messageStubParameters[0], 'image')
      .catch(_ => 'https://qu.ax/TJkec.jpg'); // URL por defecto si falla la PFP
    
    let imgBuffer;
    try {
      let res = await fetch(ppUrl);
      // Comprobamos si la respuesta es OK
      if (!res.ok) throw new Error(`Fetch status code: ${res.status}`);
      imgBuffer = await res.buffer();
    } catch (err) {
      console.error('Error descargando la imagen de perfil:', err);
      // fallback: una imagen genérica si la principal falla
      let fallback = await fetch('https://qu.ax/TJkec.jpg');
      imgBuffer = await fallback.buffer();
    }
    
    let chat = global.db.data.chats[m.chat];
    if (chat.bienvenida) {
      let welcome = `*✦━── ──━✦ \`ʙɪᴇɴᴠᴇɴɪᴅᴀ\` ✦━── ──━✦*\n\n` +
        `╭── • ✧ • ✧ • ✧ • ✧ • ✧ •\n` +
        `│ ✦ ᴡᴇʟᴄᴏᴍᴇ: @${m.messageStubParameters[0].split`@`[0]}\n` +
        `│ ✦ ɢʀᴜᴘᴏ: *${groupMetadata.subject}*\n` +
        `╰── • ✧ • ✧ • ✧ • ✧ • ✧ •\n\n` +
        `> Lee la descripción del grupo\n` +
        `> ¿Quieres comprar un servidor?`;
      
      // Envía la bienvenida
      await conn.sendAi(m.chat, titulowm2, titu, welcome, imgBuffer, imgBuffer, canal, estilo);
    }
  }
}
