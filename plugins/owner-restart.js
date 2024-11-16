import { spawn } from 'child_process'
let handler = async (m, { conn, isROwner, text }) => {
if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '✦ Comando no disponible para subbots', m )
}
    if (!process.send) throw 'Dont: node main.js\nDo: node index.js'
    if (global.conn.user.jid == conn.user.jid) {
    await m.reply('```R E S T A R T . . .```')
    process.send('reset')
  } else throw '_eeeeeiiittsssss..._'
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(res(tart)?)$/i

handler.rowner = true

export default handler