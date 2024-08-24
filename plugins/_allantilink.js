import fetch from 'node-fetch'

const isLinkTik = /tiktok.com/i
const isLinkYt = /youtube.com|youtu.be/i
const isLinkTel = /telegram.com|t.me/i
const isLinkFb = /facebook.com|fb.me/i
const isLinkIg = /instagram.com/i
const isLinkTw = /twitter.com|x.com/i
const isLinkDc = /discord.com|discord.gg/i
const isLinkTh = /threads.net/i
const isLinkTch = /twitch.tv/i

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
    if (!m.isGroup) return
    if (isAdmin || isOwner || m.fromMe || isROwner || !isBotAdmin) return

    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[this.user.jid] || {}
    let delet = m.key.participant
    let bang = m.key.id
    let toUser = `${m.sender.split("@")[0]}`
    let aa = toUser + '@s.whatsapp.net'
    let warnings = chat.warnings || {}

    const isAntiLinkTik = isLinkTik.exec(m.text)
    const isAntiLinkYt = isLinkYt.exec(m.text)
    const isAntiLinkTel = isLinkTel.exec(m.text)
    const isAntiLinkFb = isLinkFb.exec(m.text)
    const isAntiLinkIg = isLinkIg.exec(m.text)
    const isAntiLinkTw = isLinkTw.exec(m.text)
    const isAntiLinkDc = isLinkDc.exec(m.text)
    const isAntiLinkTh = isLinkTh.exec(m.text)
    const isAntiLinkTch = isLinkTch.exec(m.text)

    const detectLink = async (isAntiLink, midMessage, emote) => {
        if (isAntiLink) {
            if (!warnings[m.sender]) {
                warnings[m.sender] = 1
                chat.warnings = warnings
                await conn.reply(m.chat, `🚨 *Advertencia 1 de 2* 🚨\n\n¡${emote}! ¡Qué travieso, *@${toUser}*! 🙃 No puedes compartir enlaces de ${midMessage} aquí. 😏 Esta es tu primera y última advertencia. ¡La próxima, estás fuera! 🤭`, null, { mentions: [aa] })
            } else if (warnings[m.sender] === 1) {
                await conn.reply(m.chat, `😈 *Oh no, *@${toUser}*, lo hiciste otra vez...* \n\nTe lo advertí, no más enlaces de ${midMessage} aquí. 🚫 ¡Hasta nunca, pecador del ciberespacio! 🦸‍♂️`, null, { mentions: [aa] })
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
                let remove = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                if (remove[0].status !== '404') {
                    delete warnings[m.sender]
                }
                chat.warnings = warnings
            }
        }
    }

    if (chat.antiTiktok) await detectLink(isAntiLinkTik, "TikTok", "🎵")
    if (chat.antiYoutube) await detectLink(isAntiLinkYt, "YouTube", "📹")
    if (chat.antiTelegram) await detectLink(isAntiLinkTel, "Telegram", "📲")
    if (chat.antiFacebook) await detectLink(isAntiLinkFb, "Facebook", "📘")
    if (chat.antiInstagram) await detectLink(isAntiLinkIg, "Instagram", "📸")
    if (chat.antiTwitter) await detectLink(isAntiLinkTw, "X/Twitter", "🐦")
    if (chat.antiDiscord) await detectLink(isAntiLinkDc, "Discord", "🎮")
    if (chat.antiThreads) await detectLink(isAntiLinkTh, "Threads", "🧵")
    if (chat.antiTwitch) await detectLink(isAntiLinkTch, "Twitch", "🎮")

    return !0
}

export default handler
