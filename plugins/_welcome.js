import fetch from 'node-fetch';

export async function handleWelcome(m, { conn, groupMetadata }) {
  // Verifica si es un evento válido de bienvenida
  if (!m.action || m.action !== 'add' || !m.isGroup) return;

  try {
    // Obtener imagen de perfil del usuario que se une
    const pp = await conn.profilePictureUrl(m.participants[0], 'image').catch(
      () => 'https://pomf2.lain.la/f/b03w5p5.jpg' // Imagen por defecto si falla
    );
    const img = await (await fetch(pp)).buffer();

    // Verificar si la funcionalidad de bienvenida está habilitada
    const chat = global.db.data.chats[m.id];
    if (!chat?.bienvenida) return;

    // Mensaje de bienvenida personalizado
    const welcomeMessage = `*⭒─ׄ─ׅ─ׄ─⭒ \`BIENVENIDO\` ⭒─ׄ─ׅ─ׄ─⭒*\n\n╭── ︿︿︿︿︿ *⭒   ⭒   ⭒   ⭒   ⭒   ⭒*\n┊:⁖֟⊱┈֟፝❥ *WELCOME* :: @${m.participants[0].split`@`[0]}\n┊:⁖֟⊱┈֟፝❥  ${groupMetadata.subject}\n╰─── ︶︶︶︶ ✰⃕  ⌇ *⭒ ⭒ ⭒*   ˚̩̥̩̥*̩̩͙✩`;

    // Enviar mensaje de bienvenida al grupo
    await conn.sendMessage(m.id, { text: welcomeMessage, image: img }, { mentions: [m.participants[0]] });
  } catch (err) {
    console.error('Error en handleWelcome:', err);
  }
}
