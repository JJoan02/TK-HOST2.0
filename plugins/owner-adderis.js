let handler = async (m, { conn, command, text, args }) => {
    if (!text) throw m.reply('✧ Menciona a un usuario luego de escribir un comando')
    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) throw m.reply('✧ Menciona a un usuario luego de escribir un comando')
    let users = global.db.data.users
    users[who].limit += 100000
    conn.reply(m.chat, '✧ Listo!', m)
}
handler.help = ['addcoins']
handler.tags = ['owner']
handler.command = /^addcoins(user)?$/i
handler.rowner = true

export default handler