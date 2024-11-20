/**
 * Este código detecta enlaces de WhatsApp y HTTP/HTTPS en un grupo de WhatsApp,
 * aplicando un sistema de advertencias al usuario en privado. Si el usuario acumula
 * 3 advertencias, será expulsado del grupo. El mensaje de expulsión y la razón se
 * enviarán en el chat privado del usuario. Además, si el bot no tiene permisos de administrador,
 * informa al grupo etiquetando a los administradores para que le den los permisos necesarios.
 * 
 * Actualizado por Joan TK
 */

const isLinkWaChannel = /whatsapp.com/i
const isLinkHttp = /http|https/i

export async function before(m, isAdmin, isBotAdmin) {
    // Ignorar mensajes enviados por el bot, administradores y el propietario
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false

    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let bot = global.db.data.settings[this.user.jid] || {}

    // Detectar enlaces
    const isAntiLinkWa = isLinkWa.exec(m.text)
    const isAntiLinkWaChannel = isLinkWaChannel.exec(m.text)
    const isAntiLinkHttp = isLinkHttp.exec(m.text)
    let hapus = m.key.participant
    let bang = m.key.id

    // Verificar si el usuario es administrador, bot o propietario
    if (isAdmin || m.fromMe || m.sender === this.user.jid) return true

    // Manejar enlaces de WhatsApp
    if (chat.antiLinkWaChannel && isAntiLinkWaChannel) {
        await this.reply(m.chat, "*[ Link Detectado ]*", m)
        if (!isBotAdmin) {
            return this.reply(m.chat, `El bot no tiene permisos de administrador para gestionar los enlaces.\n@${await this.getName(m.chat)}`, m)
        }

        // Si no es un admin, eliminar el mensaje y enviar advertencia en privado
        user.warn = user.warn || 0
        user.warn += 1
        if (user.warn >= 3) {
            user.banned = true
            this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
            // Enviar mensaje privado con la razón de la expulsión
            await this.sendMessage(m.sender, { text: `⚠️ Has sido expulsado del grupo por acumular 3 advertencias debido a que enviaste un enlace de WhatsApp. Comunícate con los administradores para ser agregado nuevamente.` })
        } else {
            await this.reply(m.sender, `⚠️ *Advertencia* ⚠️\nHas enviado un enlace de WhatsApp. Esto será una advertencia. Acumula 3 para ser expulsado del grupo.`, m)
        }

        return this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: hapus } })
    }

    // Manejar enlaces HTTP
    if (chat.antiLinkHttp && isAntiLinkHttp) {
        await this.reply(m.chat, "*[ Link Detectado ]*", m)
        if (!isBotAdmin) {
            return this.reply(m.chat, `El bot no tiene permisos de administrador para gestionar los enlaces.\n@${await this.getName(m.chat)}`, m)
        }

        // Si no es un admin, eliminar el mensaje y enviar advertencia en privado
        user.warn = user.warn || 0
        user.warn += 1
        if (user.warn >= 3) {
            user.banned = true
            this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
            // Enviar mensaje privado con la razón de la expulsión
            await this.sendMessage(m.sender, { text: `⚠️ Has sido expulsado del grupo por acumular 3 advertencias debido a que enviaste un enlace HTTP/HTTPS. Comunícate con los administradores para ser agregado nuevamente.` })
        } else {
            await this.reply(m.sender, `⚠️ *Advertencia* ⚠️\nHas enviado un enlace HTTP/HTTPS. Esto será una advertencia. Acumula 3 para ser expulsado del grupo.`, m)
        }

        return this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: hapus } })
    }

    return true
}
