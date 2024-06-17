// Importar el módulo Baileys para manejar los tipos de mensajes
let WAMessageStubType = (await import(global.baileys)).default;

export async function before(m, { conn, participants, groupMetadata }) {
  // Verificar si el mensaje tiene un tipo de evento y si es un mensaje de grupo
  if (!m.messageStubType || !m.isGroup) return;

  // Crear un mensaje de contacto (vCard) para usar como referencia en las respuestas
  const fkontak = {
    "key": {
      "participants": "0@s.whatsapp.net",
      "remoteJid": "status@broadcast",
      "fromMe": false,
      "id": "Halo"
    },
    "message": {
      "contactMessage": {
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  };

  // Inicializar variables para el chat y el usuario
  let chat = global.db.data.chats[m.chat];
  let usuario = `@${m.sender.split`@`[0]}`;
  let inf = lenguajeGB['smsAvisoIIG']();
  let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './src/grupos.jpg';

  // Obtener mensajes predefinidos con toques humorísticos
  let nombre = lenguajeGB.smsAutodetec1(inf, usuario, m) + ' 😎 ¡Nuevo nombre, nuevo look!';
  let foto = lenguajeGB.smsAutodetec2(inf, usuario, groupMetadata) + ' 📸 ¡Miren la nueva foto del grupo!';
  let edit = lenguajeGB.smsAutodetec3(inf, usuario, m, groupMetadata) + ' ✏️ ¡Alguien editó la descripción!';
  let newlink = lenguajeGB.smsAutodetec4(inf, groupMetadata, usuario) + ' 🔗 ¡Nuevo enlace fresquito!';
  let status = lenguajeGB.smsAutodetec5(inf, groupMetadata, m, usuario) + ' 📝 ¡Nuevo estado del grupo!';
  let admingp = lenguajeGB.smsAutodetec6(inf, m, groupMetadata, usuario) + ' 👑 ¡Nuevo admin en la casa!';
  let noadmingp = lenguajeGB.smsAutodetec7(inf, m, groupMetadata, usuario) + ' 🛑 ¡Adiós admin!';

  // Manejar diferentes tipos de eventos y enviar mensajes humorísticos
  if (chat.detect && m.messageStubType == 21) {
    // Detectar cambio de nombre del grupo
    await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 22) {
    // Detectar cambio de foto del grupo
    await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 23) {
    // Detectar cambio de enlace del grupo
    await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 25) {
    // Detectar edición de la descripción del grupo
    await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 26) {
    // Detectar cambio de estado del grupo
    await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 29) {
    // Detectar nuevo administrador del grupo
    await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak });
  } else if (chat.detect && m.messageStubType == 30) {
    // Detectar remoción de administrador del grupo
    await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`, `${m.messageStubParameters[0]}`] }, { quoted: fkontak });
  } else {
    // Para otros tipos de eventos no manejados, loguear los detalles del evento
    // console.log({ messageStubType: m.messageStubType, messageStubParameters: m.messageStubParameters, type: WAMessageStubType[m.messageStubType] });
  }
}

// Exportar el manejador como el módulo predeterminado
export default handler;
