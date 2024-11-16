let handler = async (m, { conn, args }) => {
    let bot = conn.user.jid // Bot
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (/image/.test(mime)) {
      let img = await q.download()
      if (!img) throw m.reply(`No se pudo encontrar la foto *┰ω┰*`)
     conn.updateProfilePicture (bot, img)
    conn.reply(m.chat, '✧ Gracias por la nueva foto corazón *>ω<*!', m)
	}
    }
handler.help = ['setbotpp']
handler.tags = ['owner']
handler.command = /^(setbotpp)$/i
handler.owner = true

export default handler
