import fetch from 'node-fetch';

export async function handleWelcome(m, { conn, groupMetadata }) {
  if (!m.messageStubType || m.messageStubType !== 27 || !m.isGroup) return; // Verifica si es un evento válido de bienvenida

  try {
    // Obtener imagen de perfil del usuario que se une
    const pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(
      () => 'https://pomf2.lain.la/f/b03w5p5.jpg' // Imagen por defecto si falla
    );
    const img = await (await fetch(pp)).buffer();

    // Verificar si la funcionalidad de bienvenida está habilitada
    const chat = global.db.data.chats[m.chat];
    if (!chat?.bienvenida) return;

    // Mensaje de bienvenida personalizado
    const welcomeMessage = `*⭒─ׄ─ׅ─ׄ─⭒ \`BIENVENIDO\` ⭒─ׄ─ׅ─ׄ─⭒*\n\n╭── ︿︿︿︿︿ *⭒   ⭒   ⭒   ⭒   ⭒   ⭒*\n┊:⁖֟⊱┈֟፝❥ *WELCOME* :: @${m.messageStubParameters[0].split`@`[0]}\n┊:⁖֟⊱┈֟፝❥  ${groupMetadata.subject}\n╰─── ︶︶︶︶ ✰⃕  ⌇ *⭒ ⭒ ⭒*   ˚̩̥̩̥*̩̩͙✩`;

    // Enviar mensaje de bienvenida al grupo
    await conn.sendMessage(m.chat, { text: welcomeMessage, image: img });
  } catch (err) {
    console.error('Error en handleWelcome:', err);
  }
}
