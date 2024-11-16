import MessageType from '@adiwajshing/baileys'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw m.reply(`*✧ Coloca los emojis para hacer la mezcla*\n\n*• Ejemplo:*\n- ${usedPrefix + command} 😂+😂\n- ${usedPrefix + command} 😂 😂\n\n[ máximo 2 emojis ]`;)

  let emojis = text.split(/[\+\s]/).filter(Boolean); // Memisahkan emoji berdasarkan '+' atau spasi
  if (emojis.length < 2) throw m.reply('✧ Máximo 2 emojis');

  if (emojis.length > 2) throw m.reply('✧ Máximo 2 emojis');

  const anu = await (await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emojis.join('_'))}`)).json();

  if (anu.results[0] == undefined) throw m.reply('✧ No hay combinación para esos emojis');

  let emix = anu.results[0].media_formats.png_transparent.url;
  let stiker = await sticker(false, emix, global.stickpack, global.stickauth);
  conn.sendFile(m.chat, stiker, null, { asSticker: true }, m);
}

handler.help = ['emojimix']
handler.tags = ['sticker']
handler.command = /^(emojimix|emix)$/i

handler.register = true

export default handler
