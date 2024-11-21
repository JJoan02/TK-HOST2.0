let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
    
    // Mensaje de error por falta de menciones
    let kickte = `✦ Por favor menciona al usuario(s) que deseas eliminar o responde a su mensaje.`

    // Validar si se menciona a alguien o se responde a un mensaje
    if (!m.mentionedJid[0] && !m.quoted) {
        return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });
    }

    // Identificar a los usuarios objetivo
    let users = m.mentionedJid.length > 0 
                ? m.mentionedJid 
                : [m.quoted.sender];

    // Filtrar para evitar eliminar a administradores o al propietario
    let admins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id);
    let owner = m.chat.split`-`[0];

    let toKick = users.filter(user => !admins.includes(user) && user !== owner);

    // Mensaje si no hay usuarios válidos para eliminar
    if (toKick.length === 0) {
        return m.reply(`✦ No se puede eliminar a administradores ni al propietario del grupo.`);
    }

    // Intentar eliminar a los usuarios y enviar mensajes
    for (let user of toKick) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

            // Mensaje privado al usuario eliminado
            await conn.sendMessage(user, {
                text: `✦ Has sido eliminado del grupo *${m.chat}*.\n\nSi crees que esto fue un error, comunícate con un administrador para más información.`,
                mentions: [user],
            });

            // Confirmación al ejecutor
            m.reply(`✦ El usuario @${user.split('@')[0]} ha sido eliminado.`, m.chat, { mentions: [user] });

        } catch (e) {
            // Notificar al ejecutor si ocurre un error
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
