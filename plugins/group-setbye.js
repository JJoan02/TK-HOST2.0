let handler = async (m, { conn, text, isROwner, isOwner, isAdmin, usedPrefix, command }) => {
  if (text) {
    global.db.data.chats[m.chat].sBye = text
    m.reply('Mensaje de despedida configurado correctamente\n@user (Mencion)\n@subject (Nombre del grupo)\n@desc (Descripcion)')
  } else throw m.reply(`Y el texto?\n\nEjemplo:\n${usedPrefix + command} Bye bye @user!\n\n@user\n@subject\n@desc`)
}

handler.help = ['setbye <txt>']
handler.tags = ['group']
handler.command = /^(setbye|setb)$/i
handler.group = true
handler.admin = true

export default handler