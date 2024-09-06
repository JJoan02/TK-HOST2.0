import axios from 'axios';
export default async function handler(m, { conn, command, args}) {
   if (!args || !args[0]) {
    await conn.sendMessage(m.chat, { text: 'Ingresa un enlace de YouTube para descargarlo.' }, { quoted: m });
    return;
   }
   try {
    let api = `https://deliriusapi-official.vercel.app/download/ytmp4?url=${encodeURIComponent(args[0])}`;
    let response = await axios.get(api);
    let data = response.data;
    let url = data.download.url || undefined;
    if (data.status && url) {
     let txt = `
- *Descargando :* ${data.title}

> *Duración :* ${data.duration}
> *Vistas :* ${data.views?.toLocaleString('de-DE') || 0}
> *Canal :* ${data.author}
> *Enlace :* ${args[0]}`.trim();
     await conn.sendMessage(m.chat, { image: { url: data.image }, caption: txt, mentions: [m.sender] }, { quoted: m });
     let res = await axios.get(url, { responseType: 'arraybuffer' });
     switch (command) {
      case 'playdoc':
       await conn.sendMessage(m.chat, { document: res, mimetype: 'audio/mp3', caption: '', mentions: [m.sender] }, { quoted: m });
       break;
      case 'play2doc':
       await conn.sendMessage(m.chat, { document: res, mimetype: 'video/mp4', caption: '', mentions: [m.sender] }, { quoted: m });
       break;
     }
    } else {
     await conn.sendMessage(m.chat, { text: `No se pudo descargar el archivo, intentelo de nuevo.` }, { quoted: m });
    }
   } catch (e) {
    console.error(e);
    m.reply(e.toString());
  }
}
handler.command = ['playdoc', 'play2doc'];
