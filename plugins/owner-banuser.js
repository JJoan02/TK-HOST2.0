let handler = async (m, { conn, text }) => {
    if (!text) throw m.reply('✧ Perdon, pero primero necesito una razon por cual fué baneado.')
    let parts = text.split(' ')
    let phoneNumber = parts[0].replace(/[^0-9]/g, '') // Remove non-numeric characters
    let reason = parts.slice(1).join(' ') || '' // Join the remaining parts as the reason, or set to empty string if not provided

    let who = phoneNumber + '@s.whatsapp.net'
    let users = global.db.data.users

    if (users[who]) {
        users[who].banned = true
        users[who].banReason = reason // Set the ban reason for the user
        conn.reply(m.chat, `*Usuario baneado*\n\n${reason ? '✧ Razón: ' + reason : 'Ninguna'}`, m)
    } else {
        throw m.reply('Usuario no encontrado.')
    }
}

handler.help = ['ban']
handler.tags = ['owner']
handler.command = /^ban(user)?$/i
handler.rowner = true

export default handler
