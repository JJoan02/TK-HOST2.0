let handler = async (m, { conn, args, command }) => {
  let totalf = Object.values(global.plugins).filter(
    (v) => v.help && v.tags
  ).length
  conn.reply(m.chat, `✧ Funciones totales: ${totalf}`, m)
}

handler.help = ['totalcmd']
handler.tags = ['info']
handler.command = ['totalcmd']
export default handler