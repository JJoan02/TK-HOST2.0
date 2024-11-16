let handler = async (m, { conn, usedPrefix, text, command }) => {
    let hash = text
    if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256.toString('hex')
    if (!hash) throw m.reply(`Error hash`)
    let sticker = global.db.data.sticker
    if (sticker[hash] && sticker[hash].locked) throw m.reply('Este *Sticker* ya está configurado')
    delete sticker[hash]
    m.reply(`✧ Listo!`)
}


handler.help = ['cmd'].map(v => 'del' + v + ' <txt>')
handler.tags = ['database', 'premium']
handler.command = ['delcmd']

handler.register = true
handler.premium = true

export default handler
