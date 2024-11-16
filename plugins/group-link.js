import { areJidsSameUser } from '@adiwajshing/baileys'
let handler = async (m, { conn, args }) => {
    let group = m.chat
    if (/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(args[0])) group = args[0]
    if (!/^[0-9]{5,16}-?[0-9]+@g\.us$/.test(group)) throw m.reply('Ya no estoy en ese grupo')
    let groupMetadata = await conn.groupMetadata(group)
    if (!groupMetadata) throw ' :\\'
    if (!('participants' in groupMetadata)) throw ' :('
    let me = groupMetadata.participants.find(user => areJidsSameUser(user.id, conn.user.id))
    if (!me) throw m.reply('✧ No estoy en ese grupo :(')
    if (!me.admin) throw m.reply('✧ No soy admin T_T')
    m.reply('https://chat.whatsapp.com/' + await conn.groupInviteCode(group))
}
handler.help = ['linkgroup']
handler.tags = ['group']
handler.command = /^link(gro?up)?$/i


export default handler