import axios from 'axios';
import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) throw m.reply(`Ejemplo de uso: ${usedPrefix + command} Waguri Edit`);
  
    let results = await yts(text);
    let tes = results.videos[0]
    
let dataos = await fetch(`https://api.zenkey.my.id/api/download/ytmp4?url=${tes.url}&apikey=zenkey`)
let dp = await dataos.json()
let { title, mediaLink } = dp.result.content[0]

await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})

 const getBuffer = async (url) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error al obtener el buffer", error);
    throw new Error("Error al obtener el buffer");
  }
}
    let videop = await getBuffer(mediaLink)
	await conn.sendFile(m.chat, videop, `${title}.mp4`, `\`✦ Pedido terminado\``, m)
	await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}
handler.help = ['playvideo'];
handler.tags = ['downloader'];
handler.command = /^(playvideo|playvid)$/i;

export default handler;