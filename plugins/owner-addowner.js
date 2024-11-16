let handler = async (m, { conn, text }) => {
if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '✦ Comando no disponible para subbots', m )
}
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    if (!who) throw m.reply(`✧ Menciona a un usuario`)
    if (global.owner.includes(who.split`@`[0])) throw m.reply('El usuario ya es Owner!')
    global.owner.push(`${who.split`@`[0]}`)
    conn.reply(m.chat, `@${who.split`@`[0]} ahora es Owner!`, m, {
        contextInfo: {
            mentionedJid: [who]
        }
    })

}
handler.help = ['addowner @user']
handler.tags = ['owner']
handler.command = /^(add|tambah|\+)owner$/i

handler.owner = true

export default handler
