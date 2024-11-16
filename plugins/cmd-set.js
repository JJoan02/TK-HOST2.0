let handler = async (m, { conn, text, usedPrefix, command }) => {
    db.data.sticker = db.data.sticker || {}
    if (!m.quoted) throw m.reply(`✧ Responde a un *Sticker* con el comando *${usedPrefix + command}*`)
    if (!m.quoted.fileSha256) throw m.reply('???')
    if (!text) throw m.reply(`✧ Ejemplo:\n${usedPrefix + command} <txt>\n\n✧ Uso:\n${usedPrefix + command} .ping`)
    let sticker = db.data.sticker
    let hash = m.quoted.fileSha256.toString('base64')
    if (sticker[hash] && sticker[hash].locked) throw m.reply('Este *Sticker* ya está configurado')
    sticker[hash] = {
        text,
        mentionedJid: m.mentionedJid,
        creator: m.sender,
        at: + new Date,
        locked: false,
    }
    m.reply(`✧ Listo!`)
}


handler.help = ['cmd'].map(v => 'set' + v + ' <txt>')
handler.tags = ['database', 'premium']
handler.command = ['setcmd']
handler.premium = true

export default handler
