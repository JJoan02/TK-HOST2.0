let handler = async (m, { conn, args, usedPrefix, command }) => {
    let isClose = { // Switch Case Like :v
        'abrir': 'not_announcement',
        'cerrar': 'announcement',
    }[(args[0] || '')]
    if (isClose === undefined)
        throw `
*✧ Ejemplo :*
  *○ ${usedPrefix + command} cerrar*
  *○ ${usedPrefix + command} abrir*
`.trim()
    await conn.groupSettingUpdate(m.chat, isClose)
}
handler.help = ['gc *abrir / cerra*']
handler.tags = ['group']
handler.command = /^(grupo|gc)$/i

handler.admin = true
handler.botAdmin = true

export default handler
