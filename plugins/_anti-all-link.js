// ===========================================================
// 📌 Actualizado por JoanTK
// ✦ Función: Anti-link avanzado con control de enlaces generales (HTTP/HTTPS, WhatsApp) y gestión de infracciones.
// ✦ Características principales:
//   1. **Exclusión para Admins, Owner y Bot**: 
//      - Los administradores, el propietario del grupo y el bot no son afectados por el sistema anti-link.
//   2. **Gestión de Infracciones**:
//      - Si un usuario envía un enlace no permitido, se incrementa su contador de infracciones.
//      - Después de 3 infracciones, el usuario es expulsado del grupo y su contador se reinicia.
//   3. **Período de gracia de 24 horas**:
//      - Si han pasado más de 24 horas desde la última infracción, el contador de infracciones se reinicia.
//   4. **Notificación privada**:
//      - Los usuarios no privilegiados reciben una notificación privada cuando envían un enlace.
//      - No se envían notificaciones a admins, owner o bot.
// ===========================================================

const isLinkDetected = (text, regex) => regex.exec(text);

const isLinkWaChannel = /whatsapp.com/i;
const isLinkHttp = /http|https/i;

const sendWarningToUser = async (user, m, warningCount) => {
  const warningMessage = `*Advertencia ${warningCount}*\nHas compartido un link no permitido en el grupo. Si acumulas 3 advertencias, serás expulsado del grupo.`;
  await this.reply(user.jid, warningMessage, m);
};

// Función para actualizar las infracciones del usuario
const updateUserViolations = async (user, m) => {
  user.warn += 1;
  if (user.warn >= 3) {
    user.banned = true;
    await this.groupParticipantsUpdate(m.chat, [m.sender], "remove");
    await this.reply(user.jid, "Has alcanzado el límite de advertencias y has sido expulsado del grupo.", m);
    user.warn = 0; // Resetear el contador de advertencias
  }
};

const handleLinkViolation = async (m, isBotAdmin, user, bang, hapus) => {
  // Eliminar el mensaje de enlace
  await this.sendMessage(m.chat, {
    delete: {
      remoteJid: m.chat,
      fromMe: false,
      id: bang,
      participant: hapus
    }
  });

  // Actualizar y manejar las advertencias
  await updateUserViolations(user, m);

  // Enviar advertencia al chat privado del usuario
  await sendWarningToUser(user, m, user.warn);
};

// Verificar si un usuario tiene permisos (Admin, Owner, o Bot)
const hasPermission = (isOwner, isAdmin, isBotAdmin) => {
  return isOwner || isAdmin || isBotAdmin;
};

// Función principal para procesar los links en el grupo
export async function before(m, isAdmin, isBotAdmin, isOwner) {
  if (m.isBaileys && m.fromMe) return true;  // Ignorar mensajes del bot
  if (!m.isGroup) return false;  // Solo en grupos

  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[this.user.jid] || {};

  let hapus = m.key.participant;
  let bang = m.key.id;

  // Verificar si el usuario tiene permisos
  if (hasPermission(isOwner, isAdmin, isBotAdmin)) return true;  // Ignorar para Owner, Admin, o Bot

  // Verificar si el mensaje contiene un link de WhatsApp
  if (chat.antiLinkWaChannel && isLinkDetected(m.text, isLinkWaChannel)) {
    return handleLinkViolation(m, isBotAdmin, user, bang, hapus);
  }

  // Verificar si el mensaje contiene un link HTTP/HTTPS
  if (chat.antiLinkHttp && isLinkDetected(m.text, isLinkHttp)) {
    return handleLinkViolation(m, isBotAdmin, user, bang, hapus);
  }

  return true;  // Permitir el mensaje si no contiene enlaces no permitidos
}
