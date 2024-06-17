// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja la detección y gestión de enlaces de invitación a grupos de WhatsApp en un chat grupal. Si un miembro del grupo que no es administrador comparte un enlace de invitación, se le advierte o se le elimina del grupo después de múltiples advertencias.

// Expresión regular para detectar enlaces de invitación a grupos de WhatsApp
let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { isAdmin, isBotAdmin }) {
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
  if (isAdmin && chat.antiLink && m.text.includes(grupo)) return m.reply(`${lenguajeGB['smsAdwa']()}`);
  
  // Si un no administrador envía un enlace y está habilitada la detección de enlaces
  if (chat.antiLink && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      // Si el enlace es del grupo actual, enviar un mensaje indicando que es el mismo enlace
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
      if (m.text.includes(linkThisGroup)) return m.reply(lenguajeGB['smsWaMismoEnlace']());
    }
    // Si el bot no es administrador, enviar un mensaje indicando que no puede actuar
    if (!isBotAdmin) return m.reply(`${lenguajeGB['smsAvisoFG']()} ${lenguajeGB['smsAllAdmin']()}`);
    
    // Si el bot es administrador, manejar las advertencias y posibles expulsiones
    if (isBotAdmin) {
      let warningCount = chat.warningCount[m.sender] || 0;

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
    else if (!bot.restrict) return m.reply(`${lenguajeGB['smsAvisoAG']()}${lenguajeGB['smsSoloOwner']()}`);
  }

  return !0;
}
