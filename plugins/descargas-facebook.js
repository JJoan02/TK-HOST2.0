import axios from 'axios';
export default async function handler(m, { conn, command, args }) {
 if (!args || !args[0]) {
  await conn.sendMessage(m.chat, { text: 'Ingresa un enlace de Facebook' }, { quoted: m });
  return;
 }
  if (!args[0].match(/www.facebook.com|facebook.com|fb.watch/g)) {
   await sock.sendMessage(m.chat, { text: 'El enlace ingresado no es válido para Facebook.' }, { quoted: m });
   return;
  }
 try {
  let api = `https://deliriusapi-official.vercel.app/download/facebook?url=${args[0]}`;
  let response = await axios.get(api);
  let data = response.data;
  if (data && data.urls && data.urls.length > 0) {
   let isHdAvailable = data.isHdAvailable || false;
   let url = isHdAvailable ? data.urls.find(link => link.hd)?.hd : data.urls.find(link => link.sd)?.sd;
   if (url) {
    let res = await axios.get(url, { responseType: 'arraybuffer' });
    await conn.sendMessage(m.chat, { video: res.data, mimetype: 'video/mp4', caption: data.title }, { quoted: m });
   } else {
    await conn.sendMessage(m.chat, { text: 'No se encontró un enlace de video válido.' }, { quoted: m });
   }
  } else {
   await conn.sendMessage(m.chat, { text: 'No se encontraron URLs en la respuesta.' }, { quoted: m });
  }
 } catch (e) {
  console.error(e);
  m.reply(e);
 }
}
handler.command = ['facebook', 'fb'];
