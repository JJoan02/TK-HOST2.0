let handler = async (m, { conn, usedPrefix }) => {
	await conn.fetchBlocklist().then(async data => {
		let txt = `*「  Nuneros Bloqueados/BlackList 」*\n\n*Total:* ${data.length}\n\n┌─\n`
		for (let i of data) {
			txt += `├ @${i.split("@")[0]}\n`
		}
		txt += "└────"
		return conn.reply(m.chat, txt, m, { mentions: await conn.parseMention(txt) })
	}).catch(err => {
		console.log(err);
		throw m.reply('Ningun Usuario fue bloqueado!')
	})
}
handler.tags = ['info']
handler.help = ['blocklist']
handler.command = /^(blocklist)$/i

handler.owner = true

export default handler
