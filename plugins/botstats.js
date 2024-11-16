import fetch from 'node-fetch'
import fs from 'fs'
let handler = async (m, { conn, generateWAMessageFromContent, }) => {
    let { anon, anticall, antispam, antitroli, backup, jadibot, groupOnly, nsfw, statusupdate, autogetmsg, antivirus, publicjoin } = global.db.data.settings[conn.user.jid]
    const chats = Object.keys(await conn.chats)
    const groups = Object.keys(await conn.groupFetchAllParticipating())
    const block = await conn.fetchBlocklist()
       let tag = `@${m.sender.replace(/@.+/, '')}`
  let mentionedJid = [m.sender]
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let sts = `┌────〔 Estado 〕───⬣
│✧  Runtina ${uptime}
│✧  *${groups.length}* Grupos
│✧  *${chats.length - groups.length}* Pv's
│✧  *${Object.keys(global.db.data.users).length}* Usuarios
│✧  ${block == undefined ? '*0* Bloqueados' : '*' + block.length + '* Desbloqueados'}
│✧  *${Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned).length}* Chats Baneados
│✧  *${Object.entries(global.db.data.users).filter(user => user[1].banned).length}* Usuarios Baneados
╰────────────⬣

┌───〔 Modos 〕───⬣
│✧  ${anon ? '✅' : '❌'} *Chat Anonimo*
│✧  ${anticall ? '✅' : '❌'} *Anti Llamar*
│✧  ${antispam ? '✅' : '❌'} *Anti Spam*
│✧  ${antitroli ? '✅' : '❌'} *Anti Bug Text*
│✧  ${backup ? '✅' : '❌'} *Auto Backup DB*
│✧  ${groupOnly ? '✅' : '❌'} *Modo Grupo*
│✧  ${jadibot ? '✅' : '❌'} *Serbot*
│✧  ${nsfw ? '✅' : '❌'} *Modo Nsfw*
╰────────────⬣`

m.reply(sts)

}

handler.help = ['botstat']
handler.tags = ['info']
handler.command = /^botstat?$/i

export default handler

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}