// ===========================================================
// 📌 Actualizado por JoanTK
// ✦ Función: Eliminar usuarios de un grupo de chat utilizando comandos.
// ✦ Características principales:
//   1. **Verificación avanzada**:
//      - Evita eliminar administradores o al propietario del grupo.
//      - Notifica al ejecutor si intenta realizar esta acción.
//   2. **Mensajes personalizados**:
//      - Incluye el nombre del grupo en el mensaje privado al usuario eliminado.
//      - Confirma al ejecutor si la eliminación fue exitosa o falló.
//   3. **Compatibilidad con múltiples menciones**:
//      - Permite eliminar a varios usuarios mencionados o respondidos en un mensaje.
//   4. **Manejo de errores**:
//      - Notifica al ejecutor si la eliminación falla (por ejemplo, falta de permisos).
//   5. **Registro opcional**:
//      - Puedes implementar un sistema de log para auditar las acciones realizadas.
// ===========================================================

let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
    
    // Mensaje de error si no se menciona a nadie
    let kickte = `✦ Por favor menciona al usuario(s) que deseas eliminar o responde a su mensaje.`;

    // Verificar si se menciona a alguien o se responde a un mensaje
    if (!m.mentionedJid[0] && !m.quoted) {
        return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });
    }

    // Identificar a los usuarios objetivo
    let users = m.mentionedJid.length > 0 
                ? m.mentionedJid 
                : [m.quoted.sender];

    // Obtener la lista de administradores y el propietario del grupo
    let admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id);
    let owner = m.chat.split`-`[0];

    // Filtrar usuarios que no sean administradores ni propietario
    let toKick = users.filter(user => !admins.includes(user) && user !== owner);

    // Mensaje si no hay usuarios válidos para eliminar
    if (toKick.length === 0) {
        return m.reply(`✦ No se puede eliminar a administradores ni al propietario del grupo.`);
    }

    // Intentar eliminar a los usuarios y enviar mensajes
    for (let user of toKick) {
        try {
            // Intentar eliminar al usuario del grupo
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

            // Enviar mensaje privado al usuario eliminado
            await conn.sendMessage(user, {
                text: `✦ Has sido eliminado del grupo *${m.chat}*.\n\nSi crees que esto fue un error, comunícate con un administrador para más información.`,
                mentions: [user],
            });

            // Confirmar al ejecutor que el usuario fue eliminado
            m.reply(`✦ El usuario @${user.split('@')[0]} ha sido eliminado.`, m.chat, { mentions: [user] });

        } catch (e) {
            // Notificar al ejecutor si hay un problema al eliminar al usuario
            m.reply(`✦ Hubo un problema al intentar eliminar a @${user.split('@')[0]}.`, m.chat, { mentions: [user] });
        }
    }
};

handler.help = ['kick *@user*']
handler.tags = ['group']
handler.command = ['kick', 'expulsar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler;
