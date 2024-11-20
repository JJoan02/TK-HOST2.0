/**
 * Este código detecta enlaces de WhatsApp y HTTP/HTTPS en un grupo de WhatsApp.
 * Si el enlace es detectado y el usuario no es administrador o propietario, se aplica
 * un sistema de advertencias y expulsiones en el grupo, enviando la notificación
 * correspondiente al usuario en su chat privado.
 * 
 * Actualizado por Joan TK
 */

const isLinkWaChannel = /whatsapp.com/i
const isLinkHttp = /http|https/i 

export async function before(m, isAdmin, isBotAdmin) {
    // Ignorar mensajes enviados por el bot, administradores y el propietario
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    let bot = global.db.data.settings[this.user.jid] || {};

    // Detectar enlaces
    const isAntiLinkWa = isLinkWa.exec(m.text);
    const isAntiLinkWaChannel = isLinkWaChannel.exec(m.text);
    const isAntiLinkHttp = isLinkHttp.exec(m.text);
    let hapus = m.key.participant;
    let bang = m.key.id;

    // Verificar si el mensaje contiene enlaces de WhatsApp
    if (chat.antiLinkWaChannel && isAntiLinkWaChannel) {
        await this.reply(m.chat, "*[ Link Detectado ]*", m);
        // Si el bot no tiene permisos de administrador, informar al grupo
        if (!isBotAdmin) {
            return this.reply(m.chat, `El bot no tiene permisos de administrador para gestionar los enlaces.\n@${await this.getName(m.chat)}`, m);
        }

        // Si el usuario no es administrador, proceder con advertencia y expulsión
        if (!isAdmin) {
            user.warn = user.warn || 0;
            user.warn += 1;

            if (user.warn >= 3) {
                user.banned = true;
                // Enviar mensaje privado al usuario con la razón de la expulsión
                await this.sendMessage(m.sender, { text: `⚠️ Has sido expulsado del grupo por acumular 3 advertencias debido a que enviaste un enlace de WhatsApp. Comunícate con los administradores para ser agregado nuevamente.` });
                // Expulsar al usuario del grupo sin enviar mensaje en el grupo
                this.groupParticipantsUpdate(m.chat, [m.sender], "remove");
            } else {
                await this.sendMessage(m.sender, { text: `⚠️ *Advertencia* ⚠️\nHas enviado un enlace de WhatsApp. Esta es una advertencia. Acumula 3 para ser expulsado del grupo.` });
            }

            return this.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: bang,
                    participant: hapus
                }
            });
        }
    }

    // Verificar si el mensaje contiene enlaces HTTP/HTTPS
    if (chat.antiLinkHttp && isAntiLinkHttp) {
        await this.reply(m.chat, "*[ Link Detectado ]*", m);
        // Si el bot no tiene permisos de administrador, informar al grupo
        if (!isBotAdmin) {
            return this.reply(m.chat, `El bot no tiene permisos de administrador para gestionar los enlaces.\n@${await this.getName(m.chat)}`, m);
        }

        // Si el usuario no es administrador, proceder con advertencia y expulsión
        if (!isAdmin) {
            user.warn = user.warn || 0;
            user.warn += 1;

            if (user.warn >= 3) {
                user.banned = true;
                // Enviar mensaje privado al usuario con la razón de la expulsión
                await this.sendMessage(m.sender, { text: `⚠️ Has sido expulsado del grupo por acumular 3 advertencias debido a que enviaste un enlace HTTP/HTTPS. Comunícate con los administradores para ser agregado nuevamente.` });
                // Expulsar al usuario del grupo sin enviar mensaje en el grupo
                this.groupParticipantsUpdate(m.chat, [m.sender], "remove");
            } else {
                await this.sendMessage(m.sender, { text: `⚠️ *Advertencia* ⚠️\nHas enviado un enlace HTTP/HTTPS. Esta es una advertencia. Acumula 3 para ser expulsado del grupo.` });
            }

            return this.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: bang,
                    participant: hapus
                }
            });
        }
    }

    return true;
}
