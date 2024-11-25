import fetch from 'node-fetch'

let handler = async (m, { conn, command }) => {
    try {
        let who
        if (m.isGroup) {
            who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
        } else {
            who = m.quoted ? m.quoted.sender : m.sender
        }
        
        let pp = await conn.profilePictureUrl(who, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        let tag = `@${who.replace(/@.+/, '')}`
        let message = `✧ Aquí tienes la foto de perfil de ${tag} ✧`
        await conn.sendFile(m.chat, pp, "profile_pic.jpg", message, m, { jpegThumbnail: await (await fetch(pp)).buffer(), mentions: [who] })
    } catch (e) {
        console.error('❌ Error al obtener la foto de perfil:', e)
        let sender = m.sender
        let pp = await conn.profilePictureUrl(sender, 'image').catch((_) => "https://telegra.ph/file/24fa902ead26340f3df2c.png")
        await conn.sendFile(m.chat, pp, 'profile_pic_error.jpg', "✧ No se pudo obtener la foto de perfil mencionada, aquí está tu foto de perfil ✧", m, { jpegThumbnail: await (await fetch(pp)).buffer() })
    }
}
handler.help = ['getpp <@tag/msj>']
handler.tags = ['group']
handler.command = /^(getpp)$/i

export default handler
