import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) throw m.reply(`Ejemplo de uso: ${usedPrefix + command} Joji`);

let d2 = await fetch(`https://rest.cifumo.biz.id/api/downloader/spotify-search?q=${text}`)
  let dp = await d2.json()
  
let searchResults = dp.data.map((v, i) => `${i + 1}. *${v.title}*
   _✦ Popularidad:_ ${v.popularity}
   _✧ Link:_ ${v.url}`).join('\n\n');
//m.reply(searchResults)
await conn.sendFile(m.chat, "https://pomf2.lain.la/f/kekqv4y3.jpg", null, searchResults, '', m)

}
handler.help = ['spotifysearch *<consulta>*'];
handler.tags = ['search'];
handler.command = /^(spotifysearch)$/i;

export default handler;