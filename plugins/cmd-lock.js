let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.quoted) throw m.reply('✧ Responde al *Sticker*!')
    if (!m.quoted.fileSha256) throw m.reply('???')
    let sticker = db.data.sticker
    let hash = m.quoted.fileSha256.toString('hex')
    if (!(hash in sticker)) throw m.reply('✧ *Sticker* no registrado')
    sticker[hash].locked = !/^un/i.test(command)
    m.reply('✧ Listo!')
} 
handler.help = ['un', ''].map(v => v + 'lockcmd')
handler.tags = ['database']
handler.command = /^(un)?lockcmd$/i

handler.premium = true

export default handler
