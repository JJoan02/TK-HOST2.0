import fetch from 'node-fetch'
let handler = async (m, { conn, usedPrefix, text, args, command }) => {
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let pp = await conn.profilePictureUrl(who).catch(_ => hwaifu.getRandom())
let name = await conn.getName(who)

  const sentMsg = await conn.sendContactArray(m.chat, [
    [`${nomorown}`, `${await conn.getName(nomorown+'@s.whatsapp.net')}`, `✧ Developer Bot `, `No famoso`, `m46234391@gmail.com`, `🇦🇷 Argentina`, `📍 https://github.com/MauroAzcurra`, `✧ Owner Waguri Ai`],
    [`${conn.user.jid.split('@')[0]}`, `${await conn.getName(conn.user.jid)}`, `✧ Whatsapp Bot`, `✧ No hagas spam.`, `m46234391@gmail.com`, `🇦🇷 Argentina`, `📍 https://github.com/MauroAzcurra/Waguri-Ai`, `Si hay un error habla con mi owner ☺`]
  ], fkontak)
  await m.reply(`Hola @${m.sender.split(`@`)[0]} solo habla con mi Owner por temas del bot.`)
  } 

handler.help = ['owner', 'creador']
handler.tags = ['main', 'info']
handler.command = /^(owner|creador)/i
export default handler