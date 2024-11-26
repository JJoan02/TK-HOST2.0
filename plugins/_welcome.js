import fetch from 'node-fetch';

export async function handleWelcome(m, { conn, groupMetadata }) {
  if (!m.messageStubType || m.messageStubType !== 27 || !m.isGroup) return; // Verificar si es un evento válido de bienvenida

  // Obtener imagen de perfil del usuario que se une
  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(
    (_) => 'https://pomf2.lain.la/f/b03w5p5.jpg'
  );
  let img = await (await fetch(pp)).buffer();

  // Verificar si la funcionalidad de bienvenida está habilitada
  let chat = global.db.data.chats[m.chat];
  if (!chat?.bienvenida) return;

  // Mensaje de bienvenida personalizado
  let welcome = `*⭒─ׄ─ׅ─ׄ─⭒ \`ʙɪᴇɴᴠᴇɴɪᴅᴀ\` ⭒─ׄ─ׅ─ׄ─⭒*\n\n╭── ︿︿︿︿︿ *⭒   ⭒   ⭒   ⭒   ⭒   ⭒*\n┊:⁖֟⊱┈֟፝❥ *ᴡᴇʟᴄᴏᴍᴇ* :: @${m.messageStubParameters[0].split`@`[0]}\n┊:⁖֟⊱┈֟፝❥  ${groupMetadata.subject}\n╰─── ︶︶︶︶ ✰⃕  ⌇ *⭒ ⭒ ⭒*   ˚̩̥̩̥*̩̩͙✩`;

  // Enviar mensaje de bienvenida al grupo
  await conn.sendMini(m.chat, 'Bienvenida', '', welcome, img, img, 'Canal', 'Estilo');
}
