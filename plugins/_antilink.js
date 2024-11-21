// ===========================================================
// 📌 Actualizado por JoanTK
// ✦ Función: Anti-link avanzado con control de privilegios y gestión de infracciones.
// ✦ Características principales:
//   1. **Exclusión para Admins, Owner y Bot**: 
//      - Los administradores, el propietario del grupo y el bot no son afectados por el sistema anti-link.
//   2. **Gestión de Infracciones**:
//      - Si un usuario envía un enlace de grupo, se incrementa su contador de infracciones.
//      - Después de 3 infracciones, el usuario es expulsado del grupo y su contador se reinicia.
//   3. **Período de gracia de 24 horas**:
//      - Si han pasado más de 24 horas desde la última infracción, el contador de infracciones se reinicia.
//   4. **Notificación privada**:
//      - Los usuarios no privilegiados reciben una notificación privada cuando envían un enlace.
//      - No se envían notificaciones a admins, owner o bot.
// ===========================================================

const linkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true;  // Si es un mensaje enviado por el bot, no hacer nada
    if (!m.isGroup) return false;  // Solo aplicar en grupos

    // Obtener información de chat y usuario
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    
    // Verificar si el mensaje contiene un enlace de grupo de WhatsApp
    const isGroupLink = linkRegex.exec(m.text);

    // Verificar si el usuario es Owner, Admin, o el Bot
    if (isOwner || isAdmin || isBotAdmin) {
        return true;  // Si es Owner, Admin o el bot, ignorar el anti-link
    }

    // Si el chat tiene activado el anti-link y el mensaje contiene un enlace de grupo
    if (chat.antiLink && isGroupLink) {
        // Reiniciar contador después de 24 horas si no hay violación
        const currentTime = new Date().getTime();
        const lastWarningTime = user.lastWarningTime || 0;
        const timePassed = currentTime - lastWarningTime;

        // Si han pasado más de 24 horas, reiniciar el contador de infracciones
        if (timePassed > 86400000) {  // 86400000 ms = 24 horas
            user.antiLinkCount = 0;
        }

        // Comprobar el contador de infracciones
        if (user.antiLinkCount >= 3) {
            // Expulsar al usuario después de 3 intentos
            await conn.sendMessage(m.chat, { text: `❀ Has sido expulsado debido a tus repetidos intentos de compartir enlaces no permitidos. Comunícate con un administrador si consideras que fue un error.` });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            user.antiLinkCount = 0;  // Restablecer contador tras expulsión
        } else {
            user.antiLinkCount = (user.antiLinkCount || 0) + 1;  // Incrementar contador de infracciones

            // Si el usuario no es expulsado, eliminar su mensaje y notificarle en privado
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.sender, {
                text: `❀ No se permite compartir enlaces de grupos externos. Este es tu intento número ${user.antiLinkCount}. Si sigues infringiendo las normas, serás expulsado del grupo.`
            });
        }

        // Registrar la hora de la última advertencia
        user.lastWarningTime = currentTime;
        return false;  // Evitar que el mensaje se quede en el chat del grupo
    }

    return true;  // Permitir el mensaje si no contiene un enlace de grupo
}
