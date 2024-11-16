import PhoneNumber from 'awesome-phonenumber'
import { xpRange } from '../lib/levelling.js'
let handler = async (m, { conn, usedPrefix }) => {
  let pp = './src/avatar_contact.png'
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  try {
    pp = await conn.profilePictureUrl(who)
  } catch (e) {

  } finally {
    let { name, limit, exp, lastclaim, registered, regTime, age, level, role } = global.db.data.users[who]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let username = conn.getName(who)
    let math = max - xp
    let premium = global.db.data.users[m.sender].premiumTime
    let prems = `${premium > 0 ? 'Si': 'No'}`
    let str = `

                *PERFIL*
   • *Nombre:* ${username} ${registered ? '(' + name + ') ': ''}(@${who.replace(/@.+/, '')})
   • *Numero:* ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
   • *Link:* https://wa.me/${who.split`@`[0]}
   • *Edad:* ${registered ? age : ''}
   • *Xp:* ${exp} (${exp - min} / ${xp})
   • *Rol:* ${role}
   • *Coins:* ${limit}
   • *Estado:* ${registered ? 'Si (' + new Date(regTime) + ')': 'No'}
   • *Premium:* ${prems}
`.trim()
    let mentionedJid = [who]
    conn.sendFile(m.chat, pp, 'pp.jpg', str, m, false, { contextInfo: { mentionedJid } })
  }
}

handler.help = ['perfil [@user]']
handler.tags = ['exp']
handler.command = /^perfil$/i
export default handler