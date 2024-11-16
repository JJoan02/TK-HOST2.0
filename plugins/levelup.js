import { canLevelUp, xpRange } from '../lib/levelling.js'
import { levelup } from '../lib/canvas.js'
import db from '../lib/database.js'

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
        let { min, xp, max } = xpRange(user.level, global.multiplier)
        throw m.reply(`
✧ Nivel *${user.level} (${user.exp - min}/${xp})*
✧ Necesitas *${max - user.exp}*
`.trim())
    }
    let before = user.level * 1
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
    if (before !== user.level) {
        let teks = `✧ ${conn.getName(m.sender)} subes de nivel`
        let str = `
${teks} 
• 🧬Nivel anterior : ${before}
• 🧬Nivel actual : ${user.level}
• 🧬Rol : ${user.role}

*_Interactua mas con el bot para subir de nivel mas rápido_*
`.trim()
        try {
            const img = await levelup(teks, user.level)
            conn.sendFile(m.chat, img, 'levelup.jpg', str, m)
        } catch (e) {
            m.reply(str)
        }
    }
}

handler.help = ['levelup']
handler.tags = ['xp']

handler.command = /^level(|up)$/i

export default handler
