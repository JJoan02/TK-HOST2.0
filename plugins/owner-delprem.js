let handler = async (m, { conn, text }) => {
    if (!text) throw m.reply('✧ Y el numero?.')
    let who
    if (m.isGroup) {
        if (!m.mentionedJid) throw m.reply('El usuario no tiene premium.')
        who = m.mentionedJid[0]
    } else {
        // Check if the input is a valid phone number
        let phoneNumber = text.replace(/[^0-9]/g, '') // Remove non-numeric characters
        who = phoneNumber + '@s.whatsapp.net'
    }
    let users = global.db.data.users
    if (users[who]) {
        users[who].premium = false
        users[who].premiumTime = 0
        conn.reply(m.chat, '✧ Listo!', m)
    } else {
        throw m.reply('✧ Usuario no encontrado.')
    }
}

handler.help = ['delprem']
handler.tags = ['owner']
handler.command = /^delprem(user)?$/i
handler.rowner = true

export default handler