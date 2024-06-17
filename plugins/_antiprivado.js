// CÓDIGO ADAPTADO POR https://github.com/GataNina-Li | @gata_dios

// Este código maneja el filtrado de mensajes en un bot de WhatsApp. Permite sólo ciertos comandos en mensajes privados, 
// y maneja la configuración para ignorar o archivar mensajes no autorizados en privado, dependiendo de la configuración del bot.

// Función principal antes de procesar un mensaje
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  // Función auxiliar para crear el mensaje de contacto
  function createContactMessage(sender) {
    const senderNumber = sender.split('@')[0];
    return {
      "key": { 
        "participants": "0@s.whatsapp.net", 
        "remoteJid": "status@broadcast", 
        "fromMe": false, 
        "id": "Halo" 
      }, 
      "message": { 
        "contactMessage": { 
          "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${senderNumber}:${senderNumber}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
        }
      }, 
      "participant": "0@s.whatsapp.net" 
    };
  }

  // Verificar si el mensaje es enviado por el bot mismo
  if (m.isBaileys && m.fromMe) return true;

  // Verificar si el mensaje es de un grupo
  if (m.isGroup) return false;

  // Verificar si el mensaje no tiene contenido
  if (!m.message) return true;

  // Lista de comandos permitidos en privado
  const allowedKeywords = ['serbot', 'jadibot', 'deletesesion', 'estado', 'bots'];
  if (allowedKeywords.some(keyword => m.text.includes(keyword))) return true;

  // Obtener configuraciones del bot
  const bot = global.db.data.settings[this.user.jid] || {};

  // Manejo de mensajes privados no autorizados si antiPrivate está activado
  if (bot.antiPrivate && !isOwner && !isROwner) {
    await conn.modifyChat(m.chat, 'archive'); // Archivar el chat privado
    return false;  // Ignorar el comando no permitido
  }

  return true;
}
