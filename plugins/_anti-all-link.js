const isLinkWaChannel = /whatsapp.com/i
const isLinkHttp = /http|https/i 

export async function before(m, isAdmin, isBotAdmin}) {
	if (m.isBaileys && m.fromMe)
		return !0
	if (!m.isGroup) return !1
	let chat = global.db.data.chats[m.chat]
	let user = global.db.data.users[m.sender]
	let bot = global.db.data.settings[this.user.jid] || {}
	const isAntiLinkWa = isLinkWa.exec(m.text)
	const isAntiLinkWaChannel = isLinkWaChannel.exec(m.text)
	const isAntiLinkHttp = isLinkHttp.exec(m.text)
	let hapus = m.key.participant
	let bang = m.key.id

	if (chat.antiLinkWaChannel && isAntiLinkWaChannel) {
		await this.reply(m.chat, "*[ Link Detectado ]*", m)
		if (!isBotAdmin) return m.reply("El bot no es *Admin*")
		if (isAdmin) return 
		if (isBotAdmin) {
			user.warn += 1
			user.banned = true
			return this.sendMessage(m.chat, {
				delete: {
					remoteJid: m.chat,
					fromMe: false,
					id: bang,
					participant: hapus
				}
			})
			return this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
		}
	}

	if (chat.antiLinkHttp && isAntiLinkHttp) {
		await this.reply(m.chat, "*[ Link Detectado ]*", m)
		if (!isBotAdmin) return m.reply("El bot no es *Admin*")
		if (isAdmin) return 
		if (isBotAdmin) {
			user.warn += 1
			user.banned = true
			return this.sendMessage(m.chat, {
				delete: {
					remoteJid: m.chat,
					fromMe: false,
					id: bang,
					participant: hapus
				}
			})
			return this.groupParticipantsUpdate(m.chat, [m.sender], "remove")
		}
	}
	return !0
}