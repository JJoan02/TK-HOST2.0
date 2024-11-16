import fs from 'fs'
let handler = async (m, { conn, text }) => {
if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, '✦ Comando no disponible para subbots', m )
}
    m.reply('✧ Enviando sesión del bot.')
    let sesi = await fs.readFileSync('./sessions/creds.json')
    return await conn.sendMessage(m.chat, { document: sesi, mimetype: 'application/json', fileName: 'creds.json' }, { quoted: m })
}
handler.help = ['getsession']
handler.tags = ['owner']
handler.command = /^(g(et)?ses?si(on)?(data.json)?)$/i

handler.rowner = true

export default handler
