let handler = async (m, { conn, text, isROwner, isOwner, isAdmin, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sByeImageLink = text
    m.reply('Imagen de despedida cambiada')
  } else throw m.reply(`Necesito el link de la imagen, si no cuenta con uno use el comando .tourl`)
}

handler.help = ['setimagebye <txt>']
handler.tags = ['group']
handler.command = /^(setimagebye|setimagebye)$/i
handler.group = true
handler.admin = true

export default handler