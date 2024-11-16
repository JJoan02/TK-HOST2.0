let handler = async (m, { conn, text }) => {
    if (!text) throw m.reply('✧ A quien desbaneo?, Menciona al usuario luego de escribir el comando')
    let who
    if (m.isGroup) {
        if (!m.mentionedJid) throw m.reply('✧ A quien desbaneo?, Menciona al usuario luego de escribir el comando')
        who = m.mentionedJid[0]
    } else {
        // Check if the input is a valid phone number
        let phoneNumber = text.replace(/[^0-9]/g, '') // Remove non-numeric characters
        who = phoneNumber + '@s.whatsapp.net'
    }
    let users = global.db.data.users
    if (users[who]) {
        users[who].banned = false
        users[who].banReason = ''
        conn.reply(m.chat, '✧ Listo!', m)
    } else {
        throw m.reply('✧ El usuario no se encuentra en la base de datos.')
    }
}
handler.help = ['unban']
handler.tags = ['owner']
handler.command = /^unban(user)?$/i
handler.rowner = true

export default handler
