import { toAudio } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    if (!/video|audio/.test(mime)) throw m.reply(`✧ Responde a un *Video* o *Nota de voz* con el comando *${usedPrefix + command}*`);
    let media = await q.download?.()
    if (!media) throw ''
    let audio = await toAudio(media, 'mp4')
    if (!audio.data) throw ''
    //conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, { mimetype: 'audio/mp4' })
    conn.sendFile(m.chat, audio.data, 'audio.mp3', '', m, null, { mimetype: 'audio/mp4', asDocument: chat.useDocument })
}
handler.help = ['tomp3 (msj)']
handler.tags = ['audio']

handler.command = /^to(mp3|a(udio)?)$/i
handler.register = true

export default handler