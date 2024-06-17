// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código detecta y gestiona enlaces compartidos en un chat grupal de WhatsApp. Si un miembro no administrador comparte un enlace, se le advierte o se le elimina del grupo después de múltiples advertencias.

// Expresión regular para detectar enlaces en el mensaje
let linkRegex = /https?:/i;

export async function before(m, { isAdmin, isBotAdmin, text }) {
  // Verificar si el mensaje proviene del bot o si no es un grupo
  if (m.isBaileys && m.fromMe) return !0;
  if (!m.isGroup) return !1;

  // Obtener datos del chat y del bot de la base de datos global
  let chat = global.db.data.chats[m.chat];
  let delet = m.key.participant;
  let bang = m.key.id;
  let toUser = `${m.sender.split("@")[0]}`;
  let aa = toUser + '@s.whatsapp.net';
  let bot = global.db.data.settings[this.user.jid] || {};
  const isGroupLink = linkRegex.exec(m.text);
  const grupo = `https://chat.whatsapp.com`;

  // Si un administrador envía un enlace y está habilitada la detección de enlaces, enviar un mensaje de advertencia
  if (isAdmin && chat.antiLink2 && m.text.includes(grupo)) return m.reply(`${lenguajeGB['smsAdwa']()}`);

  // Si un no administrador envía un enlace y está habilitada la detección de enlaces
  if (chat.antiLink2 && isGroupLink && !isAdmin) {
    // Si el bot no es administrador, enviar un mensaje indicando que no puede actuar
    if (!isBotAdmin) return m.reply(`${lenguajeGB['smsAvisoFG']()} ${lenguajeGB['smsAllAdmin']()}`);

    // Si el enlace es del grupo actual, enviar un mensaje indicando que es el mismo enlace
    const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
    if (m.text.includes(linkThisGroup)) return m.reply(lenguajeGB['smsWaMismoEnlace']());

    // Manejar las advertencias y posibles expulsiones
    let warningCount = chat.warningCount?.[m.sender] || 0;

    // Primera advertencia
    if (warningCount === 0) {
      await conn.reply(m.chat, `⚠️ *Advertencia 1* ⚠️\n@${toUser}, ¡no compartas enlaces de otros grupos! 😠\nUna más y serás eliminado.`, null, { mentions: [aa] });
    } 
    // Segunda advertencia
    else if (warningCount === 1) {
      await conn.reply(m.chat, `⚠️⚠️ *Advertencia 2* ⚠️⚠️\n@${toUser}, ¡te lo dije! 🚨\nUna más y adiós.`, null, { mentions: [aa] });
    } 
    // Tercera advertencia y expulsión
    else if (warningCount >= 2) {
      await conn.reply(m.chat, `🚨 *Eliminación* 🚨\n@${toUser}, te advertí y no escuchaste. 👋 Adiós!`, null, { mentions: [aa] });
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    }

    // Eliminar el mensaje que contiene el enlace
    await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
    chat.warningCount[m.sender] = (warningCount + 1) % 3; // Resetea después de la tercera advertencia
  }

  // Si las restricciones no están habilitadas, enviar un mensaje indicando que solo el propietario puede cambiar la configuración
  if (!bot.restrict) return m.reply(`${lenguajeGB['smsAvisoAG']()}${lenguajeGB['smsSoloOwner']()}`);

  return !0;
}
