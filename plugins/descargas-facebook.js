import axios from 'axios';
export default async function handler(m, { conn, command, args }) {
   if (!args || !args[0]) {
    await conn.sendMessage(m.chat, { text: 'Ingresa un enlace de Facebook' }, { quoted: m });
    return;
   }
   try {
    let api = `https://deliriusapi-official.vercel.app/download/facebook?url=${args[0]}`;
    let response = await axios.get(api);
    let data = response.data;
    let isHdAvailable = data.isHdAvailable || false;
    let url = isHdAvailable ? data.urls.find(link => link.hd)?.hd : data.urls.find(link => link.sd)?.sd || undefined;
    if (data.urls && data.urls > 0 && url) {
     let res = await axios.get(url, { responseType: 'arraybuffer' });
     await conn.sendMessage(m.chat, { video: res.data, mimetype: 'video/mp4', caption: data.title }, { quoted: m });
    } else {
     await conn.sendMessage(m.chat, { text: 'No se pudo descargar el video, inténtalo de nuevo.' }, { quoted: m });
    }
   } catch (e) {
    console.error(e);
    m.reply(e.toString());
 }
}
handler.command = ['facebook', 'fb'];
