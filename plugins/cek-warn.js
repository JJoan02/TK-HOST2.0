let handler = async (m, {
	conn,
	usedPrefix
}) => {
	let warning = global.db.data.users[m.sender].warning

	let ndy = `
*✧ Usted tiene ${warning} Advertencias*
 `.trim()
	conn.reply(m.chat, ndy, m)
}

handler.help = ['veradv']
handler.tags = ['info']
handler.command = /^(veradv)$/i

handler.register = true

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
