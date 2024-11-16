const { MessageType, Presence } = (await import('@adiwajshing/baileys')).default

async function handler(m, { command, conn, text }) {
	this.anonymous = this.anonymous ? this.anonymous : {}
	let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
	let room = Object.values(this.anonymous).find(room => room.check(who))
	if (!room) throw m.reply('✧ No estás en el chat anónimo')
	let other = room.other(who)
  var name
  if (text) name = text
  else name = conn.getName(m.sender)
	var number = who.split('@')[0]
	let tks = `➔ Numero: ${m.sender.split`@`[0]}
➔ Nombre: ${name}`
    this.reply(m.chat, 'Enviando contacto...')
	if (other) this.reply(other, `El usuario te envío su contacto`)
	if (other) this.sendFile(other, await conn.profilePictureUrl(m.sender, 'image').catch(_ => './src/avatar_contact.png'), '', `${htki} Anonymous Chat ${htka}\n` + tks, 0,  { mentionedJid: [m.sender]})
}

handler.help = ['envctt']
handler.tags = 'anonymous'
handler.command = /^(envctt)$/i
handler.private = true

export default handler