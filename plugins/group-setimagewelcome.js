let handler = async (m, { conn, text, isROwner, isOwner, isAdmin, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sWelcomeImageLink = text
    m.reply('Imagen de bienvenida cambiada')
  } else throw m.reply(`Necesito el link de la imagen, si no cuenta con uno use el comando .tourl`)
}

handler.help = ['setimagewelcome <txt>']
handler.tags = ['group']
handler.command = /^(setimagewelcome|setimagewel)$/i
handler.group = true
handler.admin = true

export default handler