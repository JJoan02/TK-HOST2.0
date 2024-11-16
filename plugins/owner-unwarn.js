let handler = async (m, { conn, text }) => {
    if (!text) throw m.reply('✧ A quien saco las advertencias?, Menciona al usuario luego de escribir el comando')
    let who
    if (m.isGroup) who = m.mentionedJid[0]
    else who = m.chat
    if (!who) throw m.reply('✧ A quien saco las advertencias?, Menciona al usuario luego de escribir el comando')
    let users = global.db.data.users
    users[who].warning = 0
    conn.reply(m.chat, '✧ Listo!', m)
}
handler.help = ['unwarn']
handler.tags = ['owner']
handler.command = /^unwarn(user)?$/i
handler.rowner = true

export default handler
