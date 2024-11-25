import { xpRange, canLevelUp, findLevel } from '../lib/levelling.js'
import fetch from 'node-fetch'

let handler = m => m
handler.all = async function (m) {
    let user = global.db.data.users[m.sender]
    if (!user.autolevelup) return !0

    let users = Object.entries(global.db.data.users).map(([key, value]) => {
        return { ...value, jid: key }
    })
    let pp = './src/avatar_contact.png'
    let who = m.sender
    let exp = global.db.data.users[m.sender].exp
    let wm = global.author
    let discriminator = who.substring(9, 13)
    let sortedLevel = users.map(toNumber('level')).sort(sort('level'))
    let usersLevel = sortedLevel.map(enumGetKey)
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    let username = conn.getName(who)
    
    try {
        pp = await conn.profilePictureUrl(who).catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
    } catch (e) {}
    
    finally {
        if (!user.autolevelup) return !0
        let before = user.level * 1
        while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++
        if (before !== user.level) {
            user.role = global.db.data.users[m.sender].role
            let tag = `@${m.sender.replace(/@.+/, '')}`
            let levelUpMessage = `🎉 *¡Felicidades, ${tag}! 🎉*

✨ Has subido de nivel: *${before} ➠ ${user.level}* ✨

📊 *Rol:* ${user.role}
⚡ *XP Actual:* ${exp} xp

Sigue participando para seguir subiendo de nivel. ¡Admin-TK siempre está aquí para apoyarte! 🚀`
            await conn.sendFile(m.chat, pp, 'Thumb.jpg', levelUpMessage.trim(), m, { mentions: [m.sender] })
        }
    }
}
export default handler

function sort(property, ascending = true) {
    if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
    else return (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
    if (property) return (a, i, b) => {
        return { ...b[i], [property]: a[property] === undefined ? _default : a[property] }
    }
    else return a => a === undefined ? _default : a
}

function enumGetKey(a) {
    return a.jid
}
