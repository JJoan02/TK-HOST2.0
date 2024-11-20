const isLinkWaChannel = /whatsapp.com/i;
const isLinkHttp = /http|https/i;

// Función para verificar si un link es de WhatsApp
const isLinkDetected = (text, regex) => regex.exec(text);

// Función para enviar una advertencia al chat privado del usuario
const sendWarningToUser = async (user, m, warningCount) => {
  const warningMessage = `*Advertencia ${warningCount}*\nHas compartido un link no permitido en el grupo. Si acumulas 3 advertencias, serás expulsado del grupo.`;
  await this.reply(user.jid, warningMessage, m);
};

// Función para manejar el enlace detectado
const handleLinkViolation = async (m, isBotAdmin, user, bang, hapus) => {
  await this.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: bang,
      participant: hapus
    }
  });

  // Incrementar el contador de advertencias
  user.warn += 1;

  // Enviar advertencia al chat privado del usuario
  await sendWarningToUser(user, m, user.warn);

  // Si el usuario llega a 3 advertencias, se le expulsa del grupo
  if (user.warn >= 3) {
    user.banned = true;
    await this.groupParticipantsUpdate(m.chat, [m.sender], "remove");
    await this.reply(user.jid, "Has alcanzado el límite de advertencias y has sido expulsado del grupo.", m);
    user.warn = 0; // Resetear el contador de advertencias
  }
};

// Función principal para procesar los links en el grupo
export async function before(m, isAdmin, isBotAdmin) {
  if (m.isBaileys && m.fromMe) return true;
  if (!m.isGroup) return false;

  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[this.user.jid] || {};

  let hapus = m.key.participant;
  let bang = m.key.id;

  // Verificar si el mensaje contiene un link de WhatsApp
  if (chat.antiLinkWaChannel && isLinkDetected(m.text, isLinkWaChannel)) {
    return handleLinkViolation(m, isBotAdmin, user, bang, hapus);
  }

  // Verificar si el mensaje contiene un link HTTP/HTTPS
  if (chat.antiLinkHttp && isLinkDetected(m.text, isLinkHttp)) {
    return handleLinkViolation(m, isBotAdmin, user, bang, hapus);
  }

  return true;
}
